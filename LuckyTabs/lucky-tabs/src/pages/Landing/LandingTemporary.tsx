import React, { useState, useEffect } from 'react';
import { Box, Button, Typography } from '@mui/material';

const LandingTemporary: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    let targetDate = new Date(`January 1, ${currentYear + 1} 00:00:00`); // Next year's January 1st

    // If we're already past January 1st of current year, use next year
    if (now > new Date(`January 1, ${currentYear} 00:00:00`)) {
      targetDate = new Date(`January 1, ${currentYear + 1} 00:00:00`);
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        return { days, hours, minutes, seconds };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft()); // Set initial value

    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      minHeight="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      bgcolor="primary.main"
    >
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" color="white" fontWeight="bold" gutterBottom>
          {`Coming Soon`}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ textAlign: 'center', minWidth: 60 }}>
            <Typography variant="h3" color="secondary.main" fontWeight="bold">
              {timeLeft.days}
            </Typography>
            <Typography variant="body2" color="white">
              {`Days`}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: 60 }}>
            <Typography variant="h3" color="secondary.main" fontWeight="bold">
              {timeLeft.hours}
            </Typography>
            <Typography variant="body2" color="white">
              {`Hours`}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: 60 }}>
            <Typography variant="h3" color="secondary.main" fontWeight="bold">
              {timeLeft.minutes}
            </Typography>
            <Typography variant="body2" color="white">
              {`Minutes`}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center', minWidth: 60 }}>
            <Typography variant="h3" color="secondary.main" fontWeight="bold">
              {timeLeft.seconds}
            </Typography>
            <Typography variant="body2" color="white">
              {`Seconds`}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" color="secondary.main" fontWeight="bold">
          2
        </Typography>
        <Typography variant="body1" color="white">
          {`Current Beta Players Already Signed Up`}
        </Typography>
      </Box>
      <img
        src="/TabsyNew.png"
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
