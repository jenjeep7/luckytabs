import React, { useEffect } from 'react';
import { checkVersion, forceRefresh } from '../utils/version';

export const VersionChecker: React.FC = () => {
  useEffect(() => {
    // Add a flag to prevent infinite refresh loops during development
    const isRefreshing = sessionStorage.getItem('isRefreshing');
    
    if (isRefreshing) {
      // Clear the flag and don't refresh again
      sessionStorage.removeItem('isRefreshing');
      return;
    }
    
    const { isNewVersion } = checkVersion();
    if (isNewVersion) {
      // Set flag to prevent infinite loops
      sessionStorage.setItem('isRefreshing', 'true');
      
      // Automatically refresh when new version is detected
      // Small delay to ensure the app has loaded
      setTimeout(() => {
        forceRefresh();
      }, 1000);
    }
  }, []);

  // No UI needed - just automatic refresh
  return null;
};
