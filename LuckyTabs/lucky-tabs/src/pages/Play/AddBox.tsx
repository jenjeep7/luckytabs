/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */
import { useState, useRef } from "react";
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
  IconButton,
  LinearProgress,
  Alert,
} from "@mui/material";
import { PhotoCamera, Delete, Upload } from "@mui/icons-material";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

interface Props {
  location: { id: string; name: string };
  onClose: () => void;
  onBoxCreated?: () => void;
}

interface Prize {
  prize: string;
  totalPrizes: number;
  claimedTotal: number;
}

export const CreateBoxForm: React.FC<Props> = ({ location, onClose, onBoxCreated }) => {
  const [type, setType] = useState<"wall" | "bar box">("wall");
  const [boxName, setBoxName] = useState("");
  const [boxNumber, setBoxNumber] = useState("");
  const [pricePerTicket, setPricePerTicket] = useState("");
  const [startingTickets, setStartingTickets] = useState("");
  const [user] = useAuthState(auth);
  const [winningTickets, setWinningTickets] = useState<Prize[]>([
    { prize: "", totalPrizes: 0, claimedTotal: 0 },
  ]);
  
  // Image upload state
  const [flareSheetImage, setFlareSheetImage] = useState<File | null>(null);
  const [flareSheetPreview, setFlareSheetPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadError('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image size must be less than 5MB');
        return;
      }

      setFlareSheetImage(file);
      setUploadError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFlareSheetPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setFlareSheetImage(null);
    setFlareSheetPreview(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Upload image to Firebase Storage
  const uploadFlareSheetImage = async (file: File, boxId: string): Promise<string> => {
    const imageRef = ref(storage, `flare-sheets/${boxId}/${file.name}`);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  };
  const handleSubmit = async () => {
    try {
      setUploading(true);
      setUploadError(null);

      interface Box {
        boxName: string;
        boxNumber: string;
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
        estimatedTicketsUpdated?: Date;
        flareSheetUrl?: string; // Add flare sheet image URL
      }

      const newBox: Box = {
        boxName: boxName || `Box ${boxNumber}`,
        boxNumber,
        pricePerTicket,
        startingTickets: Number(startingTickets) || 0,
        type,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        locationId: location.id,
        ownerId: user?.uid || "", // ✅ use authenticated user's UID
        isActive: true,
        tags: ["pull tab"],
        winningTickets,
        ...(type === "wall"
          ? {
              rows: [
                { rowNumber: 1, estimatedTicketsRemaining: 0 },
                { rowNumber: 2, estimatedTicketsRemaining: 0 },
                { rowNumber: 3, estimatedTicketsRemaining: 0 },
                { rowNumber: 4, estimatedTicketsRemaining: 0 },
              ],
            }
          : {}),
        // Add estimatedTicketsUpdated field
        estimatedTicketsUpdated: new Date(),
      };

      // Create the box first to get the document ID
      const docRef = await addDoc(collection(db, "boxes"), newBox);
      
      // If there's a flare sheet image, upload it and update the box
      if (flareSheetImage) {
        try {
          const flareSheetUrl = await uploadFlareSheetImage(flareSheetImage, docRef.id);
          // Update the box with the image URL
          const boxDocRef = doc(db, "boxes", docRef.id);
          await updateDoc(boxDocRef, { flareSheetUrl });
        } catch (imageError) {
          console.error("Error uploading flare sheet:", imageError);
          setUploadError("Failed to upload flare sheet image");
          // Don't return here - the box was created successfully
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
    updated[index] = {
      ...updated[index],
      [field]: field === "prize" ? String(value) : (value === "" ? 0 : Number(value)),
    };
    setWinningTickets(updated);
  };

  const addPrize = () => {
    setWinningTickets([...winningTickets, { prize: "", totalPrizes: 0, claimedTotal: 0 }]);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
        Add New Box for: <strong>{location?.name}</strong>
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <ToggleButtonGroup
          color="info"
          value={type}
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
      <Box sx={{ mt: 3, mb: 3, textAlign: 'center' }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Flare Sheet (Optional)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Upload an image of the flare sheet for this box
        </Typography>

        {uploadError && (
          <Alert severity="error" sx={{ mb: 2, maxWidth: 400, mx: 'auto' }}>
            {uploadError}
          </Alert>
        )}

        {!flareSheetPreview ? (
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
            <Card sx={{ maxWidth: 300 }}>
              <CardMedia
                component="img"
                height="200"
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
              <IconButton
                onClick={handleRemoveImage}
                disabled={uploading}
                color="error"
                size="small"
              >
                <Delete />
              </IconButton>
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
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            size="small"
            label="Box Name"
            fullWidth
            value={boxName}
            onChange={(e) => setBoxName(e.target.value)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            size="small"
            label="Box Number"
            fullWidth
            value={boxNumber}
            onChange={(e) => setBoxNumber(e.target.value)}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            size="small"
            label="Price Per Ticket"
            fullWidth
            value={pricePerTicket}
            onChange={(e) => setPricePerTicket(e.target.value)}
            required
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 3 }}>
          <TextField
            size="small"
            label="Starting # of Tickets"
            type="number"
            fullWidth
            value={startingTickets}
            onChange={(e) => setStartingTickets(e.target.value)}
            required
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1">Prizes</Typography>
        {winningTickets.map((prize, idx) => (
          <Grid container spacing={1} key={idx} sx={{ mt: 1 }}>
            <Grid size={{ xs: 6, sm: 6 }}>
              <TextField
                label="Prize Amount"
                value={prize.prize}
                onChange={(e) => handlePrizeChange(idx, "prize", e.target.value)}
                fullWidth
                size="small"
                required
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 6 }}>
              <TextField
                label="Total"
                type="number"
                value={prize.totalPrizes || ""}
                onChange={(e) => handlePrizeChange(idx, "totalPrizes", e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>
          </Grid>
        ))}
        <Button size="small" variant="contained" color="info" onClick={addPrize} sx={{ mt: 2 }}>
          Add Another
        </Button>
      </Box>

      <Button 
        size="small" 
        variant="contained" 
        onClick={() => { void handleSubmit(); }} 
        sx={{ mt: 4 }}
        disabled={uploading}
      >
        {uploading ? 'Creating Box...' : 'Submit Box'}
      </Button>
    </Box>
  );
};
