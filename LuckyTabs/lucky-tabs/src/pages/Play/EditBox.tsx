/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  TextField,
  Typography,
  Button,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
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
  boxName: string;
  winningTickets?: WinningTicket[];
  [key: string]: any;
};

export const EditBoxForm = ({ box, onClose, onBoxUpdated }: { box: BoxType; onClose: () => void; onBoxUpdated?: () => void }) => {
  const [type, setType] = useState<"wall" | "bar box">(box.type);
  const [boxNumber, setBoxNumber] = useState<string | number>(box.boxNumber);
  const [pricePerTicket, setPricePerTicket] = useState<string | number>(box.pricePerTicket);
  const [winningTickets, setWinningTickets] = useState<WinningTicket[]>(box.winningTickets || []);

  const handleSubmit = async () => {
    const updatedBox = {
      ...box,
      type,
      boxNumber,
      pricePerTicket,
      winningTickets,
      lastUpdated: serverTimestamp(),
    };

    try {
      const docRef = doc(db, "boxes", box.id);
      await setDoc(docRef, updatedBox, { merge: true });
      onBoxUpdated?.();
    } catch (err) {
      console.error("Error updating box:", err);
    }
  };

  const handlePrizeChange = (index: number, field: string, value: string | number) => {
    const updated = [...winningTickets];
    updated[index] = {
      ...updated[index],
      [field]: field === "prize" ? String(value) : Number(value),
    };
    setWinningTickets(updated);
  };

  const addPrize = () => {
    setWinningTickets([...winningTickets, { prize: "", totalPrizes: 0, claimedTotal: 0 }]);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>{box.boxName}</Typography>

      <ToggleButtonGroup
        value={type}
        exclusive
        onChange={(_, val: "wall" | "bar box" | null) => val && setType(val)}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="wall">Wall</ToggleButton>
        <ToggleButton value="bar box">Bar Box</ToggleButton>
      </ToggleButtonGroup>

      <Grid container spacing={2}>
        <Grid size={6}>
          <TextField
            label="Box Number"
            fullWidth
            value={boxNumber}
            onChange={(e) => setBoxNumber(e.target.value)}
          />
        </Grid>
        <Grid size={6}>
          <TextField
            label="Price Per Ticket"
            fullWidth
            value={pricePerTicket}
            onChange={(e) => setPricePerTicket(e.target.value)}
          />
        </Grid>
      </Grid>

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
                value={prize.totalPrizes}
                onChange={(e) => handlePrizeChange(idx, "totalPrizes", e.target.value)}
                fullWidth
              />
            </Grid>
            <Grid size={4}>
              <TextField
                label="Claimed Total"
                type="number"
                value={prize.claimedTotal}
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

      <Button variant="contained" onClick={() => { void handleSubmit(); }} sx={{ mt: 4 }}>
        Update Box
      </Button>
    </Box>
  );
};
