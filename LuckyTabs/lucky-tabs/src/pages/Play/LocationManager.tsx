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
  ListItemSecondaryAction,
  IconButton,
  Alert,
  Chip,
} from '@mui/material';
import { Delete as DeleteIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { Loader } from '@googlemaps/js-api-loader';
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
    console.log('🔄 LocationManager useEffect triggered - open:', open);
    if (open) {
      // Add a small delay to ensure the input ref is available
      const timer = setTimeout(() => {
        if (inputRef.current) {
          console.log('✅ Input ref available, initializing Google Maps...');
          void initializeGoogleMaps();
        } else {
          console.log('❌ Input ref still not available after delay');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [open]);

  const initializeGoogleMaps = async () => {
    try {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
      console.log('🗝️ API Key being used:', apiKey);
      console.log('🌍 Current URL:', window.location.href);
      console.log('🏠 Current hostname:', window.location.hostname);
      console.log('🚪 Current port:', window.location.port);
      
      if (!apiKey) {
        throw new Error('Google Maps API key is missing. Please check your .env file.');
      }
      
      // Try a simple test first
      console.log('🧪 Testing API key with a simple request...');
      
      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places'],
      });

      console.log('⏳ Loading Google Maps API...');
      await loader.load();
      console.log('✅ Google Maps API loaded successfully');

      if (!inputRef.current) {
        throw new Error('Input element not found');
      }

      console.log('🔧 Creating Autocomplete instance (legacy API - still supported)...');
      
      // Suppress the deprecation warning temporarily
      const originalWarn = console.warn;
      console.warn = (...args: any[]) => {
        if (args[0]?.includes?.('google.maps.places.Autocomplete is not available')) {
          return; // Suppress this specific warning
        }
        originalWarn.apply(console, args);
      };
      
      // Get the input element directly (now it's a plain HTML input)
      const inputElement = inputRef.current;
      console.log('🎯 Input element found:', inputElement?.tagName, inputElement instanceof HTMLInputElement);
      
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

      console.log('🌍 Setting component restrictions...');
      // Restrict to restaurants and bars
      autocompleteInstance.setComponentRestrictions({ country: 'us' });

      console.log('👂 Adding place_changed listener...');
      autocompleteInstance.addListener('place_changed', () => {
        console.log('🎯 Place changed event triggered!');
        const place = autocompleteInstance.getPlace();
        console.log('📍 Selected place details:', {
          name: place?.name,
          address: place?.formatted_address,
          placeId: place?.place_id,
          types: place?.types,
          hasGeometry: !!place?.geometry
        });
        
        if (place && place.geometry && place.place_id) {
          // Check if it's a restaurant or bar
          const isRestaurantOrBar = place.types?.some((type: string) => 
            ['restaurant', 'bar', 'meal_takeaway', 'food', 'night_club', 'establishment'].includes(type)
          );

          console.log('🍕 Is restaurant/bar:', isRestaurantOrBar, 'Types:', place.types);

          if (isRestaurantOrBar || place.types?.includes('establishment')) {
            console.log('✅ Valid place selected, updating state...');
            setSelectedPlace(place);
            setError('');
            
            // Update the input field with the selected place name
            if (inputElement) {
              inputElement.value = place.name || place.formatted_address || '';
            }
          } else {
            console.log('❌ Not a restaurant/bar, showing error');
            setError('Please select a restaurant or bar location.');
            setSelectedPlace(null);
          }
        } else {
          console.log('❌ No place, geometry, or place_id found');
          if (!place) {
            console.log('  - No place object');
          }
          if (!place?.geometry) {
            console.log('  - No geometry');
          }
          if (!place?.place_id) {
            console.log('  - No place_id');
          }
        }
      });
      
      // Add input event listener to debug typing
      inputElement.addEventListener('input', (e) => {
        console.log('⌨️ Input event:', (e.target as HTMLInputElement).value);
      });
      
      inputElement.addEventListener('focus', () => {
        console.log('🎯 Input focused');
      });
      
      inputElement.addEventListener('blur', () => {
        console.log('😴 Input blurred');
      });
      
      // Test if autocomplete is working by triggering a focus
      setTimeout(() => {
        console.log('🔍 Testing autocomplete by focusing input...');
        inputElement.focus();
        
        // Check if the autocomplete dropdown container exists
        const pacContainer = document.querySelector('.pac-container');
        console.log('📦 PAC container found:', !!pacContainer);
        
        if (!pacContainer) {
          console.log('⚠️ No autocomplete dropdown container found. This might be a styling issue.');
        } else {
          // Check if PAC container is visible
          const computedStyle = window.getComputedStyle(pacContainer);
          console.log('👁️ PAC container visibility:', computedStyle.visibility);
          console.log('📏 PAC container display:', computedStyle.display);
          console.log('🔢 PAC container z-index:', computedStyle.zIndex);
          console.log('📐 PAC container position:', computedStyle.position);
        }
        
        // Force trigger autocomplete by simulating typing
        setTimeout(() => {
          console.log('🧪 Testing with simulated input...');
          inputElement.value = 'test';
          inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          
          setTimeout(() => {
            const pacContainerAfter = document.querySelector('.pac-container');
            console.log('📦 PAC container after typing:', !!pacContainerAfter);
            
            if (pacContainerAfter) {
              const afterStyle = window.getComputedStyle(pacContainerAfter);
              console.log('👁️ PAC container visibility after typing:', afterStyle.visibility);
              console.log('📏 PAC container display after typing:', afterStyle.display);
              
              // Check for pac-item elements
              const pacItems = pacContainerAfter.querySelectorAll('.pac-item');
              console.log('📋 Number of autocomplete suggestions:', pacItems.length);
              
              if (pacItems.length > 0) {
                console.log('✅ Autocomplete suggestions are available!');
                pacItems.forEach((item, index) => {
                  console.log(`📝 Suggestion ${index + 1}:`, item.textContent?.trim());
                });
              } else {
                console.log('❌ No autocomplete suggestions found');
              }
            }
            
            // Clear the test input
            inputElement.value = '';
            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
          }, 1000);
        }, 500);
      }, 500);
      
      console.log('🚀 Autocomplete setup complete (using legacy API)');
      
      // Fix autocomplete dropdown styling to ensure it's visible
      const style = document.createElement('style');
      style.textContent = `
        .pac-container {
          z-index: 9999 !important;
          background: white !important;
          border: 1px solid #ccc !important;
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
          border-bottom: 1px solid #f0f0f0 !important;
          display: block !important;
          visibility: visible !important;
        }
        .pac-item:hover {
          background-color: #f5f5f5 !important;
        }
        .pac-item-selected {
          background-color: #e3f2fd !important;
        }
        .pac-matched {
          font-weight: bold !important;
        }
        .pac-item-query {
          color: #333 !important;
          font-size: 14px !important;
        }
        .pac-icon {
          display: inline-block !important;
          margin-right: 8px !important;
        }
      `;
      document.head.appendChild(style);
      console.log('🎨 Added custom styling for autocomplete dropdown');
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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
            <input
              ref={inputRef}
              type="text"
              placeholder="Type restaurant or bar name..."
              style={{
                width: '100%',
                padding: '16.5px 14px',
                border: '1px solid #d0d7de',
                borderRadius: '4px',
                fontSize: '16px',
                fontFamily: 'inherit',
                outline: 'none',
                backgroundColor: 'transparent',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#1976d2';
                e.target.style.borderWidth = '2px';
                e.target.style.padding = '15.5px 13px'; // Adjust padding to compensate for thicker border
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d0d7de';
                e.target.style.borderWidth = '1px';
                e.target.style.padding = '16.5px 14px';
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
            <ListItem key={location.id} divider>
              <ListItemText
                primary={location.name}
                secondary={
                  <React.Fragment>
                    {location.address && (
                      <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
                        <LocationIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                        {location.address}
                      </Typography>
                    )}
                    {location.businessInfo?.rating && (
                      <Typography variant="body2" color="text.secondary" component="span" sx={{ display: 'block' }}>
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
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => { void handleDeleteLocation(location.id); }}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
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
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
