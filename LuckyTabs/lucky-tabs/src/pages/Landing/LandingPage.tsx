/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Paper,
  useTheme,
  Stack,
} from '@mui/material';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <>
      {/* Hero Section */}
      <Box sx={{ 
        bgcolor: isDarkMode ? 'background.paper' : 'primary.main', 
        color: isDarkMode ? 'text.primary' : 'white', 
        py: 10, 
        textAlign: 'center' 
      }}>
        <Container>
          <Box>
            <img
              src="/Tabsy New Logo.png"
              alt="Tabsy Wins Logo"
              style={{ height: 250, marginRight: 16, paddingBottom: 16 }}
            />
          </Box>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Ready to turn your pull tab passion into a{' '}
            <Box component="span" sx={{ color: 'success.main', display: 'block', fontWeight: 'bold' }}>
              WINNING
            </Box>{' '}
            adventure?
          </Typography>
          <Typography variant="body1" maxWidth={600} mx="auto" gutterBottom>
            {`Introducing a new pull tab community player experience – where every win, every game, and every insight is better together!`}
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              {!user && (
                <Button
                  href="/login"
                  size="large"
                  variant="contained"
                  color="success"
                  sx={{
                    px: 3.5,
                    py: 1.25,
                    fontWeight: 800,
                    textTransform: 'none',
                    borderRadius: 999,
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                  }}
                >
                  Login to Play
                </Button>
              )}

              <Button
                href="/demo"
                size="large"
                variant="contained"
                color="secondary"
                sx={{
                  px: 3.5,
                  py: 1.25,
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: 999,
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                }}
              >
                Features
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ 
        py: 8, 
        bgcolor: isDarkMode ? 'background.default' : 'grey.100' 
      }}>
        <Container>
          <Typography variant="h4" align="center" fontWeight="bold" gutterBottom color="text.primary">
            Features & How the Luck Lines Up
          </Typography>
          <Grid container spacing={4} mt={4}>
            {[
              {
                title: '🎯 Outsmart the Odds! ',
                desc: 'Enter in box information, and Tabsy\'s clever system ranks your pull tab chances with the juiciest odds - so you play smart, not random.',
              },
              {
                title: `🕹️ Tabsy's Player Pad `,
                desc: 'Track your pulls, flex your wins, and choose who gets the backstage pass - just you, your crew, or the whole tab-loving world.',
              },
              {
                title: `📍 Tabsy's Hotspot Hub `,
                desc: `Bars and non-profits get their own profiles to flaunt fresh pull tab boxes, spotlight crowd favorites, and show off where the action is. It's like a VIP pass for players hunting the best spots to play.`,
              },
              {
                title: `🔥 The Pull Pulse `,
                desc: 'Tabsy taps into the hive mind of pull-tab pros! Share your data anonymously and watch the magic unfold as the community dashboard lights up with "hot" and "cold" boxes near you - real-time vibes, no guesswork',
              },
              {
                title: `🎮 Tabsy's League of Legends`,
                desc: 'Why pull solo when you can compete with the pros? Tabsy turns the playroom into a battleground - join virtual leagues, climb the win board, rack up shiny badges, and chase profit glory. Every milestone is a flex, every game a social spark.',
              },
              {
                title: `🎯 Behind the Pulls: Tabsy's Playlog  `,
                desc: 'Tabsy\'s got the goods on every game you play. Like your own luck analyst, it maps your moves, logs your box hits, and highlights your high-roller moments - so you can play smarter and flex harder.',
              },
            ].map(({ title, desc }) => (
              <Grid key={title} size={{ xs: 12, md: 4 }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {title}
                  </Typography>
                  <Typography>{desc}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box id="testimonials" sx={{ 
        py: 10, 
        bgcolor: isDarkMode ? 'background.paper' : 'primary.main', 
        color: isDarkMode ? 'text.primary' : 'white', 
        textAlign: 'center' 
      }}>
        <Container>
          <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
            📣 Pulled & Proud
          </Typography>
          <Typography variant="h6" align="center" maxWidth={600} mx="auto" mb={4}>
            From first-timers to high-rollers, Tabsy fans spill the beans on their big moments, fave features, and what keeps them coming back.
          </Typography>
          <Grid container spacing={4} mt={4}>
            {[
              {
                quote: `Tabsy Wins has transformed my playing. It's awesome to see what others are playing and connect with friends!`,
                name: 'Kylie M., Pull Tab Fan',
              },
              {
                quote: 'I love being able to track my games and see community trends. It adds a whole new layer of fun to pull tabs!',
                name: 'Cody J., Community Member',
              },              
            ].map(({ quote, name }) => (
              <Grid key={name} size={{ xs: 12, md: 6 }}>
                <Paper elevation={2} sx={{ 
                  p: 4,
                  bgcolor: isDarkMode ? 'background.default' : 'white',
                  color: 'text.primary'
                }}>
                  <Typography variant="body1" fontStyle="italic" gutterBottom>
                    &quot;{quote}&quot;
                  </Typography>
                  <Typography variant="subtitle1" color="text.primary" fontWeight="bold">
                    - {name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Responsible Gaming Section */}
      <Box
        id="responsible-gaming"
        sx={{ 
          py: 10, 
          bgcolor: isDarkMode ? 'background.default' : 'grey.100', 
          textAlign: 'center', 
          color: 'text.primary' 
        }}
      >
        <Container>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
            <VolunteerActivismIcon sx={{ fontSize: '2rem', color: 'error.main' }} />
            <Typography variant="h4" fontWeight="bold">
              {`Helping Hands, Winning Plans`}
            </Typography>
          </Box>
          <Typography variant="h6" maxWidth={600} mx="auto" mb={4}>
            {`Whether you're chasing wins or playing just for kicks, Tabsy's got your back. Lean on budget tools and community tips to stay grounded and game wisely.`}
          </Typography>
          <Button
            variant="contained"
            sx={{ bgcolor: 'error.main', color: 'white' }}
            onClick={() => navigate('/support-circle')}
          >
            {`Tabsy's Play it Cool Guide`}
          </Button>
        </Container>
      </Box>

      {/* Final Call to Action Section */}
      <Box sx={{ 
        bgcolor: isDarkMode ? 'background.paper' : 'primary.main', 
        color: isDarkMode ? 'text.primary' : 'white', 
        py: 10, 
        textAlign: 'center' 
      }}>
        <Container>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {`Ready to Join Tabsy's Community?`}
          </Typography>
          <Typography variant="h6" maxWidth={600} mx="auto" mb={4}>
            Connect with fellow enthusiasts, share insights, and elevate your pull tab experience today.
          </Typography>
          <Button 
            variant="contained" 
            sx={{ 
              bgcolor: 'secondary.main', 
              color: 'white',
              '&:hover': { 
                bgcolor: isDarkMode ? 'secondary.dark' : 'secondary.light' 
              } 
            }}
          >
            Join Now
          </Button>
        </Container>
      </Box>
    </>
  );
};

export default LandingPage;
