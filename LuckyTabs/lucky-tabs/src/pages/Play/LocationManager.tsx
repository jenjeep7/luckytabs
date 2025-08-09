/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  Chip,
  TextField,
} from '@mui/material';
import { Delete as DeleteIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { getGoogleMapsLoader } from '../../utils/googleMapsLoader';
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';

interface Location {
  id: string;
  name: string;
  address?: string;
  placeId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  businessInfo?: {
    phone?: string;
    website?: string;
    rating?: number;
    businessType?: string[];
  };
  addedBy?: string;
  createdAt?: any;
}

interface LocationManagerProps {
  open: boolean;
  onClose: () => void;
  locations: Location[];
  onLocationAdded: () => void;
}

export const LocationManager: React.FC<LocationManagerProps> = ({
  open,
  onClose,
  locations,
  onLocationAdded,
}) => {
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (open) {
      // Add a small delay to ensure the input ref is available
      const timer = setTimeout(() => {
        if (inputRef.current) {
          void initializeGoogleMaps();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  }, [open]);

  const initializeGoogleMaps = async () => {
    try {
      await getGoogleMapsLoader();

      if (!inputRef.current) {
        throw new Error('Input element not found');
      }

      // Suppress the deprecation warning temporarily
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        if (args[0]?.includes?.('google.maps.places.Autocomplete is not available')) {
          return; // Suppress this specific warning
        }
        originalWarn.apply(console, args);
      };
      
      // Get the input element from the TextField ref
      const inputElement = inputRef.current;
      
      if (!inputElement || !(inputElement instanceof HTMLInputElement)) {
        throw new Error('Valid HTML input element not found');
      }
      
      const autocompleteInstance = new (window as any).google.maps.places.Autocomplete(inputElement, {
        types: ['establishment'],
        fields: [
          'place_id',
          'name',
          'formatted_address',
          'geometry',
          'types',
          'rating',
          'formatted_phone_number',
          'website',
          'business_status'
        ],
      });
      
      // Restore console.warn
      console.warn = originalWarn;

      // Restrict to restaurants and bars
      autocompleteInstance.setComponentRestrictions({ country: 'us' });

      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace();
        
        if (place && place.geometry && place.place_id) {
          // Check if it's a restaurant or bar
          const isRestaurantOrBar = place.types?.some((type: string) => 
            ['restaurant', 'bar', 'meal_takeaway', 'food', 'night_club', 'establishment'].includes(type)
          );

          if (isRestaurantOrBar || place.types?.includes('establishment')) {
            setSelectedPlace(place);
            setError('');
            
            // Update the input field with the selected place name
            if (inputElement) {
              inputElement.value = place.name || place.formatted_address || '';
              // Trigger React's change event for controlled components
              const event = new Event('input', { bubbles: true });
              inputElement.dispatchEvent(event);
            }
          } else {
            setError('Please select a restaurant or bar location.');
            setSelectedPlace(null);
          }
        }
      });
      
      // Fix autocomplete dropdown styling to work with Material-UI themes
      const style = document.createElement('style');
      style.textContent = `
        .pac-container {
          z-index: 9999 !important;
          background: var(--mui-palette-background-paper, white) !important;
          color: var(--mui-palette-text-primary, #000) !important;
          border: 1px solid var(--mui-palette-divider, #ccc) !important;
          border-radius: 4px !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2) !important;
          font-family: 'Roboto', Arial, sans-serif !important;
          font-size: 14px !important;
          max-height: 200px !important;
          overflow-y: auto !important;
        }
        .pac-item {
          cursor: pointer !important;
          padding: 8px 12px !important;
          border-bottom: 1px solid var(--mui-palette-divider, #f0f0f0) !important;
          display: block !important;
          visibility: visible !important;
          color: var(--mui-palette-text-primary, #333) !important;
        }
        .pac-item:hover {
          background-color: var(--mui-palette-action-hover, #f5f5f5) !important;
        }
        .pac-item-selected {
          background-color: var(--mui-palette-action-selected, #e3f2fd) !important;
        }
        .pac-matched {
          font-weight: bold !important;
          color: var(--mui-palette-primary-main, #1976d2) !important;
        }
        .pac-item-query {
          color: var(--mui-palette-text-primary, #333) !important;
          font-size: 14px !important;
        }
        .pac-icon {
          display: inline-block !important;
          margin-right: 8px !important;
        }
      `;
      document.head.appendChild(style);
    } catch (err) {
      console.error('💥 Error loading Google Maps:', err);
      
      let errorMessage = 'Error loading Google Maps';
      if (err instanceof Error) {
        if (err.message.includes('API key')) {
          errorMessage = 'Google Maps API key is missing or invalid. Please check your .env file.';
        } else if (err.message.includes('Loading the Google Maps JavaScript API')) {
          errorMessage = 'Failed to load Google Maps API. Please check if Places API is enabled in Google Cloud Console.';
        } else if (err.message.includes('ApiTargetBlockedMapError')) {
          errorMessage = 'API key is restricted. Please check domain restrictions in Google Cloud Console.';
        } else {
          errorMessage = `Google Maps error: ${err.message}`;
        }
      }
      
      setError(errorMessage);
    }
  };

  const handleAddLocation = async () => {
    if (!selectedPlace || !user) return;

    setIsLoading(true);
    setError('');

    try {
      const newLocation = {
        name: selectedPlace.name || '',
        address: selectedPlace.formatted_address || '',
        placeId: selectedPlace.place_id || '',
        coordinates: {
          lat: selectedPlace.geometry?.location?.lat() || 0,
          lng: selectedPlace.geometry?.location?.lng() || 0,
        },
        businessInfo: {
          phone: selectedPlace.formatted_phone_number || '',
          website: selectedPlace.website || '',
          rating: selectedPlace.rating || 0,
          businessType: selectedPlace.types?.filter((type: string) => 
            ['restaurant', 'bar', 'meal_takeaway', 'food', 'night_club'].includes(type)
          ) || [],
        },
        addedBy: user.uid,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'locations'), newLocation);
      
      // Reset form
      setSelectedPlace(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      
      onLocationAdded();
    } catch (err) {
      console.error('Error adding location:', err);
      setError('Error adding location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      await deleteDoc(doc(db, 'locations', locationId));
      onLocationAdded(); // Refresh the list
    } catch (err) {
      console.error('Error deleting location:', err);
      setError('Error deleting location. Please try again.');
    }
  };

  const getBusinessTypeChips = (types?: string[]) => {
    if (!types) return null;
    
    const relevantTypes = types.filter(type => 
      ['restaurant', 'bar', 'meal_takeaway', 'food', 'night_club'].includes(type)
    );
    
    return relevantTypes.map(type => (
      <Chip 
        key={type} 
        label={type.replace('_', ' ')} 
        size="small" 
        sx={{ mr: 0.5, mb: 0.5 }}
        color="primary"
      />
    ));
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      disableRestoreFocus
      keepMounted={false}
    >
      <DialogTitle>Manage Locations</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add New Location
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Search for restaurants and bars
            </Typography>
            <TextField
              inputRef={inputRef}
              type="text"
              placeholder="Type restaurant or bar name..."
              fullWidth
              variant="outlined"
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '16px',
                },
              }}
            />
          </Box>
          
          {selectedPlace && (
            <Box sx={{ p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1, mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {selectedPlace.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <LocationIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                {selectedPlace.formatted_address}
              </Typography>
              {selectedPlace.rating && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Rating: {selectedPlace.rating} ⭐
                </Typography>
              )}
              {selectedPlace.types && (
                <Box sx={{ mb: 1 }}>
                  {getBusinessTypeChips(selectedPlace.types)}
                </Box>
              )}
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={() => { void handleAddLocation(); }}
            disabled={!selectedPlace || isLoading}
            sx={{ mb: 3 }}
          >
            {isLoading ? 'Adding...' : 'Add Location'}
          </Button>
        </Box>

        <Typography variant="h6" gutterBottom>
          Current Locations ({locations.length})
        </Typography>
        
        <List>
          {locations.map((location) => (
            <ListItem 
              key={location.id} 
              divider
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                paddingRight: 6 // Make room for the delete button
              }}
            >
              <ListItemText
                primary={location.name}
                secondary={
                  <React.Fragment>
                    {location.address && (
                      <Typography variant="body2" color="text.secondary" component="div" sx={{ display: 'block' }}>
                        <LocationIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                        {location.address}
                      </Typography>
                    )}
                    {location.businessInfo?.rating && (
                      <Typography variant="body2" color="text.secondary" component="div" sx={{ display: 'block' }}>
                        Rating: {location.businessInfo.rating} ⭐
                      </Typography>
                    )}
                    {location.businessInfo?.businessType && (
                      <Box sx={{ mt: 0.5 }}>
                        {getBusinessTypeChips(location.businessInfo.businessType)}
                      </Box>
                    )}
                  </React.Fragment>
                }
                slotProps={{
                  secondary: { component: 'div' }
                }}
              />
              <IconButton
                edge="end"
                onClick={() => { void handleDeleteLocation(location.id); }}
                color="error"
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              >
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>

        {locations.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No locations added yet. Search above to add your first location.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit" variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  );
};
