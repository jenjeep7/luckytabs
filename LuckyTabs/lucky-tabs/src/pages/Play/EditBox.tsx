/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  TextField,
  Typography,
  Button,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Card,
  CardMedia,
  LinearProgress,
  Alert,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { doc, setDoc, serverTimestamp, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import { useState, useRef, useEffect } from "react";
import { useAuthStateCompat } from "../../services/useAuthStateCompat";
import heic2any from "heic2any";
import { userService, UserData } from "../../services/userService";

// Type guard for Firebase User
function isFirebaseUser(u: unknown): u is { uid: string } {
  return !!u && typeof u === 'object' && 'uid' in u && typeof (u as { uid?: unknown }).uid === 'string';
}

type WinningTicket = {
  prize: string;
  totalPrizes: number;
  claimedTotal: number;
};

type BoxType = {
  id: string;
  type: "wall" | "bar box";
  pricePerTicket: string | number;
  startingTickets?: number;
  boxName: string;
  winningTickets?: WinningTicket[];
  flareSheetUrl?: string;
  [key: string]: any;
};

export const EditBoxForm = ({ box, onClose, onBoxUpdated }: { box: BoxType; onClose: () => void; onBoxUpdated?: () => void }) => {
  const [user] = useAuthStateCompat();
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  
  // Existing state
  const [type, setType] = useState<"wall" | "bar box">(box.type);
  const [boxName, setBoxName] = useState<string>(box.boxName);
  const [pricePerTicket, setPricePerTicket] = useState<string | number>(box.pricePerTicket);
  const [startingTickets, setStartingTickets] = useState<string>(box.startingTickets ? box.startingTickets.toString() : "");
  const [winningTickets, setWinningTickets] = useState<WinningTicket[]>(box.winningTickets || []);
  const [flareSheetImage, setFlareSheetImage] = useState<File | null>(null);
  const [flareSheetUrl, setFlareSheetUrl] = useState<string>(box.flareSheetUrl || "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // OCR-related state
  const [enableOcr, setEnableOcr] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [tempBoxId, setTempBoxId] = useState<string | null>(null);
  const [originalWinningTickets] = useState<WinningTicket[]>(box.winningTickets || []);
  const ocrProcessedRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user has pro plan
  useEffect(() => {
    if (isFirebaseUser(user)) {
      userService.getUserProfile(user.uid).then(setUserProfile).catch(console.error);
    }
  }, [user]);

  const isProUser = userProfile?.plan === "pro";

  // Convert HEIC files to JPEG
  const convertHeicToJpeg = async (file: File): Promise<File> => {
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      try {
        console.log("Converting HEIC file to JPEG:", file.name);
        
        const convertedBlob = await heic2any({
          blob: file,
          toType: "image/jpeg",
          quality: 0.8
        }) as Blob;
        
        // Create a new File object with JPEG type
        const convertedFile = new File(
          [convertedBlob], 
          file.name.replace(/\.heic$/i, '.jpg'), 
          { type: 'image/jpeg' }
        );
        
        console.log("HEIC conversion successful:", convertedFile.name, convertedFile.type);
        return convertedFile;
      } catch (error) {
        console.error("Error converting HEIC file:", error);
        throw new Error("Failed to convert HEIC image. Please try a different image format.");
      }
    }
    
    return file; // Return original file if not HEIC
  };

  // Listen for OCR results when parsing
  useEffect(() => {
    if (!tempBoxId || !parsing) return;

    const unsubscribe = onSnapshot(doc(db, "temp-ocr-results", tempBoxId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        if (data.ocrProcessed && !ocrProcessedRef.current) {
          // Compare OCR results with current prizes to detect claimed ones
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const ocrPrizes: WinningTicket[] = Array.isArray(data.winningTickets) 
            ? data.winningTickets.map((ticket: any) => ({
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                prize: String(ticket?.prize || ''),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                totalPrizes: Number(ticket?.totalPrizes || 0),
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                claimedTotal: Number(ticket?.claimedTotal || 0)
              }))
            : [];
          const detectedChanges = detectClaimedPrizes(originalWinningTickets, ocrPrizes);
          
          console.log("OCR Prize Detection Results:");
          console.log("Original prizes:", originalWinningTickets);
          console.log("OCR detected prizes:", ocrPrizes);
          console.log("Updated prizes with claimed detection:", detectedChanges);
          
          setWinningTickets(detectedChanges);
          ocrProcessedRef.current = true;
          setParsing(false);
          setParseError(null);
          setTempBoxId(null);
        } else if (data.error) {
          setParsing(false);
          setParseError(String(data.error));
          setTempBoxId(null);
        }
      }
    });

    // Set a timeout to stop waiting after 30 seconds
    const timeout = setTimeout(() => {
      setParsing(false);
      setParseError("OCR parsing timeout. Please try manual updates.");
      setTempBoxId(null);
    }, 30000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, [tempBoxId, parsing, originalWinningTickets]);

  // Detect claimed prizes by comparing original vs OCR results
  const detectClaimedPrizes = (original: WinningTicket[], ocrResults: WinningTicket[]): WinningTicket[] => {
    return original.map(originalPrize => {
      // Find matching prize in OCR results
      const ocrPrize = ocrResults.find(op => op.prize === originalPrize.prize);
      
      if (ocrPrize) {
        // If OCR detects fewer total prizes than what we currently have available,
        // some were likely claimed (crossed out or missing from the flare sheet)
        const currentAvailable = originalPrize.totalPrizes - originalPrize.claimedTotal;
        const ocrDetected = ocrPrize.totalPrizes;
        
        // Calculate how many additional prizes were claimed
        const newlyClaimed = Math.max(0, currentAvailable - ocrDetected);
        
        return {
          ...originalPrize, // Keep original totalPrizes and other data
          claimedTotal: originalPrize.claimedTotal + newlyClaimed // Only update claimed total
        };
      }
      
      // If prize not found in OCR results, assume all remaining were claimed
      return {
        ...originalPrize,
        claimedTotal: originalPrize.totalPrizes // Mark all as claimed if not detected
      };
    });
  };

  // Parse new image with OCR
  const parseImageWithOcr = async (file: File): Promise<void> => {
    if (!isProUser) {
      setParseError("OCR feature is only available for Pro users.");
      return;
    }

    try {
      setParsing(true);
      setParseError(null);
      ocrProcessedRef.current = false;

      const tempId = `temp_edit_${box.id}_${Date.now()}`;
      setTempBoxId(tempId);

      console.log("Starting OCR processing for file:", file.name, "Size:", file.size, "Type:", file.type);

      // Upload image to trigger OCR processing
      const imageRef = ref(storage, `flare-sheets/${tempId}.jpg`);
      await uploadBytes(imageRef, file);
      
      console.log("Image uploaded successfully, waiting for OCR processing...");
    } catch (error) {
      console.error("Error uploading for OCR:", error);
      setParsing(false);
      setParseError(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Handle file upload with OCR integration
  const handleFileUpload = async (file: File): Promise<void> => {
    try {
      setUploading(true);
      setUploadError(null);

      // Convert HEIC files to JPEG if needed
      const processedFile = await convertHeicToJpeg(file);

      // Check if user wants OCR processing
      if (enableOcr && isProUser) {
        await parseImageWithOcr(processedFile);
      }

      // Always update the image for display
      setFlareSheetImage(processedFile);
      
      // Preview the new image
      const reader = new FileReader();
      reader.onload = (e) => {
        setFlareSheetUrl(e.target?.result as string);
      };
      reader.readAsDataURL(processedFile);
      
      setUploading(false);
    } catch (error) {
      console.error("Error processing file:", error);
      setUploadError(error instanceof Error ? error.message : "Failed to process file");
      setUploading(false);
    }
  };

  // Upload image to Firebase Storage
  const uploadFlareSheetImage = async (file: File, boxId: string): Promise<string> => {
    const imageRef = ref(storage, `flare-sheets/${boxId}.jpg`);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      setUploadError(null);

      let updatedFlareSheetUrl = flareSheetUrl;

      // Upload new image if one was selected
      if (flareSheetImage) {
        updatedFlareSheetUrl = await uploadFlareSheetImage(flareSheetImage, box.id);
      }

      const updatedBox = {
        ...box,
        boxName,
        type,
        pricePerTicket,
        startingTickets: startingTickets ? Number(startingTickets) : 0,
        winningTickets,
        flareSheetUrl: updatedFlareSheetUrl,
        lastUpdated: serverTimestamp(),
      };

      const docRef = doc(db, "boxes", box.id);
      await setDoc(docRef, updatedBox, { merge: true });
      onBoxUpdated?.();
      onClose(); // Close the dialog after successful save
    } catch (err) {
      console.error("Error updating box:", err);
      setUploadError("Failed to update box. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handlePrizeChange = (index: number, field: string, value: string | number) => {
    const updated = [...winningTickets];
    const currentPrize = updated[index];
    
    if (field === "prize") {
      updated[index] = {
        ...currentPrize,
        [field]: String(value),
      };
    } else {
      const numValue = value === "" ? 0 : Number(value);
      
      // Just set the value without validation - let the error state show
      updated[index] = {
        ...currentPrize,
        [field]: numValue,
      };
      
      // If we're updating totalPrizes and claimedTotal exceeds it, adjust claimedTotal
      if (field === "totalPrizes" && currentPrize.claimedTotal > numValue) {
        updated[index] = {
          ...updated[index],
          claimedTotal: numValue,
        };
      }
    }
    
    setWinningTickets(updated);
  };

  // Validation function to check if any claimed totals exceed total prizes
  const hasValidationErrors = () => {
    return winningTickets.some(prize => prize.claimedTotal > prize.totalPrizes);
  };

  // Sort prizes by amount (highest to lowest) for display
  const sortedPrizesForDisplay = () => {
    return winningTickets
      .map((prize, originalIndex) => ({ ...prize, originalIndex }))
      .sort((a, b) => {
        const prizeA = parseFloat(String(a.prize || '').replace(/[^0-9.]/g, '')) || 0;
        const prizeB = parseFloat(String(b.prize || '').replace(/[^0-9.]/g, '')) || 0;
        return prizeB - prizeA; // Highest to lowest
      });
  };

  const addPrize = () => {
    setWinningTickets([...winningTickets, { prize: "", totalPrizes: 0, claimedTotal: 0 }]);
  };

  return (
    <Box sx={{ mt: 2, textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
        {box.boxName}
      </Typography>

      {uploadError && (
        <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
          {uploadError}
        </Alert>
      )}

      {uploading && (
        <LinearProgress sx={{ mb: 2 }} />
      )}

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <ToggleButtonGroup
          value={type}
          exclusive
          onChange={(_, val: "wall" | "bar box" | null) => val && setType(val)}
        >
          <ToggleButton value="wall">Wall</ToggleButton>
          <ToggleButton value="bar box">Bar Box</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Flare Sheet Image Section */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      

        {/* OCR Status Messages */}
        {parsing && (
          <Alert severity="info" sx={{ mb: 2, textAlign: 'center' }}>
            Processing image to detect prize changes... Please wait.
          </Alert>
        )}

        {parseError && (
          <Alert severity="error" sx={{ mb: 2, textAlign: 'left' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {parseError}
            </Typography>
            {parseError.includes("No text detected") && (
              <Typography variant="body2" component="div">
                Tips for better OCR results:
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  <li>Ensure good lighting when taking the photo</li>
                  <li>Hold the camera steady and focus clearly</li>
                  <li>Take the photo straight-on (not at an angle)</li>
                  <li>Make sure all text is visible and not cut off</li>
                  <li>Avoid shadows or glare on the flare sheet</li>
                </ul>
              </Typography>
            )}
          </Alert>
        )}
        
        {/* Current Image Display */}
        {flareSheetUrl && (
          <Card sx={{ mb: 2, maxWidth: 400, width: '100%' }}>
            <CardMedia
              component="img"
              height="300"
              image={flareSheetUrl}
              alt="Current flare sheet"
              sx={{ objectFit: 'contain' }}
            />
              {/* OCR Toggle for Pro Users */}
       
          </Card>
        )}
       {isProUser && (
          <FormControlLabel
            control={
              <Switch 
                checked={enableOcr} 
                onChange={(e) => setEnableOcr(e.target.checked)}
                color="primary"
              />
            }
            label="Use Auto Fill to estimate claimed prizes by uploading a new image."
            sx={{ mb: 2 }}
          />
        )}
        {/* Image Upload */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCamera />}
            disabled={uploading || parsing}
          >
            {flareSheetUrl ? 'Change Image' : 'Upload Image'}
            <input
              ref={fileInputRef}
              hidden
              accept="image/*,.heic"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Validate file size
                  if (file.size > 10 * 1024 * 1024) {
                    setUploadError("File size too large. Please use an image under 10MB.");
                    return;
                  }
                  
                  // Check if it's a valid image type (including HEIC)
                  const isValidImage = file.type.startsWith('image/') || 
                                     file.type === 'image/heic' || 
                                     file.name.toLowerCase().endsWith('.heic');
                  
                  if (!isValidImage) {
                    setUploadError("Please select a valid image file (JPG, PNG, HEIC, etc.).");
                    return;
                  }
                  
                  handleFileUpload(file).catch((error) => {
                    console.error("Error in file upload:", error);
                    setUploadError(error instanceof Error ? error.message : "Failed to process file");
                  });
                }
              }}
            />
          </Button>
          
          {/* Retry OCR button */}
          {parseError && flareSheetImage && enableOcr && isProUser && (
            <Button
              variant="outlined"
              color="secondary"
              size="small"
              disabled={parsing}
              onClick={() => {
                if (flareSheetImage) {
                  void (async () => {
                    try {
                      // Convert HEIC if needed before retrying OCR
                      const processedFile = await convertHeicToJpeg(flareSheetImage);
                      await parseImageWithOcr(processedFile);
                    } catch (error) {
                      console.error("Error retrying OCR:", error);
                      setParseError(error instanceof Error ? error.message : "Failed to retry OCR");
                    }
                  })();
                }
              }}
            >
              Retry OCR Processing
            </Button>
          )}
          
          {flareSheetImage && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              New image selected: {flareSheetImage.name}
              <br />
              Size: {(flareSheetImage.size / 1024 / 1024).toFixed(2)} MB
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Grid container spacing={2} sx={{ maxWidth: 600 }}>
          <Grid size={12}>
            <TextField
              label="Box Name"
              fullWidth
              value={boxName}
              onChange={(e) => setBoxName(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid size={type === "wall" ? 12 : 6}>
            <TextField
              label="Price Per Ticket $"
              fullWidth
              value={pricePerTicket}
              onChange={(e) => setPricePerTicket(e.target.value)}
              size="small"
            />
          </Grid>
          {type === "bar box" && (
            <Grid size={6}>
              <TextField
                label="# of Tickets"
                type="number"
                fullWidth
                value={startingTickets}
                onChange={(e) => setStartingTickets(e.target.value)}
                size="small"
              />
            </Grid>
          )}
        </Grid>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1">Winning Prizes</Typography>
        {sortedPrizesForDisplay().map((prize, displayIdx) => (
          <Grid container spacing={1} key={displayIdx} sx={{ mt: 1 }}>
            <Grid size={4}>
              <TextField
                label="Prize"
                value={prize.prize}
                onChange={(e) => handlePrizeChange(prize.originalIndex, "prize", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={4}>
              <TextField
                label="Total Prizes"
                type="number"
                value={prize.totalPrizes || ""}
                onChange={(e) => handlePrizeChange(prize.originalIndex, "totalPrizes", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={4}>
              <TextField
                label="Claimed Total"
                type="number"
                value={prize.claimedTotal || 0}
                onChange={(e) => handlePrizeChange(prize.originalIndex, "claimedTotal", e.target.value)}
                fullWidth
                inputProps={{ 
                  min: 0, 
                  max: prize.totalPrizes || 0 
                }}
                error={prize.claimedTotal > prize.totalPrizes}
                helperText={
                  prize.claimedTotal > prize.totalPrizes 
                    ? `Cannot exceed ${prize.totalPrizes} total prizes`
                    : ""
                }
                size="small"
              />
            </Grid>
          </Grid>
        ))}
        <Button onClick={addPrize} sx={{ mt: 2 }}>
          Add Prize
        </Button>
      </Box>

      <Button 
        variant="contained" 
        onClick={() => { void handleSubmit(); }} 
        sx={{ mt: 4 }}
        disabled={uploading || hasValidationErrors()}
      >
        {uploading ? 'Updating...' : 'Update Box'}
      </Button>
    </Box>
  );
};
