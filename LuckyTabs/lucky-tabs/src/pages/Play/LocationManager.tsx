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
  Alert,
  Chip,
  TextField,
  Paper,
  MenuItem,
  MenuList,
  ClickAwayListener,
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { getGoogleMapsLoader } from '../../utils/googleMapsLoader';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuthStateCompat } from '../../services/useAuthStateCompat';

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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [predictions, setPredictions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [user] = useAuthStateCompat();

  // Helper function to check if a place is already in the locations list
  const isDuplicateLocation = (place: any): boolean => {
    if (!place || !place.place_id) return false;
    
    return locations.some(location => 
      location.placeId === place.place_id ||
      (location.name.toLowerCase() === place.name?.toLowerCase() && 
       location.address === place.formatted_address)
    );
  };

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
      // Clean up when dialog closes
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      
      // Reset states
      setSelectedPlace(null);
      setSearchQuery('');
      setPredictions([]);
      setShowDropdown(false);
      setError('');
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, locations]); // Added locations dependency so duplicate check updates when locations change

  const initializeGoogleMaps = async () => {
    try {
      await getGoogleMapsLoader();

      // Note: AutocompleteService is deprecated, we'll use the new AutocompleteSuggestion API instead
      // No need to initialize AutocompleteService anymore
      
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

  // Handle search input changes
  const handleSearchInputChange = async (value: string) => {
    setSearchQuery(value);
    
    if (!value.trim()) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    try {
      // Use the new AutocompleteSuggestion API instead of deprecated AutocompleteService
      const { AutocompleteSuggestion } = await (window as any).google.maps.importLibrary("places") as google.maps.PlacesLibrary;
      
      const request = {
        input: value,
        includedPrimaryTypes: ['restaurant', 'bar', 'meal_takeaway', 'food', 'night_club'],
        language: 'en',
        region: 'us'
      };

      const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
      
      if (suggestions && suggestions.length > 0) {
        // Convert suggestions to match our existing prediction structure
        const convertedPredictions = suggestions
          .filter((suggestion: any) => suggestion.placePrediction) // Only place predictions
          .map((suggestion: any) => ({
            place_id: suggestion.placePrediction.placeId,
            description: suggestion.placePrediction.text?.text || '',
            structured_formatting: {
              main_text: suggestion.placePrediction.structuredFormat?.mainText?.text || '',
              secondary_text: suggestion.placePrediction.structuredFormat?.secondaryText?.text || ''
            },
            types: suggestion.placePrediction.types || []
          }));
          
        setPredictions(convertedPredictions);
        setShowDropdown(convertedPredictions.length > 0);
      } else {
        setPredictions([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Error fetching autocomplete suggestions:', error);
      setPredictions([]);
      setShowDropdown(false);
    }
  };

  // Handle place selection from custom dropdown
  const handlePlaceSelect = async (placeId: string) => {
    try {
      // Use the new Place API instead of deprecated PlacesService
      const { Place } = await (window as any).google.maps.importLibrary("places") as google.maps.PlacesLibrary;
      
      const place = new Place({
        id: placeId,
        requestedLanguage: 'en',
      });

      // Fetch place details using the new API
      await place.fetchFields({
        fields: [
          'id',
          'displayName',
          'formattedAddress',
          'addressComponents',
          'location',
          'types',
          'rating',
          'internationalPhoneNumber',
          'websiteURI',
          'businessStatus'
        ]
      });

      if (place.displayName && place.location) {
        // Extract coordinates safely by calling the methods
        const latValue = place.location.lat?.() ?? 0;
        const lngValue = place.location.lng?.() ?? 0;
        
        // Convert the new Place object to match our existing structure
        const placeData = {
          place_id: place.id,
          name: place.displayName,
          formatted_address: place.formattedAddress,
          address_components: place.addressComponents,
          geometry: {
            location: {
              lat: () => latValue,
              lng: () => lngValue
            }
          },
          // Store actual coordinate values for Firebase
          coordinates: {
            lat: latValue,
            lng: lngValue
          },
          types: place.types,
          rating: place.rating,
          formatted_phone_number: place.internationalPhoneNumber,
          website: place.websiteURI,
          business_status: place.businessStatus
        };

        // Check if this location already exists
        const isDuplicate = isDuplicateLocation(placeData);

        setSelectedPlace(placeData);
        
        if (isDuplicate) {
          setError('This location has already been added to the system.');
        } else {
          setError('');
        }

        // Extract city from address components for better display
        let cityName = '';
        if (place.addressComponents && Array.isArray(place.addressComponents)) {
          for (const component of place.addressComponents) {
            if (component.types && Array.isArray(component.types)) {
              if (component.types.includes('locality') || component.types.includes('administrative_area_level_3')) {
                cityName = component.longText ? String(component.longText) : '';
                break;
              }
            }
          }
        }

        // Update the input field with the selected place name and city
        const placeName = place.displayName ? String(place.displayName) : (place.formattedAddress ? String(place.formattedAddress) : '');
        const displayName = cityName 
          ? `${placeName} (${cityName})`
          : placeName;
        setSearchQuery(displayName);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      setError('Error loading place details. Please try again.');
    }
  };

  const handleAddLocation = async () => {
    if (!selectedPlace || !user) return;

    // Check for duplicates before adding
    if (isDuplicateLocation(selectedPlace)) {
      setError('This location has already been added.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const newLocation = {
        name: selectedPlace.name || '',
        address: selectedPlace.formatted_address || '',
        placeId: selectedPlace.place_id || '',
        coordinates: selectedPlace.coordinates || {
          lat: 0,
          lng: 0
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
      
      // Reset form and clear autocomplete
      setSelectedPlace(null);
      setSearchQuery('');
      setPredictions([]);
      setShowDropdown(false);
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
          <Box sx={{ mb: 2, position: 'relative' }}>
            <TextField
              inputRef={inputRef}
              type="text"
              placeholder="Type restaurant or bar name..."
              fullWidth
              variant="outlined"
              size="medium"
              value={searchQuery}
              onChange={(e) => {
                void handleSearchInputChange(e.target.value);
              }}
              onFocus={() => {
                if (predictions.length > 0) {
                  setShowDropdown(true);
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  fontSize: '16px',
                },
              }}
            />
            
            {/* Custom dropdown */}
            {showDropdown && predictions.length > 0 && (
              <ClickAwayListener onClickAway={() => setShowDropdown(false)}>
                <Paper
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 1300,
                    maxHeight: '300px',
                    overflow: 'auto',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    boxShadow: 3,
                  }}
                >
                  <MenuList dense>
                    {predictions.map((prediction) => (
                      <MenuItem
                        key={prediction.place_id}
                        onClick={() => {
                          void handlePlaceSelect(prediction.place_id);
                        }}
                        sx={{
                          py: 1.5,
                          px: 2,
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': {
                            borderBottom: 'none',
                          },
                          '&:hover': {
                            backgroundColor: 'action.hover',
                          },
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {prediction.structured_formatting?.main_text || prediction.description}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ fontSize: '0.875rem', mt: 0.25 }}
                        >
                          <LocationIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                          {prediction.structured_formatting?.secondary_text || prediction.description}
                        </Typography>
                      </MenuItem>
                    ))}
                  </MenuList>
                </Paper>
              </ClickAwayListener>
            )}
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
            disabled={!selectedPlace || isLoading || isDuplicateLocation(selectedPlace)}
            sx={{ mb: 3 }}
          >
            {isLoading ? 'Adding...' : 
             isDuplicateLocation(selectedPlace) ? 'Already Added' : 'Add Location'}
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
