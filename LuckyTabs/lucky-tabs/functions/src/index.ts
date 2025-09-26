import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import vision from "@google-cloud/vision";

admin.initializeApp();

// Export the box advisor function
export { boxAdvisor } from "./boxAdvisor";

const db = admin.firestore();
const visionClient = new vision.ImageAnnotatorClient();

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
