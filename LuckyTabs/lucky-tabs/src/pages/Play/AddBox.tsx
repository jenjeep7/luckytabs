/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
} from "@mui/material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase";
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
console.log("user", user);
  const handleSubmit = async () => {
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
};

    try {
      await addDoc(collection(db, "boxes"), newBox);
      alert("Box created successfully");
      onBoxCreated?.();
      onClose();
    } catch (err) {
      console.error("Error creating box:", err);
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

      <Button size="small" variant="contained" onClick={() => { void handleSubmit(); }} sx={{ mt: 4 }}>
        Submit Box
      </Button>
    </Box>
  );
};
