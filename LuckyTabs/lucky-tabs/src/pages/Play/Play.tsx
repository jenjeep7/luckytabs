/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import PlaceIcon from '@mui/icons-material/Place';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { CreateBoxForm } from "./AddBox";
import { EditBoxForm } from "./EditBox";
import { BoxComponent } from "./BoxComponent";
import { LocationManager } from "./LocationManager";
import { LocationsMapSafe } from "./LocationsMapSafe";

interface Location {
  id: string;
  name: string;
  [key: string]: any;
}

interface BoxItem {
  id: string;
  boxName: string;
  boxNumber: string;
  pricePerTicket: string;
  type: "wall" | "bar box";
  locationId: string;
  ownerId: string;
  isActive?: boolean;
  [key: string]: any;
}

export const Play: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [boxes, setBoxes] = useState<BoxItem[]>([]);
  const [openCreateBox, setOpenCreateBox] = useState(false);
  const [openLocationManager, setOpenLocationManager] = useState(false);
  const [editBox, setEditBox] = useState<BoxItem | null>(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const snapshot = await getDocs(collection(db, "locations"));
        const data: Location[] = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            name: (docData.name as string) || '',
            address: (docData.address as string) || '',
            type: (docData.type as "restaurant" | "bar") || 'bar',
            placeId: docData.placeId as string,
            coordinates: docData.coordinates ? {
              lat: docData.coordinates.lat || (docData.coordinates._lat as number),
              lng: docData.coordinates.lng || (docData.coordinates._long as number)
            } : (docData.geo ? {
              lat: docData.geo.latitude,
              lng: docData.geo.longitude
            } : undefined),
          };
        });
        setLocations(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      }
    };

    void fetchLocations();
  }, []);

  useEffect(() => {
    const fetchBoxes = async () => {
      if (!selectedLocation) return;

      try {
        const snapshot = await getDocs(collection(db, "boxes"));
        const data: BoxItem[] = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            id: doc.id,
            boxName: (docData.boxName as string) || '',
            boxNumber: (docData.boxNumber as string) || '',
            pricePerTicket: (docData.pricePerTicket as string) || '',
            type: (docData.type as "wall" | "bar box") || 'wall',
            locationId: (docData.locationId as string) || '',
            ownerId: (docData.ownerId as string) || '',
            isActive: docData.isActive !== false, // Default to true if not specified
            ...docData,
          };
        })
        .filter((box) => box.locationId === selectedLocation && box.isActive);

        setBoxes(data);
      } catch (error) {
        console.error("Error fetching boxes:", error);
      }
    };

    void fetchBoxes();
  }, [selectedLocation]);

  const handleChange = (event: SelectChangeEvent) => {
    setSelectedLocation(event.target.value);
  };

  const refreshBoxes = () => {
    // Re-trigger the fetchBoxes useEffect by updating a dependency
    // Since selectedLocation is already a dependency, we can just call fetchBoxes directly
    if (selectedLocation) {
      const fetchBoxes = async () => {
        try {
          const snapshot = await getDocs(collection(db, "boxes"));
          const data: BoxItem[] = snapshot.docs.map((doc) => {
            const docData = doc.data();
            return {
              id: doc.id,
              boxName: (docData.boxName as string) || '',
              boxNumber: (docData.boxNumber as string) || '',
              pricePerTicket: (docData.pricePerTicket as string) || '',
              type: (docData.type as "wall" | "bar box") || 'wall',
              locationId: (docData.locationId as string) || '',
              ownerId: (docData.ownerId as string) || '',
              isActive: docData.isActive !== false, // Default to true if not specified
              ...docData,
            };
          })
          .filter((box) => box.locationId === selectedLocation && box.isActive);

          setBoxes(data);
        } catch (error) {
          console.error("Error fetching boxes:", error);
        }
      };

      void fetchBoxes();
    }
  };

  const refreshLocations = async () => {
    try {
      const snapshot = await getDocs(collection(db, "locations"));
      const data: Location[] = snapshot.docs.map((doc) => {
        const docData = doc.data();
        return {
          id: doc.id,
          name: (docData.name as string) || '',
          address: (docData.address as string) || '',
          type: (docData.type as "restaurant" | "bar") || 'bar',
          placeId: docData.placeId as string,
          coordinates: docData.coordinates ? {
            lat: docData.coordinates.lat || (docData.coordinates._lat as number),
            lng: docData.coordinates.lng || (docData.coordinates._long as number)
          } : (docData.geo ? {
            lat: docData.geo.latitude,
            lng: docData.geo.longitude
          } : undefined),
        };
      });
      setLocations(data);
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const selectedLocationObj = locations.find((loc) => loc.id === selectedLocation);
  const wallBoxes = boxes.filter((box) => box.type === "wall");
  const barBoxes = boxes.filter((box) => box.type === "bar box");

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
        Play Pull Tabs
      </Typography>
      {/* Locations Map */}
      {locations.length > 0 && (
        <LocationsMapSafe
          locations={locations}
          selectedLocationId={selectedLocation}
          onLocationSelect={setSelectedLocation}
          height={400}
        />
      )}

      <FormControl fullWidth sx={{ mt: 0 }} size="small">
        <InputLabel id="location-select-label" size="small">Select Location</InputLabel>
        <Select
          labelId="location-select-label"
          value={selectedLocation}
          label="Select Location"
          onChange={handleChange}
          size="small"
        >
          {locations.map((loc) => (
            <MenuItem key={loc.id} value={loc.id}>
              {loc.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          sx={{ bgcolor: 'secondary.main' }}
          disabled={!selectedLocation}
          onClick={() => setOpenCreateBox(true)}
        >
          Create Box for Location
        </Button>
        
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<PlaceIcon />}
          onClick={() => setOpenLocationManager(true)}
        >
          Manage Locations
        </Button>
      </Box>

      {/* Create Box Modal */}
      <Dialog open={openCreateBox} onClose={() => setOpenCreateBox(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Create New Box
          <IconButton onClick={() => setOpenCreateBox(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedLocationObj && (
            <CreateBoxForm
              location={selectedLocationObj}
              onClose={() => setOpenCreateBox(false)}
              onBoxCreated={refreshBoxes}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Box Modal */}
      <Dialog open={!!editBox} onClose={() => setEditBox(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit Box
          <IconButton onClick={() => setEditBox(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {editBox && (
            <EditBoxForm
              box={editBox}
              onClose={() => setEditBox(null)}
              onBoxUpdated={refreshBoxes}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Display Boxes */}
      {selectedLocation && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="h6" gutterBottom>
            Boxes at {selectedLocationObj?.name}
          </Typography>

          <BoxComponent
            title="Wall Boxes"
            boxes={wallBoxes}
            onBoxClick={setEditBox}
            onBoxRemoved={refreshBoxes}
            marginTop={3}
          />

          <BoxComponent
            title="Bar Boxes"
            boxes={barBoxes}
            onBoxClick={setEditBox}
            onBoxRemoved={refreshBoxes}
            showOwner={true}
            marginTop={4}
          />

          {wallBoxes.length === 0 && barBoxes.length === 0 && (
            <Typography sx={{ mt: 3 }} color="text.secondary">
              No boxes found for this location.
            </Typography>
          )}
        </Box>
      )}

      {/* Location Manager Dialog */}
      <LocationManager
        open={openLocationManager}
        onClose={() => setOpenLocationManager(false)}
        locations={locations}
        onLocationAdded={() => { void refreshLocations(); }}
      />
    </Box>
  );
};
