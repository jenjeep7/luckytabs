import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import vision from "@google-cloud/vision";
import cors from "cors";

admin.initializeApp();

const db = admin.firestore();
const visionClient = new vision.ImageAnnotatorClient();

// CORS configuration
const corsHandler = cors({ origin: true });

// Pull large dollar amounts like $800, $600, etc.
const MONEY_RE = /\$(\d{1,3}(?:,\d{3})*|\d+)/g;
// Ticket price in corners like "$3"
const PRICE_RE = /\$\s*\d+\s*/g;
// Uppercase game name (top of sheet), fallback to first big token
const NAME_RE = /^[A-Z0-9][A-Z0-9\s&'-]{4,}$/;

// Normalize "$800" -> 800 (number)
function moneyToNumber(s: string): number {
  return Number(s.replace(/\$|,/g, ""));
}

// Try to guess game name from top lines
function extractName(lines: string[]): string | null {
  for (const raw of lines.slice(0, 8)) {
    const line = raw.trim().replace(/[™©®]/g, "");
    if (NAME_RE.test(line) && !line.startsWith("$")) {
      return line.replace(/\s+/g, " ").trim();
    }
  }
  return null;
}

export const parseFlareSheet = functions.storage
  .object()
  .onFinalize(async (object) => {
    const filePath = object.name || "";
    if (!filePath.startsWith("flare-sheets/")) return;

    console.log(`Processing flare sheet: ${filePath}`);

    const boxId = filePath.split("/").pop()?.replace(/\.[^.]+$/, "") || "";
    const isTemp = boxId.startsWith("temp_");

    try {
      // Try document text detection first (best for structured text)
      let result = await visionClient.documentTextDetection(
        `gs://${object.bucket}/${filePath}`,
      );

      let full = result[0].fullTextAnnotation?.text || "";
      
      // If no text found, try regular text detection
      if (!full.trim()) {
        console.log("No text with document detection, trying text detection...");
        result = await visionClient.textDetection(
          `gs://${object.bucket}/${filePath}`,
        );
        full = result[0].fullTextAnnotation?.text || "";
      }

      if (!full.trim()) {
        console.log("No text detected in image with either method");
        
        if (isTemp) {
          // Save error to temp collection with helpful message
          await db.collection("temp-ocr-results").doc(boxId).set({
            error: "No text detected in image. Please ensure the image is clear, well-lit, and contains readable text.",
            processedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        return;
      }

      console.log("OCR Text detected:", full.substring(0, 300) + "...");

      const lines = full.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      const gameName = extractName(lines) ?? "Unknown Game";

      const prices = [...full.matchAll(PRICE_RE)].map((m) => moneyToNumber(m[0]));
      const pricePerTicket = prices.length ? Math.min(...prices) : null;

      // Extract all dollar amounts from text
      const allAmounts = [...full.matchAll(MONEY_RE)].map((m) => moneyToNumber(m[0]));
      
      // Remove the ticket price from the amounts (assuming it's the smallest)
      const cleaned = allAmounts.filter((v) => !pricePerTicket || v !== pricePerTicket);

      if (cleaned.length === 0) {
        console.log("No prize amounts detected in text");
        
        if (isTemp) {
          await db.collection("temp-ocr-results").doc(boxId).set({
            error: "No prize amounts detected. Please ensure the flare sheet shows clear dollar amounts.",
            processedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
        return;
      }

      const counts = cleaned.reduce<Record<number, number>>((acc, v) => {
        acc[v] = (acc[v] || 0) + 1;
        return acc;
      }, {});

      console.log(`Parsed data - Game: ${gameName}, Price: ${pricePerTicket}, Prizes: ${cleaned.length}`);

      const winningTickets = Object.entries(counts).map(([prize, totalPrizes]) => ({
        prize: prize, // Remove dollar sign - store as number string
        totalPrizes: totalPrizes,
        claimedTotal: 0,
      }));

      const parsedData = {
        winningTickets: winningTickets,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        ocrProcessed: true,
        ocrProcessedAt: admin.firestore.FieldValue.serverTimestamp(),
        remainingPrizes: cleaned.sort((a, b) => b - a),
        prizeCounts: counts,
        // Don't auto-populate these - let user enter manually
        // boxName: gameName,
        // pricePerTicket: pricePerTicket ? String(pricePerTicket) : "1",
        // startingTickets: cleaned.length,
        // boxNumber: "",
      };

      if (isTemp) {
        // Save to temp collection for immediate parsing
        await db.collection("temp-ocr-results").doc(boxId).set(parsedData);
        console.log(`Saved temp OCR result for ${boxId}`);
      } else {
        // Update existing box - but check if it was manually edited first
        const boxRef = db.collection("boxes").doc(boxId);
        const boxDoc = await boxRef.get();
        
        if (boxDoc.exists) {
          const boxData = boxDoc.data();
          
          // Don't overwrite manually edited boxes
          if (boxData?.manuallyEdited) {
            console.log(`Skipping OCR update for manually edited box ${boxId}`);
            return;
          }
        }
        
        await boxRef.update(parsedData);
        console.log(`Updated box ${boxId} with OCR data`);
      }

    } catch (error) {
      console.error("Error processing flare sheet:", error);
      
      let errorMessage = `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`;
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Vision API has not been used')) {
          errorMessage = "Google Cloud Vision API is not enabled. Please contact support.";
        } else if (error.message.includes('PERMISSION_DENIED')) {
          errorMessage = "Permission denied for image processing. Please contact support.";
        } else if (error.message.includes('Invalid image')) {
          errorMessage = "Invalid image format. Please use JPG, PNG, or other common image formats.";
        }
      }
      
      if (isTemp) {
        // Save error to temp collection
        await db.collection("temp-ocr-results").doc(boxId).set({
          error: errorMessage,
          processedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    }
  });

// Callable function for immediate OCR parsing
export const parseFlareSheetImmediate = functions.https.onCall(async (data, context) => {
  // Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { imageUrl } = data;
  
  if (!imageUrl) {
    throw new functions.https.HttpsError('invalid-argument', 'Image URL is required.');
  }

  try {
    console.log(`Parsing image immediately: ${imageUrl}`);

    // Try to call Vision API with better error handling
    const [result] = await visionClient.documentTextDetection(imageUrl);

    const full = result.fullTextAnnotation?.text || "";
    if (!full.trim()) {
      console.log("No text detected in image");
      return {
        success: false,
        error: "No text detected in image"
      };
    }

    console.log("OCR Text detected:", full.substring(0, 200) + "...");

    const lines = full.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    const gameName = extractName(lines) ?? "Unknown Game";

    const prices = [...full.matchAll(PRICE_RE)].map((m) => moneyToNumber(m[0]));
    const pricePerTicket = prices.length ? Math.min(...prices) : null;

    // Extract all dollar amounts from text
    const allAmounts = [...full.matchAll(MONEY_RE)].map((m) => moneyToNumber(m[0]));
    
    // Remove the ticket price from the amounts (assuming it's the smallest)
    const cleaned = allAmounts.filter((v) => !pricePerTicket || v !== pricePerTicket);

    const counts = cleaned.reduce<Record<number, number>>((acc, v) => {
      acc[v] = (acc[v] || 0) + 1;
      return acc;
    }, {});

    const winningTickets = Object.entries(counts).map(([prize, totalPrizes]) => ({
      prize: prize, // Remove dollar sign - store as number string
      totalPrizes: totalPrizes,
      claimedTotal: 0,
    }));

    console.log(`Parsed data - Game: ${gameName}, Price: ${pricePerTicket}, Prizes: ${cleaned.length}`);

    return {
      success: true,
      parsedData: {
        winningTickets: winningTickets,
        // Don't auto-populate these - let user enter manually  
        // boxName: gameName,
        // pricePerTicket: pricePerTicket ? String(pricePerTicket) : "1",
        // startingTickets: cleaned.length,
        // boxNumber: "",
      }
    };

  } catch (error) {
    console.error("Error parsing flare sheet:", error);
    
    // Check if it's a Vision API error
    if (error instanceof Error) {
      if (error.message.includes('Vision API has not been used') || 
          error.message.includes('API_NOT_ACTIVATED') ||
          error.message.includes('SERVICE_DISABLED')) {
        throw new functions.https.HttpsError(
          'failed-precondition', 
          'Google Cloud Vision API is not enabled. Please enable it in Google Cloud Console.'
        );
      }
      
      if (error.message.includes('PERMISSION_DENIED')) {
        throw new functions.https.HttpsError(
          'permission-denied', 
          'Permission denied for Vision API. Check service account permissions.'
        );
      }
    }
    
    throw new functions.https.HttpsError('internal', `Error processing image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
});

// HTTP endpoint to upload flare sheet images (bypasses CORS/auth issues)
export const uploadFlareSheet = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      // Check auth
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      if (!decodedToken.uid) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      // Get image data from request
      const { imageData, tempId, contentType } = req.body;
      
      if (!imageData || !tempId) {
        res.status(400).json({ error: 'Missing imageData or tempId' });
        return;
      }

      console.log(`Uploading flare sheet for temp ID: ${tempId}`);

      // Remove data URL prefix if present
      const base64Data = imageData.includes(',') 
        ? imageData.split(',')[1] 
        : imageData;

      // Upload to Storage
      const bucket = admin.storage().bucket();
      const filePath = `flare-sheets/${tempId}.jpg`;
      const file = bucket.file(filePath);

      await file.save(Buffer.from(base64Data, 'base64'), {
        metadata: {
          contentType: contentType || 'image/jpeg',
          metadata: {
            uploadedBy: decodedToken.uid
          }
        }
      });

      console.log(`File uploaded successfully: ${filePath}`);

      // Get download URL
      await file.makePublic();
      const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      res.status(200).json({
        success: true,
        downloadUrl,
        path: filePath
      });

    } catch (error) {
      console.error('Error uploading flare sheet:', error);
      res.status(500).json({
        error: 'Upload failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
});

// ============================================================================
// AUTHENTICATED FIRESTORE OPERATIONS FOR NATIVE PLATFORMS
// These functions provide secure database access when direct Firestore SDK
// auth sync is blocked (capacitor://localhost issue on iOS)
// ============================================================================

// Get user document
export const getUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { userId } = data;
  
  // Users can only access their own data
  if (userId !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Can only access your own user data');
  }

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return { exists: false, data: null };
    }

    return { exists: true, data: userDoc.data() };
  } catch (error) {
    console.error('Error getting user:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get user data');
  }
});

// Update user document
export const updateUser = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { userId, userData } = data;
  
  // Users can only update their own data
  if (userId !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Can only update your own user data');
  }

  try {
    await db.collection('users').doc(userId).set(userData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    throw new functions.https.HttpsError('internal', 'Failed to update user data');
  }
});

// Query flares
export const getFlares = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { filters } = data;

  try {
    let query: admin.firestore.Query = db.collection('flares');

    // Apply filters if provided
    if (filters) {
      if (filters.userId) {
        query = query.where('userId', '==', filters.userId);
      }
      if (filters.boxId) {
        query = query.where('boxId', '==', filters.boxId);
      }
      if (filters.locationId) {
        query = query.where('locationId', '==', filters.locationId);
      }
      if (filters.orderBy) {
        query = query.orderBy(filters.orderBy.field, filters.orderBy.direction);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
    }

    const snapshot = await query.get();
    const flares = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { flares };
  } catch (error) {
    console.error('Error getting flares:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get flares');
  }
});

// Get single flare
export const getFlare = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { flareId } = data;

  try {
    const flareDoc = await db.collection('flares').doc(flareId).get();
    
    if (!flareDoc.exists) {
      return { exists: false, data: null };
    }

    return { exists: true, data: { id: flareDoc.id, ...flareDoc.data() } };
  } catch (error) {
    console.error('Error getting flare:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get flare');
  }
});

// Create flare
export const createFlare = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { flareData } = data;

  // Ensure userId matches authenticated user
  if (flareData.userId !== context.auth.uid) {
    throw new functions.https.HttpsError('permission-denied', 'Can only create flares for yourself');
  }

  try {
    const flareRef = await db.collection('flares').add({
      ...flareData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true, flareId: flareRef.id };
  } catch (error) {
    console.error('Error creating flare:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create flare');
  }
});

// Update flare
export const updateFlare = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { flareId, flareData } = data;

  try {
    // Check ownership
    const flareDoc = await db.collection('flares').doc(flareId).get();
    
    if (!flareDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Flare not found');
    }

    const flareOwner = flareDoc.data()?.userId;
    if (flareOwner !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Can only update your own flares');
    }

    await db.collection('flares').doc(flareId).update({
      ...flareData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating flare:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to update flare');
  }
});

// Delete flare
export const deleteFlare = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { flareId } = data;

  try {
    // Check ownership
    const flareDoc = await db.collection('flares').doc(flareId).get();
    
    if (!flareDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Flare not found');
    }

    const flareOwner = flareDoc.data()?.userId;
    if (flareOwner !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'Can only delete your own flares');
    }

    await db.collection('flares').doc(flareId).delete();

    return { success: true };
  } catch (error) {
    console.error('Error deleting flare:', error);
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError('internal', 'Failed to delete flare');
  }
});

// Get boxes (read-only)
export const getBoxes = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { filters } = data;

  try {
    let query: admin.firestore.Query = db.collection('boxes');

    // Apply filters if provided
    if (filters) {
      if (filters.locationId) {
        query = query.where('locationId', '==', filters.locationId);
      }
      if (filters.orderBy) {
        query = query.orderBy(filters.orderBy.field, filters.orderBy.direction);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
    }

    const snapshot = await query.get();
    const boxes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { boxes };
  } catch (error) {
    console.error('Error getting boxes:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get boxes');
  }
});

// Get single box (read-only)
export const getBox = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { boxId } = data;

  try {
    const boxDoc = await db.collection('boxes').doc(boxId).get();
    
    if (!boxDoc.exists) {
      return { exists: false, data: null };
    }

    return { exists: true, data: { id: boxDoc.id, ...boxDoc.data() } };
  } catch (error) {
    console.error('Error getting box:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get box');
  }
});

// Get locations (read-only)
export const getLocations = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { filters } = data;

  try {
    let query: admin.firestore.Query = db.collection('locations');

    // Apply filters if provided
    if (filters) {
      if (filters.orderBy) {
        query = query.orderBy(filters.orderBy.field, filters.orderBy.direction);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
    }

    const snapshot = await query.get();
    const locations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { locations };
  } catch (error) {
    console.error('Error getting locations:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get locations');
  }
});

// Get single location (read-only)
export const getLocation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }

  const { locationId } = data;

  try {
    const locationDoc = await db.collection('locations').doc(locationId).get();
    
    if (!locationDoc.exists) {
      return { exists: false, data: null };
    }

    return { exists: true, data: { id: locationDoc.id, ...locationDoc.data() } };
  } catch (error) {
    console.error('Error getting location:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get location');
  }
});
