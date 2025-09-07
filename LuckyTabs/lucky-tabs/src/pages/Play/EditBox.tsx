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
  IconButton,
  LinearProgress,
  Alert,
} from "@mui/material";
import { PhotoCamera, Delete } from "@mui/icons-material";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebase";
import { useState } from "react";

type WinningTicket = {
  prize: string;
  totalPrizes: number;
  claimedTotal: number;
};

type BoxType = {
  id: string;
  type: "wall" | "bar box";
  boxNumber: string | number;
  pricePerTicket: string | number;
  startingTickets?: number;
  boxName: string;
  winningTickets?: WinningTicket[];
  flareSheetUrl?: string;
  [key: string]: any;
};

export const EditBoxForm = ({ box, onClose, onBoxUpdated }: { box: BoxType; onClose: () => void; onBoxUpdated?: () => void }) => {
  const [type, setType] = useState<"wall" | "bar box">(box.type);
  const [boxNumber, setBoxNumber] = useState<string | number>(box.boxNumber);
  const [pricePerTicket, setPricePerTicket] = useState<string | number>(box.pricePerTicket);
  const [startingTickets, setStartingTickets] = useState<string>(box.startingTickets ? box.startingTickets.toString() : "");
  const [winningTickets, setWinningTickets] = useState<WinningTicket[]>(box.winningTickets || []);
  const [flareSheetImage, setFlareSheetImage] = useState<File | null>(null);
  const [flareSheetUrl, setFlareSheetUrl] = useState<string>(box.flareSheetUrl || "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
        type,
        boxNumber,
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
        <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center' }}>
          Flare Sheet Image
        </Typography>
        
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
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
              <IconButton
                color="error"
                onClick={() => setFlareSheetUrl("")}
                size="small"
              >
                <Delete />
              </IconButton>
            </Box>
          </Card>
        )}

        {/* Image Upload */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<PhotoCamera />}
            disabled={uploading}
          >
            {flareSheetUrl ? 'Change Image' : 'Upload Image'}
            <input
              hidden
              accept="image/*"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setFlareSheetImage(file);
                  // Preview the new image
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    setFlareSheetUrl(e.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </Button>
          {flareSheetImage && (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              New image selected: {flareSheetImage.name}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Grid container spacing={2} sx={{ maxWidth: 600 }}>
          <Grid size={4}>
            <TextField
              label="Box Number"
              fullWidth
              value={boxNumber}
              onChange={(e) => setBoxNumber(e.target.value)}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label="Price Per Ticket"
              fullWidth
              value={pricePerTicket}
              onChange={(e) => setPricePerTicket(e.target.value)}
            />
          </Grid>
          <Grid size={4}>
            <TextField
              label="Starting # of Tickets"
              type="number"
              fullWidth
              value={startingTickets}
              onChange={(e) => setStartingTickets(e.target.value)}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1">Winning Prizes</Typography>
        {winningTickets.map((prize, idx) => (
          <Grid container spacing={1} key={idx} sx={{ mt: 1 }}>
            <Grid size={4}>
              <TextField
                label="Prize"
                value={prize.prize}
                onChange={(e) => handlePrizeChange(idx, "prize", e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid size={4}>
              <TextField
                label="Total Prizes"
                type="number"
                value={prize.totalPrizes || ""}
                onChange={(e) => handlePrizeChange(idx, "totalPrizes", e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid size={4}>
              <TextField
                label="Claimed Total"
                type="number"
                value={prize.claimedTotal || ""}
                onChange={(e) => handlePrizeChange(idx, "claimedTotal", e.target.value)}
                fullWidth
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
        disabled={uploading}
      >
        {uploading ? 'Updating...' : 'Update Box'}
      </Button>
    </Box>
  );
};
