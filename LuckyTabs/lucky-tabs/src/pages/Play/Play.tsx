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
  DialogContentText,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  Paper,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import PlaceIcon from '@mui/icons-material/Place';
import ShareIcon from '@mui/icons-material/Share';
import Edit from '@mui/icons-material/Edit';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { CreateBoxForm } from "./AddBox";
import NeonToggle from "../../components/NeonToggle";
import NeonStatusPill from "../../components/NeonStatusPill";
import { trackHomePageVisit } from "../../utils/analytics";
import { EditBoxForm } from "./EditBox";
import { BoxComponent } from "./BoxComponent";
import { LocationManager } from "./LocationManager";
import { LocationsMapSafe } from "./LocationsMapSafe";
import { useLocation } from "../../hooks/useLocation";
import { boxService, BoxItem } from "../../services/boxService";
import { userService, UserData } from "../../services/userService";
import { groupService, GroupData } from "../../services/groupService";
import { useMetricThresholds, getBoxStatus } from '../../hooks/useMetricThresholds';
import ShareBoxDialog from "./ShareBoxDialog";
import { useAuthStateCompat } from '../../services/useAuthStateCompat';
import { statusColors, getNeonHeaderStyle } from '../../utils/neonUtils';
import { useTheme } from '@mui/material/styles';

interface Location {
  id: string;
  name: string;
  address?: string;
  type?: "restaurant" | "bar";
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  [key: string]: any;
}

interface WinningTicket {
  totalPrizes: number;
  claimedTotal: number;
  prize: string;
}

export const Play: React.FC = () => {
  const theme = useTheme();
  const metricThresholds = useMetricThresholds();
  
  // Use location context instead of local state
  const { 
    selectedLocation, 
    setSelectedLocation, 
    selectedLocationObj, 
    setSelectedLocationObj 
  } = useLocation();

  // Auth and user state
  const [user] = useAuthStateCompat();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userGroups, setUserGroups] = useState<GroupData[]>([]);

  // Track home page visits for analytics
  useEffect(() => {
    if (user) {
      trackHomePageVisit("logged_in");
    }
  }, [user]);

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
  const [shareBoxData, setShareBoxData] = useState<BoxItem | null>(null);

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
        const { myBoxes: rawMyBoxes, sharedBoxes: rawSharedBoxes } = await boxService.getAllBoxesForLocation(
          user.uid,
          userGroups.map(g => g.id),
          selectedLocation
        );

        // Filter shared boxes by selected group if applicable
        const userBoxes = rawMyBoxes;
        let sharedBoxes = rawSharedBoxes;
        
        if (selectedGroupId) {
          sharedBoxes = rawSharedBoxes.filter(box => 
            box.shares?.some(share => 
              share.shareType === 'group' && 
              share.sharedWith.includes(selectedGroupId)
            ) || false
          );
        }

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
  const [editFormBox, setEditFormBox] = useState<BoxItem | null>(null);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  
  // Replace box state
  const [replaceConfirmOpen, setReplaceConfirmOpen] = useState(false);
  const [boxToReplace, setBoxToReplace] = useState<BoxItem | null>(null);
  const [replaceMode, setReplaceMode] = useState(false);

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

  // Helper: Extract city from address
  const extractCityFromAddress = (address: string): string => {
    if (!address) return '';
    
    const parts = address.split(',').map(part => part.trim());
    
    for (let i = 1; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!/^\d/.test(part) &&
          !/^[A-Z]{2}$/.test(part) &&
          !/^\d{5}/.test(part) && 
          part.length > 2) { 
        return part;
      }
    }
    
    if (parts.length >= 2 && parts[1].length > 2) {
      return parts[1];
    }
    
    return '';
  };

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

  // Update share box data when dialog opens or boxes change
  useEffect(() => {
    if (shareDialogOpen && shareBoxId) {
      const allBoxes = [...myBoxes, ...groupBoxes];
      const boxData = allBoxes.find(box => box.id === shareBoxId);
      setShareBoxData(boxData || null);
    }
  }, [shareDialogOpen, shareBoxId, myBoxes, groupBoxes]);

  // Get current boxes to display based on toggle
  const currentBoxes = boxView === 'my' ? myBoxes : groupBoxes;

  // Helper to calculate RTP percent for a box
  function getBoxRTP(box: BoxItem): number {
    const pricePerTicket = parseFloat(box.pricePerTicket);
    let estimatedTickets = box.estimatedRemainingTickets || 0;
    // Check for rows array safely
    const rows = (box as unknown as { rows?: unknown }).rows;
    if (estimatedTickets === 0 && Array.isArray(rows)) {
      estimatedTickets = rows.reduce((total: number, row) => {
        if (row && typeof row === 'object' && 'estimatedTicketsRemaining' in row) {
          return total + (Number((row as { estimatedTicketsRemaining?: number }).estimatedTicketsRemaining) || 0);
        }
        return total;
      }, 0);
    }
    if (estimatedTickets > 0 && Array.isArray(box.winningTickets) && box.winningTickets.length > 0) {
      const prizes = box.winningTickets
        .filter((ticket) =>
          ticket && typeof ticket === 'object' &&
          'prize' in ticket && typeof ticket.prize === 'string' && ticket.prize.trim() !== '' &&
          'totalPrizes' in ticket && Number(ticket.totalPrizes) > 0
        )
        .map((ticket) => ({
          value: Number(ticket.prize),
          remaining: Number(ticket.totalPrizes) - Number(ticket.claimedTotal)
        }));
      const totalRemainingValue = prizes.reduce((sum: number, prize) => sum + (prize.value * prize.remaining), 0);
      const costToCloseOut = pricePerTicket * estimatedTickets;
      if (costToCloseOut > 0) {
        return (totalRemainingValue / costToCloseOut) * 100;
      }
    }
    return 0;
  }

  // Sort wallBoxes and barBoxes by RTP percent (highest to lowest)
  const wallBoxes = [...currentBoxes.filter((box) => box.type === "wall")].sort((a, b) => getBoxRTP(b) - getBoxRTP(a));
  const barBoxes = [...currentBoxes.filter((box) => box.type === "bar box")].sort((a, b) => getBoxRTP(b) - getBoxRTP(a));

  // Share box handlers
  const handleShareBox = (boxId: string, boxName: string) => {
    setShareBoxId(boxId);
    setShareBoxName(boxName);
    // Don't set shareBoxData here - let the dialog open and then set it
    // This ensures we always get the most current data
    setShareDialogOpen(true);
  };

  // Replace box handlers
  const handleReplaceBox = (box: BoxItem) => {
    setBoxToReplace(box);
    setReplaceConfirmOpen(true);
  };

  const handleConfirmReplace = () => {
    setReplaceConfirmOpen(false);
    setReplaceMode(true);
    setOpenCreateBox(true);
  };

  const handleCancelReplace = () => {
    setReplaceConfirmOpen(false);
    setBoxToReplace(null);
  };

  const handleCloseCreateBox = () => {
    setOpenCreateBox(false);
    setReplaceMode(false);
    setBoxToReplace(null);
  };

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: 'calc(100vh - 64px)',
      overflow: 'visible',
      '@media (max-width: 600px)': {
        minHeight: 'calc(100vh - 56px)',
      }
    }}>      
      <Box sx={{ 
        p: 3,
        '@media (max-width: 600px)': {
          p: 2, // Reduce padding on mobile
        }
      }}>
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
              {sortedLocations.map((loc) => {
                const city = extractCityFromAddress(String(loc.address || ''));
                return (
                  <MenuItem key={loc.id} value={loc.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1" sx={{ flex: 1 }}>
                        {loc.name}
                      </Typography>
                      {city && (
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            fontSize: '0.75rem',
                            fontStyle: 'italic'
                          }}
                        >
                          {city}
                        </Typography>
                      )}
                    </Box>
                  </MenuItem>
                );
              })}
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

      {/* Show change location button when a location is chosen and selector is hidden */}
      {selectedLocation && !showLocationSelector && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          mb: 2
        }}>
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
            sx={{ 
              bgcolor: 'secondary.main',
              color: '#0C0E10', // Dark text for better contrast on the neon background
              fontWeight: 700,
              textShadow: '0 1px 0 rgba(255,255,255,.5)', // White text shadow for readability
              '&:hover': {
                bgcolor: 'secondary.dark'
              }
            }}
            onClick={() => {
              setReplaceMode(false);
              setBoxToReplace(null);
              setOpenCreateBox(true);
            }}
            size="small"
          >
            Create New Box
          </Button>
        </Box>
      )}

      {/* Create Box Modal */}
  <Dialog open={openCreateBox} onClose={handleCloseCreateBox} fullScreen>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {replaceMode ? `Replace Box: ${boxToReplace?.boxName || 'Unknown'}` : 'Create New Box'}
          <IconButton onClick={handleCloseCreateBox}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedLocationObj && (
            <CreateBoxForm
              location={selectedLocationObj}
              onClose={handleCloseCreateBox}
              onBoxCreated={() => { void refreshBoxes(); }}
              replaceMode={replaceMode}
              boxToReplace={boxToReplace}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Box Modal */}
      <Dialog open={!!editFormBox} onClose={() => setEditFormBox(null)} fullScreen>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Edit Box
          <IconButton onClick={() => setEditFormBox(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {editFormBox && (
            <EditBoxForm
              box={editFormBox}
              onClose={() => setEditFormBox(null)}
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
            <NeonToggle
              value={boxView}
              onChange={(newView) => setBoxView(newView as 'my' | 'group')}
              options={[
                { value: 'my', label: `MY BOXES` },
                { value: 'group', label: `GROUP BOXES` }
              ]}
            />
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

          {/* Box Dashboard by Type */}
          
          {/* Wall Boxes Section */}
          {wallBoxes.length > 0 && (
            <Box sx={{ mb: 4 }}>
              {/* Group Header with Neon Divider */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 4,
                '&::before, &::after': {
                  content: '""',
                  flex: 1,
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #7DF9FF66, transparent)',
                  boxShadow: '0 0 8px rgba(125, 249, 255, 0.4)',
                  zIndex: 10
                },
                '&::before': { mr: 3 },
                '&::after': { ml: 3 }
              }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    ...getNeonHeaderStyle(),
                    px: 2
                  }}
                >
                  Wall Boxes
                </Typography>
              </Box>
              
              {/* Wall Boxes Grid */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: {
                  xs: '1fr',
                },
                gap: 1.5,
                mb: 2
              }}>
                {wallBoxes.map((box) => {
              const pricePerTicket = parseFloat(box.pricePerTicket);
              
              // Calculate estimated tickets from either format
              let estimatedTickets = box.estimatedRemainingTickets || 0;
              
              // If no top-level estimatedRemainingTickets, try to calculate from rows
              if (estimatedTickets === 0 && (box as any).rows && Array.isArray((box as any).rows)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                estimatedTickets = (box as any).rows.reduce((total: number, row: any) => {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                  return total + (Number(row.estimatedTicketsRemaining) || 0);
                }, 0);
              }
              
              // Calculate EV and metrics
              let evColor = statusColors.poor; // Default to poor
              let evStatus = 'No Data';
              
              if (estimatedTickets > 0 && box.winningTickets && Array.isArray(box.winningTickets) && box.winningTickets.length > 0) {
                const prizes = box.winningTickets
                  .filter((ticket: WinningTicket) => ticket.prize && ticket.prize.trim() !== '' && Number(ticket.totalPrizes) > 0)
                  .map((ticket: WinningTicket) => ({
                    value: Number(ticket.prize),
                    remaining: Number(ticket.totalPrizes) - Number(ticket.claimedTotal)
                  }));
                
                // Calculate remaining prize value
                const totalRemainingValue = prizes.reduce((sum: number, prize) => sum + (prize.value * prize.remaining), 0);
                
                // EV calculation: (total remaining prize value - cost to buy all tickets) / tickets
                const costToCloseOut = pricePerTicket * estimatedTickets;
                const evData = (totalRemainingValue - costToCloseOut) / estimatedTickets;
                const rtpData = (totalRemainingValue / costToCloseOut) * 100;
                
                // Color coding based on EV and RTP using custom user thresholds
                const boxStatus = getBoxStatus(evData, rtpData, metricThresholds);
                if (boxStatus === 'good') {
                  evColor = statusColors.good;
                  evStatus = 'Good';
                } else if (boxStatus === 'decent') {
                  evColor = statusColors.decent;
                  evStatus = 'Decent';
                } else {
                  evColor = statusColors.poor;
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
                    <Box sx={{ display: 'flex', gap: 1, height: '100%' }}>
                      {/* Flare sheet image - left side */}
                      {box.flareSheetUrl && (
                        <Box sx={{ 
                          width: '80px', 
                          height: '80px',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <img
                            src={box.flareSheetUrl}
                            alt={`Flare sheet for ${box.boxName}`}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              borderRadius: '4px'
                            }}
                          />
                        </Box>
                      )}
                      
                      {/* Content - right side */}
                      <Box sx={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: box.flareSheetUrl ? '80px' : 'auto'
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '1rem' }}>
                              {box.boxName}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem', mt: 0.5 }}>
                              {boxView === 'group' && box.ownerName && (
                                <>by {box.ownerName}</>
                              )}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 70 }}>
                            {evStatus !== 'No Data' && (
                              <NeonStatusPill
                                status={evStatus === 'Good' ? 'good' : evStatus === 'Decent' ? 'decent' : 'poor'}
                                label={evStatus}
                                size="small"
                                sx={{ mb: 0.5 }}
                              />
                            )}
                          </Box>
                        </Box>
                        
                        {/* Bottom section with timestamp and share button */}
                        {(lastUpdated || boxView === 'my') && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            {lastUpdated && (
                              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                                updated: {lastUpdated}
                              </Typography>
                            )}
                            {boxView === 'my' && (
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReplaceBox(box);
                                  }}
                                  sx={theme.neon.effects.interactiveIcon()}
                                  title="Replace Box"
                                >
                                  <AutorenewIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditFormBox(box);
                                  }}
                                  sx={theme.neon.effects.interactiveIcon()}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
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
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
            </Box>
          )}

          {/* Bar Boxes Section */}
          {barBoxes.length > 0 && (
            <Box sx={{ mb: 4 }}>
              {/* Group Header with Neon Divider */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 4,
                '&::before, &::after': {
                  content: '""',
                  flex: 1,
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #7DF9FF66, transparent)',
                  boxShadow: '0 0 8px rgba(125, 249, 255, 0.4)',
                  zIndex: 10
                },
                '&::before': { mr: 3 },
                '&::after': { ml: 3 }
              }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    ...getNeonHeaderStyle(),
                    px: 2
                  }}
                >
                  Bar Boxes
                </Typography>
              </Box>
              
              {/* Bar Boxes Grid */}
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: {
                  xs: '1fr',
                },
                gap: 1.5,
                mb: 2
              }}>
                {barBoxes.map((box) => {
                  const pricePerTicket = parseFloat(box.pricePerTicket);
                  
                  // Calculate estimated tickets from either format
                  let estimatedTickets = box.estimatedRemainingTickets || 0;
                  
                  // If no top-level estimatedRemainingTickets, try to calculate from rows
                  if (estimatedTickets === 0 && (box as any).rows && Array.isArray((box as any).rows)) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                    estimatedTickets = (box as any).rows.reduce((total: number, row: any) => {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                      return total + (Number(row.estimatedTicketsRemaining) || 0);
                    }, 0);
                  }
                  
                  // Calculate EV and metrics
                  let evColor = statusColors.poor; // Default to poor
                  let evStatus = 'No Data';
                  
                  if (estimatedTickets > 0 && box.winningTickets && Array.isArray(box.winningTickets) && box.winningTickets.length > 0) {
                    const prizes = box.winningTickets
                      .filter((ticket: WinningTicket) => ticket.prize && ticket.prize.toString().trim() !== '' && Number(ticket.totalPrizes) > 0)
                      .map((ticket: WinningTicket) => ({
                        value: Number(ticket.prize),
                        remaining: Number(ticket.totalPrizes) - Number(ticket.claimedTotal)
                      }));

                    // Calculate remaining prize value
                    const totalRemainingValue = prizes.reduce((sum: number, prize) => sum + (prize.value * prize.remaining), 0);

                    // EV calculation: (total remaining prize value - cost to buy all tickets) / tickets
                    const costToCloseOut = pricePerTicket * estimatedTickets;
                    const evData = (totalRemainingValue - costToCloseOut) / estimatedTickets;
                    const rtpData = (totalRemainingValue / costToCloseOut) * 100;

                    // Color coding based on EV and RTP using custom user thresholds
                    const boxStatus = getBoxStatus(evData, rtpData, metricThresholds);
                    if (boxStatus === 'good') {
                      evColor = statusColors.good;
                      evStatus = 'Good';
                    } else if (boxStatus === 'decent') {
                      evColor = statusColors.decent;
                      evStatus = 'Decent';
                    } else {
                      evColor = statusColors.poor;
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
                        <Box sx={{ display: 'flex', gap: 1, height: '100%' }}>
                          {/* Flare sheet image - left side */}
                          {box.flareSheetUrl && (
                            <Box sx={{ 
                              width: '80px', 
                              height: '80px',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <img
                                src={box.flareSheetUrl}
                                alt={`Flare sheet for ${box.boxName}`}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'contain',
                                  borderRadius: '4px'
                                }}
                              />
                            </Box>
                          )}
                          
                          {/* Content - right side */}
                          <Box sx={{ 
                            flex: 1, 
                            display: 'flex', 
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: box.flareSheetUrl ? '80px' : 'auto'
                          }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary', fontSize: '1rem' }}>
                                  {box.boxName}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem', mt: 0.5 }}>
                                  {boxView === 'group' && box.ownerName && (
                                    <>by {box.ownerName}</>
                                  )}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 70 }}>
                                <NeonStatusPill
                                  status={evStatus === 'Good' ? 'good' : evStatus === 'Decent' ? 'decent' : 'poor'}
                                  label={evStatus}
                                  size="small"
                                  sx={{ mb: 0.5 }}
                                />
                              </Box>
                            </Box>
                            
                            {/* Bottom section with timestamp and share button */}
                            {(lastUpdated || boxView === 'my') && (
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                {lastUpdated && (
                                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                                    Updated: {lastUpdated}
                                  </Typography>
                                )}
                                {boxView === 'my' && (
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleReplaceBox(box);
                                      }}
                                      sx={theme.neon.effects.interactiveIcon()}
                                      title="Replace Box"
                                    >
                                      <AutorenewIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditFormBox(box);
                                      }}
                                      sx={theme.neon.effects.interactiveIcon()}
                                    >
                                      <Edit fontSize="small" />
                                    </IconButton>
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
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          )}

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
            </Paper>
          )}
        </Box>
      )}

      {/* Full-Screen Box Details Dialog */}
      <Dialog 
        open={!!editBox}
        onClose={() => {
          void refreshBoxes(); // Refresh boxes to get updated estimated tickets
          setEditBox(null);
        }}
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
          <IconButton onClick={() => {
            void refreshBoxes(); // Refresh boxes to get updated estimated tickets
            setEditBox(null);
          }}>
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
                userGroups={userGroups.map(g => g.id)} // Pass group IDs for permission checking
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
          onClose={() => {
            setShareDialogOpen(false);
            setShareBoxData(null); // Clear box data when closing
          }}
          onShare={() => {
            void refreshBoxes();
          }}
          boxId={shareBoxId}
          boxName={shareBoxName}
          currentUserId={user.uid}
          existingShares={shareBoxData?.shares || []}
        />
      )}

      {/* Replace Box Confirmation Dialog */}
      <Dialog
        open={replaceConfirmOpen}
        onClose={handleCancelReplace}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Replace Box</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to replace &ldquo;{boxToReplace?.boxName}&rdquo;? This action cannot be undone and will permanently delete the current box data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelReplace} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmReplace} color="error" variant="contained">
            Replace Box
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    </Box>
  );
};
