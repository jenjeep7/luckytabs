// App version management
export const APP_VERSION = '1.2.2'; // Update this with each significant deploy

// Check if user has the latest version
export const checkVersion = () => {
  const storedVersion = localStorage.getItem('app_version');
  const isNewVersion = storedVersion !== APP_VERSION;  
  return {
    isNewVersion,
    currentVersion: APP_VERSION,
    storedVersion
  };
};

// Force app refresh
export const forceRefresh = () => {
  // Update version in localStorage BEFORE clearing caches
  localStorage.setItem('app_version', APP_VERSION);
  
  // Clear all caches
  if ('caches' in window) {
    void caches.keys().then(names => {
      void Promise.all(names.map(name => caches.delete(name)));
    }).catch(console.error);
  }
  
  // Force reload
  window.location.reload();
};

// Get version info for display
export const getVersionInfo = () => {
  const buildDate = process.env.REACT_APP_BUILD_DATE || new Date().toISOString();
  return {
    version: APP_VERSION,
    buildDate: new Date(buildDate).toLocaleDateString()
  };
};
