/* App.tsx */
import { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, useMediaQuery } from '@mui/material';
import { getDesignTokens } from './theme';
import AppRoutes from './AppRoutes';
import { UserProfileProvider } from './context/UserProfileContext';

function App() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const theme = useMemo(
    () => createTheme(getDesignTokens(prefersDarkMode ? 'dark' : 'light')),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserProfileProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </UserProfileProvider>
    </ThemeProvider>
  );
}

export default App;