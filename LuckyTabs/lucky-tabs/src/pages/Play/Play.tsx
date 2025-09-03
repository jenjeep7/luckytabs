/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/prop-types */

import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Card,
  CardContent,
  Chip,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import PlaceIcon from '@mui/icons-material/Place';
import ShareIcon from '@mui/icons-material/Share';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { CreateBoxForm } from "./AddBox";
import { EditBoxForm } from "./EditBox";
import { BoxComponent } from "./BoxComponent";
import { LocationManager } from "./LocationManager";
import { LocationsMapSafe } from "./LocationsMapSafe";
import { useLocation } from "../../hooks/useLocation";
import { boxService, BoxItem } from "../../services/boxService";
import { userService, UserData } from "../../services/userService";
import { groupService, GroupData } from "../../services/groupService";
import ShareBoxDialog from "./ShareBoxDialog";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';

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

export const Play: React.FC = () => {
  // Use location context instead of local state
  const { 
    selectedLocation, 
    setSelectedLocation, 
    selectedLocationObj, 
    setSelectedLocationObj 
  } = useLocation();

  // Auth and user state
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userGroups, setUserGroups] = useState<GroupData[]>([]);

  // Box view toggle state
  const [boxView, setBoxView] = useState<'my' | 'group'>('my');
  
  // Group filtering state
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [allGroupBoxes, setAllGroupBoxes] = useState<BoxItem[]>([]);

  // Box state
  const [myBoxes, setMyBoxes] = useState<BoxItem[]>([]);
  const [groupBoxes, setGroupBoxes] = useState<BoxItem[]>([]);

  // Dialog state
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareBoxId, setShareBoxId] = useState<string>('');
  const [shareBoxName, setShareBoxName] = useState<string>('');

  // Restore missing helper functions
  const handleChange = (event: any) => {
    const locationId = event.target.value as string;
    setSelectedLocation(locationId);
    
    // Update the location object in context
    const location = locations.find(loc => loc.id === locationId);
    if (location) {
      setSelectedLocationObj(location);
    }
    
    if (locationId) {
      setShowLocationSelector(false);
    }
  };

  const handleChangeLocation = () => {
    setShowLocationSelector(true);
  };

  // Filter group boxes based on selected group
  const filterGroupBoxes = useCallback((boxes: BoxItem[], groupId: string) => {
    if (!groupId) {
      setGroupBoxes([]);
      return;
    }
    
    const filteredBoxes = boxes.filter(box => {
      if (!box.shares || box.shares.length === 0) return false;
      
      return box.shares.some(share => {
        if (share.shareType === 'group') {
          return share.sharedWith.includes(groupId);
        }
        return false;
      });
    });
    
    setGroupBoxes(filteredBoxes);
  }, []);

  const refreshBoxes = useCallback(async (boxIdToUpdate?: string) => {
    if (selectedLocation && user) {
      try {
        // Load user data if not already loaded
        if (!userData) {
          const userProfile = await userService.getUserProfile(user.uid);
          if (userProfile) {
            setUserData(userProfile);
          }
        }

        // Get both my boxes and shared boxes
        const { myBoxes: userBoxes, sharedBoxes } = await boxService.getAllBoxesForLocation(
          user.uid, 
          userGroups.map(group => group.id), 
          selectedLocation
        );

        // Enrich boxes with owner information
        const enrichedMyBoxes = await boxService.enrichBoxesWithOwnerInfo(userBoxes);
        const enrichedSharedBoxes = await boxService.enrichBoxesWithOwnerInfo(sharedBoxes);

        setMyBoxes(enrichedMyBoxes);
        setAllGroupBoxes(enrichedSharedBoxes);
        
        // Initialize selected group on first load - find group with boxes
        if (!selectedGroupId && userGroups.length > 0) {
          // Find a group that has boxes, or default to first group
          const groupWithBoxes = userGroups.find(group => {
            return enrichedSharedBoxes.some(box => 
              box.shares?.some(share => 
                share.shareType === 'group' && share.sharedWith.includes(group.id)
              )
            );
          });
          
          const defaultGroupId = groupWithBoxes ? groupWithBoxes.id : userGroups[0].id;
          setSelectedGroupId(defaultGroupId);
          filterGroupBoxes(enrichedSharedBoxes, defaultGroupId);
        } else if (selectedGroupId) {
          // Filter with existing selection
          filterGroupBoxes(enrichedSharedBoxes, selectedGroupId);
        }
        
        // If dialog is open, update editBox with latest data
        if (editBox && boxIdToUpdate) {
          const allBoxes = [...enrichedMyBoxes, ...enrichedSharedBoxes];
          const updatedBox = allBoxes.find(b => b.id === boxIdToUpdate);
          if (updatedBox) setEditBox(updatedBox);
        }
      } catch (error) {
        console.error("Error fetching boxes:", error);
        // Fallback to old method if new service fails
        await refreshBoxesOld(boxIdToUpdate);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation, user, userData, userGroups, selectedGroupId]);

  // Keep the old refresh method as fallback
  const refreshBoxesOld = async (boxIdToUpdate?: string) => {
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
        
        // Split into my boxes and others
        const userBoxes = data.filter(box => box.ownerId === user?.uid);
        const otherBoxes = data.filter(box => box.ownerId !== user?.uid);
        
        setMyBoxes(userBoxes);
        setGroupBoxes(otherBoxes);
        
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
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [openCreateBox, setOpenCreateBox] = useState(false);
  const [openLocationManager, setOpenLocationManager] = useState(false);
  const [editBox, setEditBox] = useState<BoxItem | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  // Get user location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setUserCoords(null);
        },
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 8000 }
      );
    }
  }, []);

  // Helper: Haversine formula for distance in meters
  function getDistanceMeters(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const x = dLat / 2;
    const y = dLng / 2;
    const h =
      Math.sin(x) * Math.sin(x) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(y) * Math.sin(y);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  // Sort locations by proximity if userCoords is available
  const sortedLocations = React.useMemo(() => {
    if (!userCoords) return locations;
    return [...locations].sort((a, b) => {
      const isValidCoords = (coords: any): coords is { lat: number; lng: number } => {
        return !!coords && typeof coords.lat === 'number' && typeof coords.lng === 'number';
      };

      if (!isValidCoords(a.coordinates) || !isValidCoords(b.coordinates)) return 0;
      const da = getDistanceMeters(userCoords, a.coordinates);
      const db = getDistanceMeters(userCoords, b.coordinates);
      return da - db;
    });
  }, [locations, userCoords]);

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



  // Update selectedLocationObj in context when locations load
  useEffect(() => {
    if (selectedLocation && locations.length > 0 && !selectedLocationObj) {
      const locationObj = locations.find((loc) => loc.id === selectedLocation);
      if (locationObj) {
        setSelectedLocationObj(locationObj);
      }
    }
  }, [selectedLocation, locations, selectedLocationObj, setSelectedLocationObj]);

  // Load user data when component mounts
  useEffect(() => {
    const loadUserData = async () => {
      if (user && !userData) {
        try {
          const userProfile = await userService.getUserProfile(user.uid);
          if (userProfile) {
            setUserData(userProfile);
            
            // Also load group details
            const groups = await groupService.getUserGroups(user.uid);
            setUserGroups(groups);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };
    void loadUserData();
  }, [user, userData]);

  // Initialize selected group when userData loads
  useEffect(() => {
    if (userGroups.length > 0 && !selectedGroupId) {
      // Find a group that has boxes, or default to first group
      const groupWithBoxes = userGroups.find(group => {
        return allGroupBoxes.some(box => 
          box.shares?.some(share => 
            share.shareType === 'group' && share.sharedWith.includes(group.id)
          )
        );
      });
      
      const defaultGroupId = groupWithBoxes ? groupWithBoxes.id : userGroups[0].id;
      setSelectedGroupId(defaultGroupId);
    }
  }, [userGroups, selectedGroupId, allGroupBoxes]);

  // Load boxes when location or user changes
  useEffect(() => {
    if (selectedLocation && user) {
      void refreshBoxes();
    }
  }, [selectedLocation, user, userData, userGroups, refreshBoxes]);

  // Get current boxes to display based on toggle
  const currentBoxes = boxView === 'my' ? myBoxes : groupBoxes;
  const wallBoxes = currentBoxes.filter((box) => box.type === "wall");
  const barBoxes = currentBoxes.filter((box) => box.type === "bar box");

  // Share box handlers
  const handleShareBox = (boxId: string, boxName: string) => {
    setShareBoxId(boxId);
    setShareBoxName(boxName);
    setShareDialogOpen(true);
  };

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
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
        Box Dashboard
      </Typography>

      {/* Show location selector if no location is selected OR user wants to change location */}
      {(!selectedLocation || showLocationSelector) && (
        <>
          {/* Locations Map */}
          {locations.length > 0 && (
            <LocationsMapSafe
              locations={sortedLocations}
              selectedLocationId={selectedLocation}
              onLocationSelect={(locationId: string) => {
                setSelectedLocation(locationId);
                const location = locations.find(loc => loc.id === locationId);
                if (location) {
                  setSelectedLocationObj(location);
                }
              }}
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
              {sortedLocations.map((loc) => (
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

      {selectedLocation && (
        <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            sx={{ bgcolor: 'secondary.main' }}
            onClick={() => setOpenCreateBox(true)}
          >
            Create New Box
          </Button>
        </Box>
      )}

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
          {/* Box View Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <ToggleButtonGroup
              value={boxView}
              exclusive
              onChange={(_, newView: 'my' | 'group' | null) => {
                if (newView !== null) {
                  setBoxView(newView);
                }
              }}
              aria-label="box view toggle"
            >
              <ToggleButton value="my" aria-label="my boxes">
                My Boxes ({myBoxes.length})
              </ToggleButton>
              <ToggleButton value="group" aria-label="group boxes">
                Group Boxes ({groupBoxes.length})
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Group Selector - only show when in group view */}
          {boxView === 'group' && (
            <Box sx={{ mb: 3 }}>
              {userGroups.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <FormControl sx={{ minWidth: 300 }}>
                    <InputLabel>Select Group</InputLabel>
                    <Select
                      value={selectedGroupId}
                      onChange={(event) => {
                        const value = event.target.value;
                        setSelectedGroupId(value);
                        filterGroupBoxes(allGroupBoxes, value);
                      }}
                      label="Select Group"
                    >
                      {userGroups.map((group) => (
                        <MenuItem key={group.id} value={group.id}>
                          {group.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="body2" color="text.secondary">
                    Showing boxes shared with this group
                  </Typography>
                </Box>
              ) : (
                <Paper sx={{ p: 4, textAlign: 'center', maxWidth: 600, mx: 'auto' }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    You&apos;re not in any groups yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Join or create groups to start sharing boxes with friends and see their shared boxes here.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => window.location.href = '/community?tab=groups'}
                  >
                    Go to Community Groups
                  </Button>
                </Paper>
              )}
            </Box>
          )}

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
                          {boxView === 'group' && box.ownerName && (
                            <><br />by {box.ownerName}</>
                          )}
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
                    
                    {/* Share button for my boxes */}
                    {boxView === 'my' && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareBox(box.id, box.boxName);
                          }}
                          sx={{ color: 'primary.main' }}
                        >
                          <ShareIcon fontSize="small" />
                        </IconButton>
                      </Box>
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
                {boxView === 'my' ? 'No boxes created yet' : 'No shared boxes for this location'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {boxView === 'my' 
                  ? 'Create your first box to get started with pull tab tracking'
                  : 'Boxes shared with you by friends will appear here'
                }
              </Typography>
              {boxView === 'my' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setOpenCreateBox(true)}
                >
                  Create Your First Box
                </Button>
              )}
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
          <Typography variant="h5" component="span">
            {editBox?.boxName}
          </Typography>
          <IconButton onClick={() => setEditBox(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, overflow: 'auto' }}>
          {editBox && (
            <Box sx={{ p: 1, pt: 3 }}>
              <BoxComponent
                title=""
                boxes={[editBox as any]}
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

      {/* Share Box Dialog */}
      {user && (
        <ShareBoxDialog
          open={shareDialogOpen}
          onClose={() => setShareDialogOpen(false)}
          onShare={() => {
            void refreshBoxes();
          }}
          boxId={shareBoxId}
          boxName={shareBoxName}
          currentUserId={user.uid}
        />
      )}
    </Box>
  );
};
