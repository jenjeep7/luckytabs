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
  Card,
  CardContent,
  Chip,
  Paper,
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

interface WinningTicket {
  totalPrizes: number;
  claimedTotal: number;
  prize: string;
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
  winningTickets?: WinningTicket[];
  estimatedRemainingTickets?: number;
  [key: string]: any;
}

export const Play: React.FC = () => {
  // Restore missing helper functions
  const handleChange = (event: any) => {
    setSelectedLocation(event.target.value as string);
    if (event.target.value) {
      setShowLocationSelector(false);
    }
  };

  const handleChangeLocation = () => {
    setShowLocationSelector(true);
  };

  const refreshBoxes = async (boxIdToUpdate?: string) => {
    if (selectedLocation) {
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
            isActive: docData.isActive !== false,
            ...docData,
          };
        })
        .filter((box) => box.locationId === selectedLocation && box.isActive);
        setBoxes(data);
        // If dialog is open, update editBox with latest data
        if (editBox && boxIdToUpdate) {
          const updatedBox = data.find(b => b.id === boxIdToUpdate);
          if (updatedBox) setEditBox(updatedBox);
        }
      } catch (error) {
        console.error("Error fetching boxes:", error);
      }
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
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [boxes, setBoxes] = useState<BoxItem[]>([]);
  const [openCreateBox, setOpenCreateBox] = useState(false);
  const [openLocationManager, setOpenLocationManager] = useState(false);
  const [editBox, setEditBox] = useState<BoxItem | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

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

  const selectedLocationObj = locations.find((loc) => loc.id === selectedLocation);
  const wallBoxes = boxes.filter((box) => box.type === "wall");
  const barBoxes = boxes.filter((box) => box.type === "bar box");

  return (
    <Box sx={{ 
      p: 3, 
      width: '100%', 
      minHeight: 'calc(100vh - 64px)', // Account for AppBar height
      overflow: 'visible',
      '@media (max-width: 600px)': {
        p: 2, // Reduce padding on mobile
        minHeight: 'calc(100vh - 56px)', // Smaller AppBar on mobile
      }
    }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
        Play Pull Tabs
      </Typography>

      {/* Show location selector if no location is selected OR user wants to change location */}
      {(!selectedLocation || showLocationSelector) && (
        <>
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

          {/* Manage Locations button - only show during location selection */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<PlaceIcon />}
              onClick={() => setOpenLocationManager(true)}
            >
              Manage Locations
            </Button>
          </Box>
        </>
      )}

      {/* Show selected location info when a location is chosen and selector is hidden */}
      {selectedLocation && !showLocationSelector && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          p: 2, 
          bgcolor: 'background.paper', 
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          mb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlaceIcon color="primary" />
            <Typography variant="h6">
              {selectedLocationObj?.name}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={handleChangeLocation}
            startIcon={<PlaceIcon />}
          >
            Change Location
          </Button>
        </Box>
      )}

      <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          sx={{ bgcolor: 'secondary.main' }}
          disabled={!selectedLocation}
          onClick={() => setOpenCreateBox(true)}
        >
          Create Box for Location
        </Button>
      </Box>

      {/* Create Box Modal */}
  <Dialog open={openCreateBox} onClose={() => setOpenCreateBox(false)} fullScreen>
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
              onBoxCreated={() => { void refreshBoxes(); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Box Modal */}
  <Dialog open={!!editBox} onClose={() => setEditBox(null)} fullScreen>
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
              onBoxUpdated={() => { void refreshBoxes(); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Display Box Dashboard */}
      {selectedLocation && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
            Pull Tab Dashboard - {selectedLocationObj?.name}
          </Typography>

          {/* Box Dashboard Grid */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fill, minmax(180px, 1fr))',
              md: 'repeat(auto-fill, minmax(200px, 1fr))',
              lg: 'repeat(auto-fill, minmax(220px, 1fr))',
            },
            gap: 1.5,
            mb: 2
          }}>
            {[...wallBoxes, ...barBoxes].map((box) => {
              const pricePerTicket = parseFloat(box.pricePerTicket);
              const estimatedTickets = box.estimatedRemainingTickets || 0;
              
              // Calculate EV and metrics
              let evColor = '#757575'; // Default gray
              let evStatus = 'No Data';
              
              if (estimatedTickets > 0 && box.winningTickets) {
                const prizes = box.winningTickets.map((ticket: WinningTicket) => ({
                  value: Number(ticket.prize),
                  remaining: Number(ticket.totalPrizes) - Number(ticket.claimedTotal)
                }));
                
                // Calculate remaining prize value
                const totalRemainingValue = prizes.reduce((sum: number, prize) => sum + (prize.value * prize.remaining), 0);
                
                // EV calculation: (total remaining prize value - cost to buy all tickets) / tickets
                const costToCloseOut = pricePerTicket * estimatedTickets;
                const evData = (totalRemainingValue - costToCloseOut) / estimatedTickets;
                const rtpData = (totalRemainingValue / costToCloseOut) * 100;
                
                // Color coding based on EV and RTP
                if (evData >= 0) {
                  evColor = '#4caf50'; // Green for positive EV
                  evStatus = 'Excellent';
                } else if (rtpData >= 75) {
                  evColor = '#ff9800'; // Orange for decent RTP
                  evStatus = 'Decent';
                } else {
                  evColor = '#f44336'; // Red for poor
                  evStatus = 'Poor';
                }
              }

              // Get last updated timestamp for estimated tickets
              let lastUpdated = '';
              if (box.estimatedTicketsUpdated) {
                const dateObj = typeof box.estimatedTicketsUpdated === 'string'
                  ? new Date(box.estimatedTicketsUpdated)
                  : (box.estimatedTicketsUpdated &&
                      typeof box.estimatedTicketsUpdated === 'object' &&
                      typeof (box.estimatedTicketsUpdated as { toDate?: unknown }).toDate === 'function'
                      ? (box.estimatedTicketsUpdated as { toDate: () => Date }).toDate()
                      : box.estimatedTicketsUpdated);
                lastUpdated = dateObj instanceof Date && !isNaN(dateObj.getTime())
                  ? dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '';
              }
              return (
                <Card 
                  key={box.id}
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out',
                    border: '3px solid',
                    borderColor: evColor,
                    backgroundColor: `${evColor}08`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 20px ${evColor}40`,
                      borderColor: evColor,
                    }
                  }}
                  onClick={() => setEditBox(box)}
                >
                  <CardContent sx={{ pt: 1, pb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '1rem' }}>
                          {box.boxName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem', mt: 0.5 }}>
                          #{box.boxNumber} • {box.type === 'wall' ? 'Wall Box' : 'Bar Box'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 70 }}>
                        <Chip
                          label={evStatus}
                          size="small"
                          sx={{
                            backgroundColor: evColor,
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.7rem',
                            height: 24,
                            px: 1,
                            mb: 0.5
                          }}
                        />
                        {/* EV Calculation under chip */}
                        {estimatedTickets > 0 && box.winningTickets && (
                          <Typography variant="caption" sx={{ color: evColor, fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'right' }}>
                            Payout: {(() => {
                              const prizes = box.winningTickets.map((ticket: WinningTicket) => ({
                                value: Number(ticket.prize),
                                remaining: Number(ticket.totalPrizes) - Number(ticket.claimedTotal)
                              }));
                              const totalRemainingValue = prizes.reduce((sum: number, prize) => sum + (prize.value * prize.remaining), 0);
                              const costToCloseOut = pricePerTicket * estimatedTickets;
                              const rtpData = (totalRemainingValue / costToCloseOut) * 100;
                              return `${rtpData.toFixed(1)}%`;
                            })()}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {/* Last updated timestamp for estimated tickets */}
                    {lastUpdated && (
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem', textAlign: 'right', display: 'block', mt: 1 }}>
                        updated: {lastUpdated}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>

          {/* No boxes message */}
          {wallBoxes.length === 0 && barBoxes.length === 0 && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No boxes found for this location
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Create your first box to get started with pull tab tracking
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenCreateBox(true)}
              >
                Create Your First Box
              </Button>
            </Paper>
          )}
        </Box>
      )}

      {/* Full-Screen Box Details Dialog */}
      <Dialog 
        open={!!editBox}
        onClose={() => setEditBox(null)}
        maxWidth={false}
        fullWidth
        slotProps={{
          paper: {
            sx: {
              width: '95vw',
              height: '95vh',
              maxWidth: 'none',
              maxHeight: 'none',
              m: 1
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h5">
            {editBox?.boxName}
          </Typography>
          <IconButton onClick={() => setEditBox(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: 'auto' }}>
          {editBox && (
            <Box sx={{ p: 3 }}>
              <BoxComponent
                title=""
                boxes={[editBox]}
                onBoxClick={() => { /* No action needed since we're already in the detail view */ }}
                onBoxRemoved={() => {
                  void refreshBoxes();
                  setEditBox(null); // Close dialog when box is removed
                }}
                showOwner={true}
                marginTop={0}
                refreshBoxes={(boxId: string | undefined) => { void refreshBoxes(boxId); }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

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
