// App version management
export const APP_VERSION = '1.2.2'; // Last updated: 2025-09-30T12:08:18.261Z // Last updated: 2025-09-30T12:08:18.161Z // Last updated: 2025-09-30T11:25:48.181Z // Last updated: 2025-09-30T11:25:48.075Z // Last updated: 2025-09-30T11:23:34.054Z // Last updated: 2025-09-30T11:23:33.948Z // Last updated: 2025-09-29T10:34:18.195Z // Last updated: 2025-09-29T10:34:18.115Z // Last updated: 2025-09-29T10:14:59.201Z // Last updated: 2025-09-29T10:14:59.120Z // Last updated: 2025-09-29T10:02:58.347Z // Last updated: 2025-09-29T10:02:58.267Z // Last updated: 2025-09-29T10:02:50.687Z // Last updated: 2025-09-29T09:55:48.641Z // Update this with each significant deploy

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
