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
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Card,
  CardContent,
  Paper,
  Chip,
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import PlaceIcon from '@mui/icons-material/Place';
import SafeDialog from '../../components/SafeDialog';
import ShareIcon from '@mui/icons-material/Share';
import Edit from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Capacitor } from '@capacitor/core';
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase";
import * as firestoreService from "../../services/firestoreService";
import { CreateBoxForm } from "./AddBox";
import NeonToggle from "../../components/NeonToggle";
import CrystalBall from "../../components/CrystalBall";
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

  // Box type toggle state
  const [boxTypeView, setBoxTypeView] = useState<'bar' | 'wall'>('bar');
  const [boxView, setBoxView] = useState<'my' | 'group'>('my');
  
  // Group filtering state
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [allGroupBoxes, setAllGroupBoxes] = useState<BoxItem[]>([]);

  // Box state
  const [myBoxes, setMyBoxes] = useState<BoxItem[]>([]);
  const [groupBoxes, setGroupBoxes] = useState<BoxItem[]>([]);
  const [inactiveBoxes, setInactiveBoxes] = useState<BoxItem[]>([]);
  const [showInactive, setShowInactive] = useState(false);

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
        
        // TODO: Fetch inactive boxes - boxService currently filters them out
        // For now, inactive boxes section will be empty
        setInactiveBoxes([]);
        
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

  // Keep the old refresh method as fallback (not actively used)
  const refreshBoxesOld = async (boxIdToUpdate?: string) => {
    // This method is deprecated - use refreshBoxes instead
    await refreshBoxes(boxIdToUpdate);
  };

  const refreshLocations = async () => {
    try {
      const locationDocs = await firestoreService.getLocations();
      const data: Location[] = locationDocs.map((docData) => {
        const coordinates = docData.coordinates as { latitude: number; longitude: number } | undefined;
        const legacyCoords = docData.coordinates as any;
        return {
          id: docData.id as string,
          name: (docData.name ) || '',
          address: (docData.address as string) || '',
          type: (docData.type as "restaurant" | "bar") || 'bar',
          placeId: docData.placeId as string,
          coordinates: coordinates ? {
            lat: coordinates.latitude,
            lng: coordinates.longitude
          } : (legacyCoords?.lat ? {
            lat: legacyCoords.lat || legacyCoords._lat,
            lng: legacyCoords.lng || legacyCoords._long
          } : (docData.geo as any)?.latitude ? {
            lat: (docData.geo as any).latitude,
            lng: (docData.geo as any).longitude
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
  
  // Close box state
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [boxToClose, setBoxToClose] = useState<BoxItem | null>(null);
  const [isClosingBox, setIsClosingBox] = useState(false);

  // Delete box state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [boxToDelete, setBoxToDelete] = useState<BoxItem | null>(null);
  const [isDeletingBox, setIsDeletingBox] = useState(false);

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
        const locationDocs = await firestoreService.getLocations();
        const data: Location[] = locationDocs.map((docData) => {
          const coordinates = docData.coordinates as { latitude: number; longitude: number } | undefined;
          const legacyCoords = docData.coordinates as any;
          return {
            id: docData.id as string,
            name: (docData.name ) || '',
            address: (docData.address as string) || '',
            type: (docData.type as "restaurant" | "bar") || 'bar',
            placeId: docData.placeId as string,
            coordinates: coordinates ? {
              lat: coordinates.latitude,
              lng: coordinates.longitude
            } : (legacyCoords?.lat ? {
              lat: legacyCoords.lat || legacyCoords._lat,
              lng: legacyCoords.lng || legacyCoords._long
            } : (docData.geo as any)?.latitude ? {
              lat: (docData.geo as any).latitude,
              lng: (docData.geo as any).longitude
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
  const currentBoxes = boxView === 'my' ? myBoxes : groupBoxes

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

  // Close box handlers
  const handleCloseBox = (box: BoxItem) => {
    setBoxToClose(box);
    setCloseConfirmOpen(true);
  };

  const handleConfirmCloseBox = async () => {
    if (!boxToClose) return;
    
    setIsClosingBox(true);
    try {
      // Update the box's isActive field to false
      if (Capacitor.isNativePlatform()) {
        await firestoreService.updateBox(boxToClose.id, {
          isActive: false
        });
      } else {
        const boxRef = doc(db, 'boxes', boxToClose.id);
        await updateDoc(boxRef, {
          isActive: false
        });
      }
      
      // Refresh the boxes list
      await refreshBoxes();
      
      // Close the dialog
      setCloseConfirmOpen(false);
      setBoxToClose(null);
    } catch (error) {
      console.error('Error closing box:', error);
      // You could add error handling UI here if needed
    } finally {
      setIsClosingBox(false);
    }
  };

  const handleCancelCloseBox = () => {
    setCloseConfirmOpen(false);
    setBoxToClose(null);
  };

  // Delete box handlers (for permanent deletion)
  const handleDeleteBox = (box: BoxItem) => {
    setBoxToDelete(box);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteBox = async () => {
    if (!boxToDelete) return;
    
    setIsDeletingBox(true);
    try {
      // Permanently delete the box from Firestore
      if (Capacitor.isNativePlatform()) {
        await firestoreService.deleteBox(boxToDelete.id);
      } else {
        const boxRef = doc(db, 'boxes', boxToDelete.id);
        await deleteDoc(boxRef);
      }
      
      // Refresh the boxes list
      await refreshBoxes();
      
      // Close the dialog
      setDeleteConfirmOpen(false);
      setBoxToDelete(null);
    } catch (error) {
      console.error('Error deleting box:', error);
      alert('Failed to delete box. Please try again.');
    } finally {
      setIsDeletingBox(false);
    }
  };

  const handleCancelDeleteBox = () => {
    setDeleteConfirmOpen(false);
    setBoxToDelete(null);
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
          p: 2,
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
              setOpenCreateBox(true);
            }}
            size="small"
          >
            Create New Box
          </Button>
        </Box>
      )}

      {/* Create Box Modal */}
  <SafeDialog open={openCreateBox} onClose={() => setOpenCreateBox(false)} fullScreen>
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
      </SafeDialog>

      {/* Edit Box Modal */}
      <SafeDialog open={!!editFormBox} onClose={() => setEditFormBox(null)} fullScreen>
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
      </SafeDialog>

      {/* Display Box Dashboard */}
      {selectedLocation && (
        <Box sx={{ mt: 2 }}>
          {/* Box View Toggle (My/Group) */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <NeonToggle
              value={boxView}
              onChange={(newView) => setBoxView(newView as 'my' | 'group')}
              options={[
                { value: 'my', label: 'MY BOXES' },
                { value: 'group', label: 'GROUP BOXES' }
              ]}
            />
          </Box>

          {/* Box Type Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <NeonToggle
              value={boxTypeView}
              onChange={(newView) => setBoxTypeView(newView as 'bar' | 'wall')}
              options={[
                { value: 'bar', label: `BAR BOXES` },
                { value: 'wall', label: `WALL BOXES` }
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
          
          {/* Bar Boxes Section */}
          {boxTypeView === 'bar' && barBoxes.length > 0 && (
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
                  sm: 'repeat(auto-fit, minmax(320px, 1fr))',
                  lg: 'repeat(auto-fit, minmax(350px, 1fr))',
                },
                gap: 1.5,
                mb: 2,
                maxWidth: {
                  lg: '1400px',
                  xl: '1600px'
                },
                mx: 'auto'
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
                      ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
                              height: '100px',
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
                                {lastUpdated && (
                                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem', mt: 0.5 }}>
                                    Updated: {lastUpdated}
                                  </Typography>
                                )}
                              </Box>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 50 }}>
                                <CrystalBall
                                  percent={getBoxRTP(box)}
                                  size={56}
                                  showBase
                                  color={evStatus === 'Good' ? statusColors.good : evStatus === 'Decent' ? statusColors.decent : statusColors.poor}
                                />
                              </Box>
                            </Box>
                            
                            {/* Bottom section with buttons */}
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1 }}>
                                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCloseBox(box);
                                      }}
                                      sx={theme.neon.effects.interactiveIcon()}
                                      title="Close Box"
                                    >
                                      <ArchiveIcon fontSize="small" />
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
                                      sx={theme.neon.effects.interactiveIcon()}
                                    >
                                      <ShareIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                              </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          )}
          
          {/* Wall Boxes Section */}
          {boxTypeView === 'wall' && wallBoxes.length > 0 && (
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
                  sm: 'repeat(auto-fit, minmax(320px, 1fr))',
                  lg: 'repeat(auto-fit, minmax(350px, 1fr))',
                },
                gap: 1.5,
                mb: 2,
                maxWidth: {
                  lg: '1400px',
                  xl: '1600px'
                },
                mx: 'auto'
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
                  ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
                          height: '100px',
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
                            {/* <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.9rem', mt: 0.5 }}>
                              {boxView === 'group' && box.ownerName && (
                                <>by {box.ownerName}</>
                              )}
                            </Typography> */}
                            {lastUpdated && (
                              <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem', mt: 0.5 }}>
                                Updated: {lastUpdated}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 50 }}>
                            {evStatus !== 'No Data' && (
                              <CrystalBall
                                percent={getBoxRTP(box)}
                                size={56}
                                color={evStatus === 'Good' ? statusColors.good : evStatus === 'Decent' ? statusColors.decent : statusColors.poor}
                                showBase
                              />
                            )}
                          </Box>
                        </Box>
                        
                        {/* Bottom section with buttons */}
                        
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mt: 1 }}>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCloseBox(box);
                                  }}
                                  sx={theme.neon.effects.interactiveIcon()}
                                  title="Close Box"
                                >
                                  <ArchiveIcon fontSize="small" />
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
                                  sx={theme.neon.effects.interactiveIcon()}
                                >
                                  <ShareIcon fontSize="small" />
                                </IconButton>
                              </Box>
                          </Box>
                                  
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
          {((boxTypeView === 'wall' && wallBoxes.length === 0) || (boxTypeView === 'bar' && barBoxes.length === 0)) && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                {boxTypeView === 'bar' ? 'No bar boxes created yet' : 'No wall boxes created yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                { 
                   'Create your first box to get started with pull tab tracking'
                }
              </Typography>
            </Paper>
          )}

          {/* Inactive Boxes Section */}
          {inactiveBoxes.length > 0 && (
            <Box sx={{ mt: 4 }}>
              {/* Filter inactive boxes by current box type view */}
              {(() => {
                const filteredInactiveBoxes = inactiveBoxes.filter(box => 
                  boxTypeView === 'bar' ? box.type === 'bar box' : box.type === 'wall'
                );
                
                if (filteredInactiveBoxes.length === 0) return null;
                
                return (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <Button
                        onClick={() => setShowInactive(!showInactive)}
                        variant="outlined"
                        startIcon={showInactive ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        sx={{ 
                          borderColor: 'text.secondary',
                          color: 'text.secondary',
                          '&:hover': {
                            borderColor: 'text.primary',
                            color: 'text.primary'
                          }
                        }}
                      >
                        {showInactive ? 'Hide' : 'Show'} Closed {boxTypeView === 'bar' ? 'Bar' : 'Wall'} Boxes ({filteredInactiveBoxes.length})
                      </Button>
                    </Box>

                    {showInactive && (
                      <Box>
                        {/* Divider with text */}
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          mb: 3,
                          '&::before, &::after': {
                            content: '""',
                            flex: 1,
                            height: '1px',
                            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                          },
                          '&::before': { mr: 3 },
                          '&::after': { ml: 3 }
                        }}>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: 'text.secondary',
                              px: 2
                            }}
                          >
                            Closed {boxTypeView === 'bar' ? 'Bar' : 'Wall'} Boxes (View Only)
                          </Typography>
                        </Box>

                        {/* Inactive Boxes Grid */}
                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(auto-fit, minmax(320px, 1fr))',
                            lg: 'repeat(auto-fit, minmax(350px, 1fr))',
                          },
                          gap: 1.5,
                          mb: 2,
                          maxWidth: {
                            lg: '1400px',
                            xl: '1600px'
                          },
                          mx: 'auto'
                        }}>
                          {filteredInactiveBoxes.map((box) => {
                      // Calculate estimated tickets from either format
                      let estimatedTickets = box.estimatedRemainingTickets || 0;
                      
                      if (estimatedTickets === 0 && (box as any).rows && Array.isArray((box as any).rows)) {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
                        estimatedTickets = (box as any).rows.reduce((total: number, row: any) => {
                          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                          return total + (Number(row.estimatedTicketsRemaining) || 0);
                        }, 0);
                      }

                      // Get last updated timestamp
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
                          ? dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '';
                      }

                      return (
                        <Card 
                          key={box.id}
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            border: '2px solid',
                            borderColor: 'text.disabled',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            opacity: 0.7,
                            '&:hover': {
                              opacity: 1,
                              transform: 'translateY(-2px)',
                              boxShadow: 2,
                            }
                          }}
                          onClick={() => setEditBox(box)}
                        >
                          <CardContent sx={{ pt: 1, pb: 1 }}>
                            <Box sx={{ display: 'flex', gap: 1, height: '100%' }}>
                              {/* Flare sheet image */}
                              {box.flareSheetUrl && (
                                <Box sx={{ 
                                  width: '80px', 
                                  height: '100px',
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
                                      borderRadius: '4px',
                                      opacity: 0.6
                                    }}
                                  />
                                </Box>
                              )}
                              
                              {/* Content */}
                              <Box sx={{ 
                                flex: 1, 
                                display: 'flex', 
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                minHeight: box.flareSheetUrl ? '80px' : 'auto'
                              }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.secondary', fontSize: '1rem' }}>
                                      {box.boxName}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                                      Closed {lastUpdated ? `• ${lastUpdated}` : ''}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Chip
                                      label="CLOSED"
                                      size="small"
                                      sx={{ 
                                        fontSize: '0.65rem',
                                        height: '20px',
                                        backgroundColor: 'text.disabled',
                                        color: 'background.paper'
                                      }}
                                    />
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteBox(box);
                                      }}
                                      sx={{ 
                                        color: 'error.main',
                                        '&:hover': {
                                          backgroundColor: 'error.dark',
                                          color: 'error.contrastText'
                                        }
                                      }}
                                      title="Permanently Delete Box"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>
                                
                                {/* <Box sx={{ mt: 1 }}>
                                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.75rem' }}>
                                    Click to view details (view only)
                                  </Typography>
                                </Box> */}
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Box>
                </Box>
              )}
            </>
          );
        })()}
            </Box>
          )}
        </Box>
      )}

      {/* Full-Screen Box Details Dialog */}
      <SafeDialog 
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
                readOnly={editBox.isActive === false} // Make inactive boxes read-only
              />
            </Box>
          )}
        </DialogContent>
      </SafeDialog>

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

      {/* Close Box Confirmation Dialog */}
      <SafeDialog
        open={closeConfirmOpen}
        onClose={handleCancelCloseBox}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Close Box</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to close &ldquo;{boxToClose?.boxName}&rdquo;? This will mark the box as inactive and remove it from your active boxes list. 
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelCloseBox} color="primary" disabled={isClosingBox}>
            Cancel
          </Button>
          <Button 
            onClick={() => { void handleConfirmCloseBox(); }} 
            color="warning" 
            variant="contained"
            disabled={isClosingBox}
          >
            {isClosingBox ? 'Closing...' : 'Close Box'}
          </Button>
        </DialogActions>
      </SafeDialog>

      {/* Delete Box Confirmation Dialog */}
      <SafeDialog
        open={deleteConfirmOpen}
        onClose={handleCancelDeleteBox}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Permanently Delete Box</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to <strong>permanently delete</strong> &ldquo;{boxToDelete?.boxName}&rdquo;? 
            <Box component="span" sx={{ display: 'block', mt: 2, color: 'error.main', fontWeight: 'bold' }}>
              This action cannot be undone and all box data will be lost forever.
            </Box>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDeleteBox} color="primary" disabled={isDeletingBox}>
            Cancel
          </Button>
          <Button 
            onClick={() => { void handleConfirmDeleteBox(); }} 
            color="error" 
            variant="contained"
            disabled={isDeletingBox}
          >
            {isDeletingBox ? 'Deleting...' : 'Permanently Delete'}
          </Button>
        </DialogActions>
      </SafeDialog>
      </Box>
    </Box>
  );
};
