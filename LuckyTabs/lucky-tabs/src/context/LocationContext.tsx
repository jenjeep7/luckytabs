import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  type?: string;
  createdAt?: Date | { toDate?: () => Date };
  updatedAt?: Date | { toDate?: () => Date };
}

export interface LocationContextType {
  selectedLocation: string;
  setSelectedLocation: (locationId: string) => void;
  selectedLocationObj: Location | null;
  setSelectedLocationObj: (location: Location | null) => void;
  clearSelectedLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [selectedLocation, setSelectedLocationState] = useState<string>('');
  const [selectedLocationObj, setSelectedLocationObj] = useState<Location | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedLocationId = localStorage.getItem('selectedLocationId');
    const savedLocationObj = localStorage.getItem('selectedLocationObj');
    
    if (savedLocationId) {
      setSelectedLocationState(savedLocationId);
    }
    
    if (savedLocationObj) {
      try {
        const parsedLocation = JSON.parse(savedLocationObj) as Location;
        // Validate that the parsed object has required properties
        if (parsedLocation && typeof parsedLocation === 'object' && parsedLocation.id && parsedLocation.name) {
          setSelectedLocationObj(parsedLocation);
        } else {
          localStorage.removeItem('selectedLocationObj');
        }
      } catch (error) {
        console.error('Error parsing saved location:', error);
        localStorage.removeItem('selectedLocationObj');
      }
    }
  }, []);

  // Save to localStorage when location changes
  const setSelectedLocation = (locationId: string) => {
    setSelectedLocationState(locationId);
    if (locationId) {
      localStorage.setItem('selectedLocationId', locationId);
    } else {
      localStorage.removeItem('selectedLocationId');
    }
  };

  // Save location object to localStorage when it changes
  useEffect(() => {
    if (selectedLocationObj) {
      localStorage.setItem('selectedLocationObj', JSON.stringify(selectedLocationObj));
    } else {
      localStorage.removeItem('selectedLocationObj');
    }
  }, [selectedLocationObj]);

  const clearSelectedLocation = () => {
    setSelectedLocationState('');
    setSelectedLocationObj(null);
    localStorage.removeItem('selectedLocationId');
    localStorage.removeItem('selectedLocationObj');
  };

  const value: LocationContextType = {
    selectedLocation,
    setSelectedLocation,
    selectedLocationObj,
    setSelectedLocationObj,
    clearSelectedLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
