/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Alert } from '@mui/material';
import { getGoogleMapsLoader } from '../../utils/googleMapsLoader';

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

const MILES_TO_METERS = 1609.34;

export const LocationsMapSafe: React.FC<LocationsMapProps> = ({
  locations,
  selectedLocationId,
  onLocationSelect,
  height = 250,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const isUnmountedRef = useRef(false);
  const initializingRef = useRef(false);

  // track if we already centered based on user location (so we don't auto-fit to markers after)
  const centeredByUserRef = useRef(false);

  const userMarkerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Clean up all markers
  const cleanupMarkers = () => {
    markersRef.current.forEach((marker) => {
      try {
        if (marker.infoWindow) marker.infoWindow.close();
        marker.map = null;
      } catch {
        /* ignore */
      }
    });
    markersRef.current = [];
  };

  // Initialize Google Maps once
  useEffect(() => {
    if (initializingRef.current || mapInstanceRef.current) {
      if (mapInstanceRef.current) setIsLoading(false);
      return;
    }

    initializingRef.current = true;
    isUnmountedRef.current = false;

    // Fallback center: Minnesota
    const locationsWithCoords = locations.filter((loc) => loc.coordinates);
    let center = { lat: 46.7296, lng: -94.6859 };

    if (locationsWithCoords.length > 0) {
      const avgLat =
        locationsWithCoords.reduce((s, loc) => s + (loc.coordinates?.lat || 0), 0) /
        locationsWithCoords.length;
      const avgLng =
        locationsWithCoords.reduce((s, loc) => s + (loc.coordinates?.lng || 0), 0) /
        locationsWithCoords.length;
      center = { lat: avgLat, lng: avgLng };
    }

    const initializeMap = async () => {
      try {
        await getGoogleMapsLoader();

        if (isUnmountedRef.current) {
          initializingRef.current = false;
          return;
        }

        if (!mapContainerRef.current) {
          setTimeout(() => {
            if (!isUnmountedRef.current && mapContainerRef.current) {
              createMapInstance();
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
          zoom: 6,
          center,
          mapId: 'DEMO_MAP_ID',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,        // ← disables default POI popups
          gestureHandling: 'greedy',
        });

        if (isUnmountedRef.current) {
          initializingRef.current = false;
          return;
        }

        mapInstanceRef.current = map;
        setMapReady(true);
        initializingRef.current = false;
        setIsLoading(false);

        // Try to center on the user's current location (5 mile radius)
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (!mapInstanceRef.current) return;
              const userLatLng = new (window as any).google.maps.LatLng(
                pos.coords.latitude,
                pos.coords.longitude
              );

              // Add/replace a subtle “you are here” marker (Advanced or default marker)
              try {
                const dot = document.createElement('div');
                dot.style.cssText = `
                  width: 14px; height: 14px; border-radius: 50%;
                  background: #0ea5e9; border: 2px solid white;
                  box-shadow: 0 0 6px rgba(0,0,0,0.35);
                `;
                const am = new (window as any).google.maps.marker.AdvancedMarkerElement({
                  position: userLatLng,
                  map: mapInstanceRef.current,
                  title: 'Your location',
                  content: dot,
                });
                userMarkerRef.current = am;
              } catch {
                // Fallback to default marker if AdvancedMarker isn't available
                userMarkerRef.current = new (window as any).google.maps.Marker({
                  position: userLatLng,
                  map: mapInstanceRef.current,
                  title: 'Your location',
                });
              }

              // Fit to ~5 mile radius around user
              const circle = new (window as any).google.maps.Circle({
                center: userLatLng,
                radius: 1 * MILES_TO_METERS, // ~8047 meters
              });
              // fitBounds on the circle's bounds for a nice radius view
              const b = circle.getBounds?.();
              if (b) {
                mapInstanceRef.current.fitBounds(b);
              } else {
                mapInstanceRef.current.setCenter(userLatLng);
                mapInstanceRef.current.setZoom(6); // fallback zoom ~ city scale
              }

              centeredByUserRef.current = true;
            },
            () => {
              // user denied or failed—keep default center
            },
            { enableHighAccuracy: false, maximumAge: 60000, timeout: 8000 }
          );
        }
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
  }, [locations]);

  // Update markers when locations or selection changes
  useEffect(() => {
    if (!mapInstanceRef.current || initializingRef.current || !mapReady) return;

    // Clean up existing markers
    cleanupMarkers();

    if (locations.length === 0) return;

    const map = mapInstanceRef.current;
    const bounds = new (window as any).google.maps.LatLngBounds();
    const newMarkers: any[] = [];

    locations.forEach((location) => {
      if (!location.coordinates) return;

      try {
        const markerElement = document.createElement('div');
        markerElement.style.cssText = `
          width: 24px; height: 24px; border-radius: 50%;
          background-color: ${selectedLocationId === location.id ? '#dc2626' : '#2563eb'};
          border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: white; font-size: 10px; font-weight: bold;
        `;
        markerElement.textContent = location.name.charAt(0).toUpperCase();

        const marker = new (window as any).google.maps.marker.AdvancedMarkerElement({
          position: { lat: location.coordinates.lat, lng: location.coordinates.lng },
          map,
          title: location.name,
          content: markerElement,
        });

        const infoWindow = new (window as any).google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">${location.name}</h3>
              ${location.address ? `<p style="margin: 0; color: #666; font-size: 12px;">${location.address}</p>` : ''}
            </div>
          `,
        });

        marker.addListener('click', () => {
          markersRef.current.forEach((m) => {
            if (m.infoWindow) m.infoWindow.close();
          });
          infoWindow.open(map, marker);
          onLocationSelect?.(location.id);
        });

        marker.infoWindow = infoWindow;
        marker.locationId = location.id;
        newMarkers.push(marker);

        bounds.extend(marker.position);
      } catch (error) {
        console.error('Error creating marker for location:', location.name, error);
      }
    });

    markersRef.current = newMarkers;

    // If we already centered using the user's location, don't auto-fit to markers again.
    try {
      if (!centeredByUserRef.current) {
        if (newMarkers.length > 1) {
          map.fitBounds(bounds);
          const listener = map.addListener('bounds_changed', () => {
            if (map.getZoom() > 6) map.setZoom(6);
            (window as any).google.maps.event.removeListener(listener);
          });
        } else if (newMarkers.length === 1) {
          map.setCenter(newMarkers[0].position);
          map.setZoom(8);
        }
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

      if (markersRef.current) {
        markersRef.current.forEach((marker) => {
          try {
            if (marker.infoWindow) marker.infoWindow.close();
            if (marker.map) marker.map = null;
          } catch {
            /* ignore */
          }
        });
        markersRef.current = [];
      }

      if (userMarkerRef.current) {
        try {
          userMarkerRef.current.map = null;
        } catch {
          /* ignore */
        }
        userMarkerRef.current = null;
      }

      mapInstanceRef.current = null;
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
        <Typography color="text.secondary">No locations to display on map</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Locations
      </Typography>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: {
            xs: Math.min(height, 200),
            sm: Math.min(height, 250),
            md: height,
          },
          borderRadius: 1,
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
        }}
      >
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
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
