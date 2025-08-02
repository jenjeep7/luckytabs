import React from 'react';
import { Box, Button } from '@mui/material';

const LandingTemporary: React.FC = () => {
  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bgcolor="primary.main"
    >
      <img
        src="/Tabsy Wins Logo.png"
        alt="Tabsy Wins Logo"
        style={{ height: 300, margin: 32 }}
      />
      <Button
        variant="contained"
        color="secondary"
        size="large"
        href="/login"
      >
        Login
      </Button>
    </Box>
  );
};

export default LandingTemporary;
