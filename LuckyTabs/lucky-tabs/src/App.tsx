/* App.tsx */
import { useMemo } from 'react';
// import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, useMediaQuery } from '@mui/material';
import { getDesignTokens } from './theme';
import AppRoutes from './AppRoutes';
import { UserProfileProvider } from './context/UserProfileContext';
import { LocationProvider } from './context/LocationContext';
import { VersionChecker } from './components/VersionChecker';
import AppBackground from './components/AppBackground';
import { auth } from "./firebase";

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () => createTheme(getDesignTokens(prefersDarkMode ? 'dark' : 'light')),
    [prefersDarkMode]
  );
  console.log('[App.tsx] app loaded');
  console.log('[App.tsx] Firebase Auth currentUser:', auth.currentUser);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBackground />
      {/* TEMP: Show direct auth state for debugging */}
      <UserProfileProvider>
        <LocationProvider>
          <AppRoutes />
          <VersionChecker />
        </LocationProvider>
      </UserProfileProvider>
    </ThemeProvider>
  );
}

export default App;