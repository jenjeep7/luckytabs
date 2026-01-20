// App version management
export const APP_VERSION = '1.2.7'; // Last updated: 2025-11-25T19:51:01.515Z // Last updated: 2025-11-25T19:51:01.417Z // Last updated: 2025-11-25T12:16:02.190Z // Last updated: 2025-11-25T12:16:02.094Z // Last updated: 2025-11-25T12:13:40.685Z // Last updated: 2025-11-25T12:13:40.592Z // Last updated: 2025-11-25T12:13:31.611Z // Last updated: 2025-11-25T12:13:31.524Z // Last updated: 2025-11-23T22:04:29.186Z // Last updated: 2025-11-23T22:04:29.098Z // Last updated: 2025-11-14T14:53:50.566Z // Last updated: 2025-11-14T14:53:50.488Z // Last updated: 2025-11-14T14:52:39.563Z // Last updated: 2025-11-14T14:52:39.485Z // Last updated: 2025-10-14T20:47:46.398Z // Last updated: 2025-10-14T20:47:46.317Z // Last updated: 2025-10-14T13:11:47.201Z // Last updated: 2025-10-14T13:11:47.118Z // Last updated: 2025-10-14T12:48:49.927Z // Last updated: 2025-10-14T12:48:49.848Z // Last updated: 2025-10-02T15:29:21.728Z // Last updated: 2025-10-02T15:29:21.651Z // Last updated: 2025-10-02T15:29:11.006Z // Last updated: 2025-10-02T15:29:10.924Z // Last updated: 2025-10-02T12:17:51.832Z // Last updated: 2025-10-02T12:17:51.752Z // Last updated: 2025-10-02T11:48:30.224Z // Last updated: 2025-10-02T11:48:30.141Z // Last updated: 2025-10-02T11:45:25.997Z // Last updated: 2025-10-02T11:45:25.918Z // Last updated: 2025-10-02T11:38:55.891Z // Last updated: 2025-10-02T11:38:55.805Z // Last updated: 2025-10-02T11:33:51.123Z // Last updated: 2025-10-02T11:33:51.040Z // Last updated: 2025-10-02T11:33:26.533Z // Last updated: 2025-10-02T11:33:26.453Z // Last updated: 2025-10-02T11:15:12.193Z // Last updated: 2025-10-02T11:15:12.113Z // Last updated: 2025-10-02T11:07:07.338Z // Last updated: 2025-10-02T11:07:07.259Z // Last updated: 2025-10-02T11:01:19.691Z // Last updated: 2025-10-02T11:01:19.612Z // Last updated: 2025-10-02T10:55:52.660Z // Last updated: 2025-10-02T10:55:52.583Z // Last updated: 2025-10-02T10:55:07.015Z // Last updated: 2025-10-02T10:55:06.937Z // Last updated: 2025-10-02T10:50:16.553Z // Last updated: 2025-10-02T10:50:16.477Z // Last updated: 2025-10-01T18:14:24.067Z // Last updated: 2025-10-01T18:14:23.984Z // Last updated: 2025-10-01T17:59:45.178Z // Last updated: 2025-10-01T17:59:45.096Z // Last updated: 2025-09-30T13:54:37.308Z // Last updated: 2025-09-30T13:54:37.205Z // Last updated: 2025-09-30T13:53:24.098Z // Last updated: 2025-09-30T13:53:23.994Z // Last updated: 2025-09-30T12:08:18.261Z // Last updated: 2025-09-30T12:08:18.161Z // Last updated: 2025-09-30T11:25:48.181Z // Last updated: 2025-09-30T11:25:48.075Z // Last updated: 2025-09-30T11:23:34.054Z // Last updated: 2025-09-30T11:23:33.948Z // Last updated: 2025-09-29T10:34:18.195Z // Last updated: 2025-09-29T10:34:18.115Z // Last updated: 2025-09-29T10:14:59.201Z // Last updated: 2025-09-29T10:14:59.120Z // Last updated: 2025-09-29T10:02:58.347Z // Last updated: 2025-09-29T10:02:58.267Z // Last updated: 2025-09-29T10:02:50.687Z // Last updated: 2025-09-29T09:55:48.641Z // Update this with each significant deploy

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
