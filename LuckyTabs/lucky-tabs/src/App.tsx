/* App.tsx */
import { useMemo, useEffect } from 'react';
// import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, useMediaQuery } from '@mui/material';
import { getDesignTokens } from './theme';
import AppRoutes from './AppRoutes';
import { UserProfileProvider } from './context/UserProfileContext';
import { LocationProvider } from './context/LocationContext';
import { VersionChecker } from './components/VersionChecker';
import { GamblingDisclaimer } from './components/GamblingDisclaimer';
import AppBackground from './components/AppBackground';
import { useAuthStateCompat } from './services/useAuthStateCompat';
import { usePageViews } from './utils/analytics-routing';
import { initializeCompleteAnalytics } from './utils/analytics-init';
import { bindUserIdentity, initScrollDepth } from './utils/analytics';
import { configureStatusBar } from './native/statusBar';
import { SplashScreen } from '@capacitor/splash-screen';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [user, loading, error] = useAuthStateCompat();

  // Initialize page view tracking
  usePageViews();

  const theme = useMemo(
    () => createTheme(getDesignTokens(prefersDarkMode ? 'dark' : 'light')),
    [prefersDarkMode]
  );

  // Initialize analytics when app starts
  useEffect(() => {
    void initializeCompleteAnalytics();
    
    // Initialize scroll depth tracking
    const cleanup = initScrollDepth();
    
    return cleanup;
  }, []);

  // Configure status bar for native platforms
  useEffect(() => {
    configureStatusBar(prefersDarkMode).catch(() => {
      // Silently ignore status bar configuration errors
    });
    
    // Hide splash screen after app loads
    setTimeout(() => {
      SplashScreen.hide().catch(() => {
        // Silently ignore splash screen errors
      });
    }, 1500);
  }, [prefersDarkMode]);

  // Bind user identity for analytics when auth state changes
  useEffect(() => {
    if (!loading) {
      bindUserIdentity(user?.uid);
    }
  }, [user, loading]);
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[App.tsx] app loaded - ENHANCED ANALYTICS VERSION');
    console.log('[App.tsx] Auth state - user:', user?.uid || 'no user', 'loading:', loading, 'error:', error);
  }
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBackground />
      {/* TEMP: Show direct auth state for debugging */}
      <UserProfileProvider>
        <LocationProvider>
          <AppRoutes />
          <VersionChecker />
          <GamblingDisclaimer />
        </LocationProvider>
      </UserProfileProvider>
    </ThemeProvider>
  );
}

export default App;