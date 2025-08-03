import React from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Paper,
  IconButton,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { useNavigate } from 'react-router-dom';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Hero Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 10, textAlign: 'center' }}>
        <Container>
          <Box>
            <img
              src="/Tabsy Wins Logo.png"
              alt="Tabsy Wins Logo"
              style={{ height: 300, marginRight: 16, paddingBottom: 16 }}
            />
          </Box>

          <Typography variant="h2" fontWeight="bold" gutterBottom>
            Ready to turn your pull tab passion into a{' '}
            <Box component="span" sx={{ color: 'success.main', display: 'block', fontWeight: 'bold' }}>
              WINNING
            </Box>{' '}
            adventure?
          </Typography>
          <Typography variant="h6" maxWidth={600} mx="auto" gutterBottom>
            Introducing a new pull tab community player experience – where every win, every game, and every insight is better together!
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/signup')}
            >
              Join Tabsy Today
            </Button>
            <Button variant="outlined" color="inherit" size="large" href="#features">
              Explore Features
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: 5, bgcolor: 'background.default' }}>
        <Container>
          <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
            Features
          </Typography>
          <Grid container spacing={4} mt={4}>
            {[
              {
                title: '🎯 Outsmart the Odds! ',
                desc: 'Enter in box information, and Tabsy’s clever system ranks your pull tab chances with the juiciest odds—so you play smart, not random.',
              },
              {
                title: `🕹️ Tabsy's Player Pad `,
                desc: 'Track your pulls, flex your wins, and choose who gets the backstage pass—just you, your crew, or the whole tab-loving world.',
              },
              {
                title: `📍 Tabsy's Hotspot Hub `,
                desc: `Bars and non-profits get their own profiles to flaunt fresh pull tab boxes, spotlight crowd favorites, and show off where the action is. It’s like a VIP pass for players hunting the best spots to play.`,
              },
            ].map(({ title, desc }) => (
              <Grid key={title} item xs={12} md={4}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
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

      {/* How It Works Section */}
      <Box id="how-it-works" sx={{ py: 10, bgcolor: 'grey.100' }}>
        <Container>
          <Typography variant="h4" align="center" fontWeight="bold" color="primary.main" gutterBottom>
            How the Luck Lines Up
          </Typography>
          <Grid container spacing={4} mt={4}>
            {[
              {
                title: `🔥 The Pull Pulse `,
                desc: 'Tabsy taps into the hive mind of pull-tab pros! Share your data anonymously and watch the magic unfold as the community dashboard lights up with “hot” and “cold” boxes near you—real-time vibes, no guesswork',
              },
              {
                title: `🎮 Tabsy’s League of Legends`,
                desc: 'Why pull solo when you can compete with the pros? Tabsy turns the playroom into a battleground—join virtual leagues, climb the win board, rack up shiny badges, and chase profit glory. Every milestone is a flex, every game a social spark.',
              },
              {
                title: `🎯 Behind the Pulls: Tabsy’s Playlog  `,
                desc: 'Tabsy’s got the goods on every game you play. Like your own luck analyst, it maps your moves, logs your box hits, and highlights your high-roller moments—so you can play smarter and flex harder.',
              },
            ].map(({ title, desc }) => (
              <Grid key={title} item xs={12} md={4}>
                <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
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
      <Box id="testimonials" sx={{ py: 10, bgcolor: 'primary.main' }}>
        <Container>
          <Typography variant="h4" align="center" fontWeight="bold" color="text.light" gutterBottom>
            📣 Pulled & Proud
          </Typography>
          <Typography variant="h6" align="center" color="text.light" maxWidth={600} mx="auto" mb={4}>
            From first-timers to high-rollers, Tabsy fans spill the beans on their big moments, fave features, and what keeps ‘em coming back.
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
              <Grid key={name} item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 4 }} color="text.secondary">
                  <Typography variant="body1" fontStyle="italic" gutterBottom>
                    "{quote}"
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
        sx={{ py: 10, bgcolor: 'background.default', textAlign: 'center', color: 'text.primary' }}
      >
        <Container>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            🫱 Tabsy’s Support Circle
          </Typography>
          <Typography variant="h6" maxWidth={600} mx="auto" mb={4}>
            Whether you're chasing wins or playing just for kicks, Tabsy’s got your back. Lean on budget tools and community tips to stay grounded and game wisely.
          </Typography>
          <Button
            variant="contained"
            sx={{ bgcolor: 'background.contrast', color: 'text.contrast' }}
            onClick={() => navigate('/support-circle')}
          >
            Learn About Responsible Gaming
          </Button>
        </Container>
      </Box>

      {/* Final Call to Action Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 10, textAlign: 'center' }}>
        <Container>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Ready to join Tabsy's community?
          </Typography>
          <Typography variant="h6" maxWidth={600} mx="auto" mb={4}>
            Connect with fellow enthusiasts, share insights, and elevate your pull tab experience today.
          </Typography>
          <Button variant="contained" sx={{ bgcolor: 'secondary.main', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}>
            Join Now
          </Button>
        </Container>
      </Box>

      {/* Footer Section */}
      <Box id="contact" sx={{ bgcolor: 'grey.900', color: 'grey.300', py: 6, textAlign: 'center' }}>
        <Typography variant="h6" color="white" gutterBottom>
          Tabsy's Community
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap', mb: 2 }}>
          {['Features', 'How It Works', 'Testimonials', 'Responsible Gaming', 'Privacy Policy'].map((item) => (
            <Button key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} sx={{ color: '#ffffff' }}>
              {item}
            </Button>
          ))}
        </Box>

        {/* Social Media Icons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 3 }}>
          <IconButton
            href="https://facebook.com/tabsyscommunity"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'grey.300', '&:hover': { color: '#1877F2' } }}
          >
            <FacebookIcon />
          </IconButton>
          <IconButton
            href="https://www.instagram.com/tabsy_wins/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'grey.300', '&:hover': { color: '#E4405F' } }}
          >
            <InstagramIcon />
          </IconButton>
          <IconButton
            href="https://twitter.com/tabsyscommunity"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'grey.300', '&:hover': { color: '#1DA1F2' } }}
          >
            <TwitterIcon />
          </IconButton>
          <IconButton
            href="https://www.youtube.com/@TabsyWins"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'grey.300', '&:hover': { color: '#FF0000' } }}
          >
            <YouTubeIcon />
          </IconButton>
        </Box>

        <Typography variant="caption">
          &copy; 2025 Tabsy's Community. All rights reserved. For entertainment purposes only. Please play responsibly.
        </Typography>
      </Box>
    </>
  );
};

export default LandingPage;
