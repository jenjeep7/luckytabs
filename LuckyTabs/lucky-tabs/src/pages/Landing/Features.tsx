import React from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Paper,
  useTheme,
} from '@mui/material';

const Features: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box sx={{ 
      width: '100%', 
      minHeight: '100vh',
      position: 'relative',
      zIndex: 1,
      overflow: 'hidden'
    }}>
      {/* Hero Section */}
      <Box sx={{ 
        py: { xs: 3, md: 4 }, 
        bgcolor: isDarkMode ? 'background.default' : 'grey.100',
        width: '100%'
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h4" 
            align="center" 
            fontWeight="bold" 
            gutterBottom 
            color="text.primary"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
              mb: { xs: 2, md: 3 }
            }}
          >
            ✨ Why Tabsy Wins?
          </Typography>
          <Typography 
            variant="h6" 
            align="center" 
            maxWidth={800} 
            mx="auto" 
            mb={3} 
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
              px: { xs: 1, sm: 2 },
              lineHeight: { xs: 1.4, md: 1.6 }
            }}
          >
            {`Play smarter. Pull together. Win with purpose. Tabsy isn't just another app—it's your magical companion for tracking, predicting, and celebrating pull tab play. Whether you're a casual ripper or a streak-chasing strategist, Tabsy helps you play with confidence and connect with a vibrant community.`}
          </Typography>
        </Container>
      </Box>

      {/* Main Features */}
      <Box sx={{ 
        py: { xs: 3, md: 4 }, 
        bgcolor: isDarkMode ? 'background.paper' : 'white',
        width: '100%'
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {/* Smarter Predictions */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, height: '100%' }}>
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  gutterBottom 
                  color="text.primary"
                  sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }}
                >
                  🔍 Smarter Predictions
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' } }}
                >
                  {`Tabsy doesn't guess—he calculates. Using real player data, timing patterns, and community wisdom, Tabsy conjures up predictions that help you decide when to jump in, hold off, or walk away. His crystal ball isn't just for show—it's powered by insights that evolve with every box scanned and every streak logged.`}
                </Typography>
              </Paper>
            </Grid>

            {/* Personalized Experience */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
                  🎨 Personalized Experience
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {`Your play, your vibe, your Tabsy. Customize your journey with animated mascot reactions, flair card thumbnails, and profile badges that reflect your style. Whether you're tracking wins or sharing box scans, Tabsy makes it feel personal, playful, and uniquely yours.`}
                </Typography>
              </Paper>
            </Grid>

            {/* Community Magic */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
                  🌟 Community Magic
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {`Pull tabs are better together. Join a crew of symbol seekers, box whisperers, and win-chasers. Share your finds, swap strategies, and celebrate your streaks in real time. From group stats to flair reactions, Tabsy's community tools make every rip a shared adventure.`}
                </Typography>
              </Paper>
            </Grid>

            {/* Choose Your Tier */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
                  💎 Choose Your Tier
                </Typography>
                <Typography variant="body1" color="text.secondary" mb={2}>
                  {`Pick your power level. Whether you're just starting out or going full wizard mode, Tabsy's got a tier for you:`}
                </Typography>
                <Box sx={{ pl: 1 }}>
                  <Typography variant="body2" mb={0.5}>{`🟢 `}<strong>Tabsy Free Play</strong>{` – Track your play, join the community, and explore the basics.`}</Typography>
                  <Typography variant="body2" mb={0.5}>{`🟡 `}<strong>Tabsy Pro Pull</strong>{` – Unlock smarter predictions, flair scans, and budget tools.`}</Typography>
                  <Typography variant="body2">{`🔮 `}<strong>Tabsy Crystal Club</strong>{` – Get exclusive perks, early feature drops, and Tabsy's undivided magical attention.`}</Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Core Features */}
      <Box sx={{ py: 4, bgcolor: isDarkMode ? 'background.default' : 'grey.50' }}>
        <Container>
          <Grid container spacing={3}>
            {/* Core App Experience */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
                  🔮 Core App Experience
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Tabsy Predicts. You decide. Enter box details and let Tabsy guide your next move with advice tailored to your streak, budget, and timing. Choose your prediction level from Basic general guidance to Advanced recovery strategies and timing insights. Built for transparency—so you can judge every box with confidence.
                </Typography>
              </Paper>
            </Grid>

            {/* Smart Box Insights */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
                  📊 Smart Box Insights
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Turn data into decisions. Tabsy analyzes box stats to highlight what makes a pull tab worth playing. Use camera tools to scan flair, upload ticket images, and log locations. Track wins, losses, budget, and box quality over time. All insights, no spoilers—Tabsy never reveals exact odds, just smart signals.
                </Typography>
              </Paper>
            </Grid>

            {/* Community & Social Features */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom color="text.primary">
                  👥 Community & Social Features
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {`Play loud. Share proud. Join Tabsy's community for tips, meetups, and shared strategies. Tag #tabsywins to spotlight your favorite venues and boxes. Record your rips like TikTok-style clips and share your streaks. Learn from social tutorials on how to play smarter and spot winning patterns.`}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Final Call to Action Section */}
      <Box
        sx={{
          bgcolor: isDarkMode ? 'background.default' : 'primary.main',
          color: isDarkMode ? 'text.primary' : 'white',
          py: 6,
          textAlign: 'center',
        }}
      >
        <Container>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {`Ready to Join Tabsy's Community?`}
          </Typography>
          <Typography variant="h6" maxWidth={600} mx="auto" mb={3}>
            Connect with fellow enthusiasts, share insights, and elevate your pull tab experience today.
          </Typography>
          <Button
            variant="contained"
            href="/signup"
            sx={{
              bgcolor: 'secondary.main',
              color: 'white',
              '&:hover': {
                bgcolor: isDarkMode ? 'secondary.dark' : 'secondary.light',
              },
            }}
          >
            Join Now
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Features;