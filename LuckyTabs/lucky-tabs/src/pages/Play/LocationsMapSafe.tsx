/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { Loader } from '@googlemaps/js-api-loader';

interface Location {
  id: string;
  name: string;
  address?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface LocationsMapProps {
  locations: Location[];
  selectedLocationId?: string;
  onLocationSelect?: (locationId: string) => void;
  height?: number;
}

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export const LocationsMapSafe: React.FC<LocationsMapProps> = ({
  locations,
  selectedLocationId,
  onLocationSelect,
  height = 400,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const isUnmountedRef = useRef(false);
  const initializingRef = useRef(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Clean up all markers
  const cleanupMarkers = () => {
    markersRef.current.forEach((marker) => {
      try {
        if (marker.infoWindow) {
          marker.infoWindow.close();
        }
        marker.map = null;
      } catch (error) {
        // Ignore cleanup errors
      }
    });
    markersRef.current = [];
  };

  // Initialize Google Maps once
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key is not configured');
      setIsLoading(false);
      return;
    }

    // Prevent multiple initializations and handle React Strict Mode
    if (initializingRef.current || mapInstanceRef.current) {
      if (mapInstanceRef.current) {
        setIsLoading(false);
      }
      return;
    }

    initializingRef.current = true;
    isUnmountedRef.current = false;

    // Calculate map center based on locations
    const locationsWithCoords = locations.filter(loc => loc.coordinates);
    let center = { lat: 46.7296, lng: -94.6859 }; // Minnesota center as default
    
    if (locationsWithCoords.length > 0) {
      // Calculate the center of all locations
      const avgLat = locationsWithCoords.reduce((sum, loc) => sum + (loc.coordinates?.lat || 0), 0) / locationsWithCoords.length;
      const avgLng = locationsWithCoords.reduce((sum, loc) => sum + (loc.coordinates?.lng || 0), 0) / locationsWithCoords.length;
      center = { lat: avgLat, lng: avgLng };
    }

    const initializeMap = async () => {
      try {
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['marker'],
        });

        await loader.load();
        
        if (isUnmountedRef.current) {
          initializingRef.current = false;
          return;
        }
        
        if (!mapContainerRef.current) {
          setTimeout(() => {
            if (!isUnmountedRef.current && mapContainerRef.current) {
              void createMapInstance();
            } else {
              initializingRef.current = false;
              if (!isUnmountedRef.current) {
                setError('Map container not available');
                setIsLoading(false);
              }
            }
          }, 100);
          return;
        }

        createMapInstance();
      } catch (err) {
        initializingRef.current = false;
        if (!isUnmountedRef.current) {
          setError('Failed to load Google Maps');
          setIsLoading(false);
        }
      }
    };

    const createMapInstance = () => {
      try {
        if (isUnmountedRef.current || !mapContainerRef.current) {
          initializingRef.current = false;
          return;
        }

        const map = new (window as any).google.maps.Map(mapContainerRef.current, {
          zoom: 10,
          center: center,
          mapId: 'DEMO_MAP_ID',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        if (isUnmountedRef.current) {
          initializingRef.current = false;
          return;
        }

        setMapReady(true);
        mapInstanceRef.current = map;
        initializingRef.current = false;
        setIsLoading(false);
        
      } catch (err) {
        console.error('LocationsMapSafe: Error creating map instance:', err);
        initializingRef.current = false;
        if (!isUnmountedRef.current) {
          setError('Failed to create map');
          setIsLoading(false);
        }
      }
    };

    void initializeMap();
  }, [locations]); // Include locations to re-center when they change

  // Update markers when locations or selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || initializingRef.current || !mapReady) {
      return;
    }

    // Clean up existing markers
    cleanupMarkers();

    if (locations.length === 0) {
      return;
    }

    const map = mapInstanceRef.current;
    const bounds = new (window as any).google.maps.LatLngBounds();
    const newMarkers: any[] = [];

    locations.forEach((location) => {
      if (!location.coordinates) {
        return;
      }

      try {
        // Create custom marker element
        const markerElement = document.createElement('div');
        markerElement.style.cssText = `
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: ${selectedLocationId === location.id ? '#dc2626' : '#2563eb'};
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 10px;
          font-weight: bold;
        `;
        markerElement.textContent = location.name.charAt(0).toUpperCase();

        // Create advanced marker
        const marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
          position: {
            lat: location.coordinates.lat,
            lng: location.coordinates.lng,
          },
          map: map,
          title: location.name,
          content: markerElement,
        });

        // Create info window
        const infoWindow = new (window as any).google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${location.name}</h3>
              ${location.address ? `<p style="margin: 0; color: #666; font-size: 12px;">${location.address}</p>` : ''}
            </div>
          `,
        });

        // Add click listener
        marker.addListener('click', () => {
          // Close all other info windows
          markersRef.current.forEach((m) => {
            if (m.infoWindow) {
              m.infoWindow.close();
            }
          });

          // Open this info window
          infoWindow.open(map, marker);
          
          // Notify parent of selection
          if (onLocationSelect) {
            onLocationSelect(location.id);
          }
        });

        // Store references
        marker.infoWindow = infoWindow;
        marker.locationId = location.id;
        newMarkers.push(marker);

        // Add to bounds
        bounds.extend(marker.position);
      } catch (error) {
        console.error('Error creating marker for location:', location.name, error);
      }
    });

    markersRef.current = newMarkers;

    // Fit map to show all markers
    try {
      if (newMarkers.length > 1) {
        map.fitBounds(bounds);
        // Add padding to prevent markers from being on the edge
        const listener = map.addListener('bounds_changed', () => {
          if (map.getZoom() > 15) {
            map.setZoom(15);
          }
          (window as any).google.maps.event.removeListener(listener);
        });
      } else if (newMarkers.length === 1) {
        map.setCenter(newMarkers[0].position);
        map.setZoom(15);
      }
    } catch (error) {
      console.warn('Error fitting map bounds:', error);
    }
  }, [locations, selectedLocationId, onLocationSelect, mapReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      initializingRef.current = false;
      
      // Clean up markers
      if (markersRef.current) {
        markersRef.current.forEach((marker) => {
          try {
            if (marker.infoWindow) {
              marker.infoWindow.close();
            }
            if (marker.map) {
              marker.map = null;
            }
          } catch (error) {
            // Ignore cleanup errors
          }
        });
        markersRef.current = [];
      }

      // Clean up map instance
      if (mapInstanceRef.current) {
        try {
          // Don't try to destroy the map - just clear references
          mapInstanceRef.current = null;
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (locations.length === 0) {
    return (
      <Box 
        sx={{ 
          height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'grey.100',
          borderRadius: 1,
          mb: 2,
          border: '1px solid #e0e0e0',
        }}
      >
        <Typography color="text.secondary">
          No locations to display on map
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Locations Map
      </Typography>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height,
          borderRadius: 1,
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
        }}
      >
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              zIndex: 1,
            }}
          >
            <Typography>Loading map...</Typography>
          </Box>
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Click on a marker to select a location
      </Typography>
    </Box>
  );
};

export default LocationsMapSafe;
