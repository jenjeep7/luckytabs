/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */
import React, { useState, useRef, useEffect } from "react";
import heic2any from "heic2any";
import {
  Box,
  TextField,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Card,
  CardMedia,
  LinearProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { PhotoCamera, Upload } from "@mui/icons-material";
import { collection, addDoc, serverTimestamp, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import { useAuthStateCompat } from '../../services/useAuthStateCompat';
import { userService, UserData } from "../../services/userService";
import { trackBoxCreated, trackFlareSheetUploaded } from "../../utils/analytics";
import { EstimateRemainingDialog } from "./BoxDialogs";

interface Props {
  location: { id: string; name: string };
  onClose: () => void;
  onBoxCreated?: () => void;
  replaceMode?: boolean;
  boxToReplace?: { id: string; boxName: string } | null;
}

interface Prize {
  prize: string;
  totalPrizes: number;
  claimedTotal: number;
}

export const CreateBoxForm: React.FC<Props> = ({ location, onClose, onBoxCreated, replaceMode = false, boxToReplace = null }) => {
  const [type, setType] = useState<"wall" | "bar box">("wall");
  const [boxName, setBoxName] = useState("");
  const [pricePerTicket, setPricePerTicket] = useState("");
  const [startingTickets, setStartingTickets] = useState("3000");
  const [user] = useAuthStateCompat();
  const [userProfile, setUserProfile] = useState<UserData | null>(null);
  const [winningTickets, setWinningTickets] = useState<Prize[]>([
    { prize: "", totalPrizes: 0, claimedTotal: 0 },
  ]);
  const ocrProcessedRef = useRef(false); // Use ref to avoid dependency array issues
  
  // Image upload state
  const [flareSheetImage, setFlareSheetImage] = useState<File | null>(null);
  const [flareSheetPreview, setFlareSheetPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [tempBoxId, setTempBoxId] = useState<string | null>(null);
  
  // Entry mode toggle - auto is default
  const [entryMode, setEntryMode] = useState<"auto" | "manual">("auto");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estimate tickets dialog state
  const [estimateDialogOpen, setEstimateDialogOpen] = useState(false);
  const [rowEstimates, setRowEstimates] = useState<{ row1: number; row2: number; row3: number; row4: number } | null>(null);
  
  // Success snackbar state
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  
  // Fetch user profile
  useEffect(() => {
    if (user?.uid) {
      userService.getUserProfile(user.uid).then(setUserProfile).catch(console.error);
    }
  }, [user?.uid]);

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
          const ocrTickets = Array.isArray(data.winningTickets) ? data.winningTickets : [];
          const sortedTickets = ocrTickets.sort((a: any, b: any) => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const prizeA = parseFloat(String(a?.prize || '').replace(/[^0-9.]/g, '')) || 0;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const prizeB = parseFloat(String(b?.prize || '').replace(/[^0-9.]/g, '')) || 0;
            return prizeB - prizeA; // Highest to lowest
          });
          setWinningTickets(sortedTickets);
          ocrProcessedRef.current = true; // Mark OCR as processed
          setParsing(false);
          setParseError(null);
          setTempBoxId(null);
          setShowSuccessSnackbar(true); // Show success message
        } else if (data.ocrProcessed && ocrProcessedRef.current) {
          // OCR already processed, ignoring duplicate data
        } else if (data.error) {
          setParsing(false);
          setParseError(String(data.error));
          setTempBoxId(null);
        }
      }
    });

    // Set a timeout to stop waiting after 30 seconds
    const timeout = setTimeout(() => {
      console.log("OCR parsing timeout");
      setParsing(false);
      setParseError("Parsing timeout. Please try manual entry.");
      setTempBoxId(null);
    }, 30000);

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempBoxId, parsing]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if it's a valid image type (including HEIC)
      const isValidImage = file.type.startsWith('image/') || 
                           file.type === 'image/heic' || 
                           file.name.toLowerCase().endsWith('.heic');
      
      if (!isValidImage) {
        setUploadError('Please select a valid image file (JPG, PNG, HEIC, etc.)');
        return;
      }

      // Convert HEIC if needed, then process
      void (async () => {
        try {
          const processedFile = await convertHeicToJpeg(file);
          setFlareSheetImage(processedFile);
          setUploadError(null);
          setParseError(null);
          
          // Create preview
          const reader = new FileReader();
          reader.onload = (e) => {
            setFlareSheetPreview(e.target?.result as string);
          };
          reader.readAsDataURL(processedFile);

          // If auto mode, upload and parse immediately
          if (entryMode === "auto") {
            void parseImageImmediately(processedFile);
          }
        } catch (error) {
          console.error("Error processing file:", error);
          setUploadError(error instanceof Error ? error.message : "Failed to process file");
        }
      })();
    }
  };

  // Parse image immediately for auto mode - NEW APPROACH
  const parseImageImmediately = async (file: File) => {
    try {
      setParsing(true);
      setParseError(null);
      setUploadError(null);
      ocrProcessedRef.current = false; // Reset OCR processed flag for new image

      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setTempBoxId(tempId);

      // Upload image to the flare-sheets path to trigger the existing OCR function
      const imageRef = ref(storage, `flare-sheets/${tempId}.jpg`);
      await uploadBytes(imageRef, file);    } catch (error) {
      console.error("Error uploading for parsing:", error);
      setParsing(false);
      setParseError(`Failed to parse image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUploadError(null);
    }
  };

  // Upload image to Firebase Storage
  const uploadFlareSheetImage = async (file: File, boxId: string): Promise<string> => {
    const imageRef = ref(storage, `flare-sheets/${boxId}.jpg`);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  };

  // Estimate dialog handlers
  const handleEstimateClick = () => {
    setEstimateDialogOpen(true);
  };

  const handleEstimateUpdate = (totalTickets: number, estimates: { row1: number; row2: number; row3: number; row4: number }) => {
    setStartingTickets(totalTickets.toString());
    setRowEstimates(estimates);
    setEstimateDialogOpen(false);
  };

  const handleEstimateCancel = () => {
    setEstimateDialogOpen(false);
  };

  const handleSubmit = async () => {
    try {
      setUploading(true);
      setUploadError(null);

      // Validate required fields
      if (!flareSheetImage) {
        setUploadError('Please add a flare sheet image');
        setUploading(false);
        return;
      }

      // Validation for both modes now
      if (!pricePerTicket.trim()) {
        setUploadError('Price per ticket is required');
        setUploading(false);
        return;
      }
      if (!boxName.trim()) {
        setUploadError('Box name is required');
        setUploading(false);
        return;
      }

      interface Box {
        boxName: string;
        pricePerTicket: string;
        startingTickets: number;
        type: "wall" | "bar box";
        createdAt: any;
        lastUpdated: any;
        locationId: string;
        ownerId: string;
        isActive: boolean;
        tags: string[];
        winningTickets: Prize[];
        rows?: { rowNumber: number; estimatedTicketsRemaining: number }[];
        estimatedRemainingTickets?: number; // For bar boxes
        estimatedTicketsUpdated?: any; // Use any to allow both Date and FieldValue
        flareSheetUrl?: string;
        manuallyEdited?: boolean;
      }

      // Calculate remaining tickets based on box type
      const totalStartingTickets = Number(startingTickets) || 0;
      let boxSpecificData = {};
      
      if (type === "wall") {
        // Wall boxes: use row estimates if available, otherwise divide total tickets by 4 rows
        if (rowEstimates) {
          boxSpecificData = {
            rows: [
              { rowNumber: 1, estimatedTicketsRemaining: rowEstimates.row1 },
              { rowNumber: 2, estimatedTicketsRemaining: rowEstimates.row2 },
              { rowNumber: 3, estimatedTicketsRemaining: rowEstimates.row3 },
              { rowNumber: 4, estimatedTicketsRemaining: rowEstimates.row4 },
            ],
          };
        } else {
          // Fallback to equal distribution
          const ticketsPerRow = Math.floor(totalStartingTickets / 4);
          boxSpecificData = {
            rows: [
              { rowNumber: 1, estimatedTicketsRemaining: ticketsPerRow },
              { rowNumber: 2, estimatedTicketsRemaining: ticketsPerRow },
              { rowNumber: 3, estimatedTicketsRemaining: ticketsPerRow },
              { rowNumber: 4, estimatedTicketsRemaining: ticketsPerRow },
            ],
          };
        }
      } else {
        // Bar boxes: single value for all remaining tickets
        boxSpecificData = {
          estimatedRemainingTickets: totalStartingTickets,
        };
      }

      const newBox: Box = {
        boxName: boxName || (type === "bar box" ? "Bar Box" : "Wall Box"),
        pricePerTicket: pricePerTicket,
        startingTickets: totalStartingTickets,
        type,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        locationId: location.id,
        ownerId: user?.uid || "",
        isActive: true,
        tags: ["pull tab"],
        winningTickets: winningTickets,
        manuallyEdited: true, // Flag to prevent OCR from overwriting
        ...boxSpecificData,
        estimatedTicketsUpdated: serverTimestamp(),
      };

      // Create the box first to get the document ID
      const docRef = await addDoc(collection(db, "boxes"), newBox);
      
      // Track box creation
      trackBoxCreated({
        type: type,
        pricePerTicket: parseFloat(pricePerTicket),
        userPlan: userProfile?.plan || 'free',
        startingTickets: Number(startingTickets) || undefined
      });
      
      if (flareSheetImage) {
        try {
          const flareSheetUrl = await uploadFlareSheetImage(flareSheetImage, docRef.id);
          // Update the box with the image URL
          const boxDocRef = doc(db, "boxes", docRef.id);
          await updateDoc(boxDocRef, { flareSheetUrl });
          
          // Track flare sheet upload
          trackFlareSheetUploaded({
            boxId: docRef.id,
            boxType: type,
            userPlan: userProfile?.plan || 'free'
          });
        } catch (imageError) {
          console.error("Error uploading flare sheet:", imageError);
          setUploadError("Failed to upload flare sheet image");
        }
      }

      // If in replace mode, deactivate the old box
      if (replaceMode && boxToReplace?.id) {
        try {
          const oldBoxRef = doc(db, "boxes", boxToReplace.id);
          await updateDoc(oldBoxRef, { 
            isActive: false,
            lastUpdated: serverTimestamp()
          });
          console.log(`Deactivated old box: ${boxToReplace.boxName} (${boxToReplace.id})`);
        } catch (deactivateError) {
          console.error("Error deactivating old box:", deactivateError);
          // Don't fail the whole operation if deactivation fails
        }
      }

      onBoxCreated?.();
      onClose();
    } catch (err) {
      console.error("Error creating box:", err);
      setUploadError("Failed to create box");
    } finally {
      setUploading(false);
    }
  };

  const handlePrizeChange = (index: number, field: keyof Prize, value: string | number) => {
    const updated: Prize[] = [...winningTickets];
    
    if (field === "prize") {
      // Strip special characters and keep only numbers and decimal point
      const cleanedValue = String(value).replace(/[^0-9.]/g, '');
      updated[index] = {
        ...updated[index],
        [field]: cleanedValue,
      };
    } else {
      updated[index] = {
        ...updated[index],
        [field]: value === "" ? 0 : Number(value),
      };
    }
    
    setWinningTickets(updated);
  };

  const addPrize = () => {
    setWinningTickets([...winningTickets, { prize: "", totalPrizes: 0, claimedTotal: 0 }]);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
        <strong>{location?.name}</strong>
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <ToggleButtonGroup
          color="info"
          value={type}
          size="small"
          exclusive
          onChange={(_, val: "wall" | "bar box" | null) => {
            if (val) setType(val);
          }}
        >
          <ToggleButton value="wall">Wall</ToggleButton>
          <ToggleButton value="bar box">Bar Box</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Flare Sheet Image Upload Section */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body1" sx={{ mb: 1 }}>
          Flare Sheet *
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload an image of the flare sheet for this box (Required)
        </Typography>

        {/* Entry Mode Toggle */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <ToggleButtonGroup
            color="primary"
            value={entryMode}
            exclusive
            onChange={(_, val: "auto" | "manual" | null) => {
              if (val) setEntryMode(val);
            }}
            size="small"
          >
            <ToggleButton value="auto">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="caption">Auto Fill</Typography>
              </Box>
            </ToggleButton>
            <ToggleButton value="manual">
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="caption">Manual Entry</Typography>
              </Box>
            </ToggleButton>

          </ToggleButtonGroup>
        </Box>
        {uploadError && (
          <Alert severity="error" sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
            {uploadError}
          </Alert>
        )}

        {!flareSheetPreview ? (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <input
              type="file"
              accept="image/*,.heic"
              onChange={handleFileSelect}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', pb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<PhotoCamera />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                Take Photo or Choose Image
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
            <Card sx={{ maxWidth: 600, width: '100%' }}>
              <CardMedia
                component="img"
                height="400"
                image={flareSheetPreview}
                alt="Flare sheet preview"
                sx={{ objectFit: 'contain' }}
              />
            </Card>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
              <Button
                variant="outlined"
                startIcon={<Upload />}
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                size="small"
              >
                Change Image
              </Button>
            </Box>
          </Box>
        )}

        {uploading && (
          <Box sx={{ mt: 2, maxWidth: 300, mx: 'auto' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Uploading image...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {parsing && (
          <Box sx={{ mt: 2, maxWidth: 300, mx: 'auto' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Parsing image with OCR...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {parseError && (
          <Alert severity="warning" sx={{ mt: 2, maxWidth: 400, mx: 'auto' }}>
            {parseError}
          </Alert>
        )}
      </Box>

      {/* Form Fields - Always shown now */}
      {entryMode === "auto" && !flareSheetImage && (
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Upload a flare sheet image and Tabsy will automatically estimate the box details!
          </Alert>
        </Box>
      )}

      <Grid container spacing={2} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            size="small"
            label="Box Name"
            fullWidth
            value={boxName}
            onChange={(e) => {
              setBoxName(e.target.value);
            }}
            required
            disabled={parsing}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            size="small"
            label="Price Per Ticket"
            fullWidth
            value={pricePerTicket}
            onChange={(e) => {
              // Strip special characters and keep only numbers and decimal point
              const cleanedValue = e.target.value.replace(/[^0-9.]/g, '');
              setPricePerTicket(cleanedValue);
            }}
            required
            disabled={parsing}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            size="small"
            label="# of Tickets"
            type="number"
            fullWidth
            value={startingTickets}
            onChange={(e) => setStartingTickets(e.target.value)}
            disabled={parsing}
          />
          {/* Estimate by row button for wall boxes */}
          {type === "wall" && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleEstimateClick}
                sx={{ fontSize: '0.75rem', height: '28px' }}
                disabled={parsing}
              >
                Set by Row
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>

      <Box sx={{ mt: 1 }}>
        <Typography variant="subtitle1">Prizes</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          *add any crossed off/claimed prizes if desired. Double check amounts for accuracy.
        </Typography>
        {winningTickets.map((prize, idx) => (
          <Grid container spacing={1} key={idx} sx={{ mt: 1 }}>
            <Grid size={{ xs: 5 }}>
              <TextField
                label="Prize Amount"
                value={prize.prize}
                onChange={(e) => handlePrizeChange(idx, "prize", e.target.value)}
                fullWidth
                size="small"
                required
                disabled={parsing}
              />
            </Grid>
            <Grid size={{ xs:3 }}>
              <TextField
                label="Total"
                type="number"
                value={prize.totalPrizes || ""}
                onChange={(e) => handlePrizeChange(idx, "totalPrizes", e.target.value)}
                fullWidth
                size="small"
                disabled={parsing}
              />
            </Grid>
            <Grid size={{ xs: 4 }}>
              <TextField
                label="Claimed"
                type="number"
                value={prize.claimedTotal || 0}
                onChange={(e) => handlePrizeChange(idx, "claimedTotal", e.target.value)}
                fullWidth
                size="small"
                disabled={parsing}
              />
            </Grid>
          </Grid>
        ))}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button 
            size="small" 
            variant="contained" 
            color="info" 
            onClick={addPrize} 
            disabled={parsing}
          >
            Add Another
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Button 
          size="medium" 
          variant="contained" 
          onClick={() => { 
            void handleSubmit(); 
          }} 
          disabled={uploading || parsing}
        >
          {uploading 
            ? (replaceMode ? 'Replacing Box...' : 'Creating Box...')
            : parsing
              ? 'Parsing Image...'
              : (replaceMode ? 'Replace Box' : 'Create Box')
          }
        </Button>
      </Box>

      {/* Estimate Remaining Tickets Dialog */}
      <EstimateRemainingDialog
        open={estimateDialogOpen}
        boxName={boxName || "New Box"}
        currentValue={Number(startingTickets) || 0}
        boxType="wall"
        currentRowEstimates={rowEstimates || undefined}
        onUpdate={handleEstimateUpdate}
        onCancel={handleEstimateCancel}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setShowSuccessSnackbar(false)}
          sx={{ 
            fontSize: '1rem',
            fontWeight: 500,
            minWidth: '300px',
            '& .MuiAlert-message': {
              fontSize: '1rem'
            }
          }}
        >
          ✅ Image parsed successfully! Review and edit the data below before creating the box.
        </Alert>
      </Snackbar>
    </Box>
  );
};
