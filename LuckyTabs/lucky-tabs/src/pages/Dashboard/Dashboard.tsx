import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Paper,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
   const [displayName, setDisplayName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            setDisplayName(data.displayName || data.username || 'User');
          } else {
            setDisplayName(user.displayName || 'User');
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        setDisplayName('User');
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);


  return (
    <>
      {/* Hero Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 10, textAlign: 'center' }}>
        <Container>
          <Box> <img
                src="/Tabsy Wins Logo.png"
                alt="Tabsy Wins Logo"
                style={{ height: 150, marginRight: 16 }}
              /></Box>
          {displayName && <Typography variant="h4" gutterBottom>
            Welcome, {displayName}!
          </Typography>}
          
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Ready to turn your Pull Tab passion into a solo or shared{' '}
            <Box component="span" sx={{ color: 'success.main', display: 'inline', fontWeight: 'bold' }}>
              WINNING
            </Box>{' '}
            adventure?
          </Typography>
          <Typography variant="h6" maxWidth={600} mx="auto" gutterBottom>
            Introducing a new Pull Tab Community Player Experience – where every win, every game, and every insight is better together!           </Typography>
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate('/signup')}
            >
              Get Started Today
            </Button>
            <Button variant="outlined" color="inherit" size="large" href="#features">
              Explore Features
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: 10, bgcolor: 'background.default' }}>
        <Container>
          <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
            Key Features: Better Together
          </Typography>
          <Grid container spacing={4} mt={4}>
            {[
              {
                title: 'Collective Wisdom',
                desc: 'Track your wins/losses and contribute to a powerful database. Discover trending games nearby.',
              },
              {
                title: 'Shared Insights',
                desc: 'See community stats and charts to compare your gameplay and trends.',
              },
              {
                title: 'Connect & Compete',
                desc: 'Form groups, share wins, and join friendly leaderboards and achievements.',
              },
            ].map(({ title, desc }) => (
              <Grid key={title} size={{ xs: 12, md: 4 }}>
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
          <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
            How It Works: Join the Community
          </Typography>
          <Grid container spacing={4} mt={4}>
            {[
              {
                step: '1',
                title: 'Track Your Play',
                desc: 'Log the Date, Time, Game Name, Location, Amount Spent, Prize, and Notes with a simple interface.',
              },
              {
                step: '2',
                title: 'Share & Discover',
                desc: 'Share your logs anonymously or with friends to help the community find trending games.',
              },
              {
                step: '3',
                title: 'Connect & Engage',
                desc: 'Join groups, share wins, and enjoy friendly competition with leaderboards and achievements.',
              },
            ].map(({ step, title, desc }) => (
              <Grid key={title} size={{ xs: 12, md: 4 }}>
                <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      bgcolor: 'primary.main',
                      color: 'background.default',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      fontSize: 24,
                      fontWeight: 'bold',
                    }}
                  >
                    {step}
                  </Box>
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
      <Box id="testimonials" sx={{ py: 10, bgcolor: 'white' }}>
        <Container>
          <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
            Hear From Our Community
          </Typography>
          <Grid container spacing={4} mt={4}>
            {[
              {
                quote: 'The Pull Tab Community app has transformed my playing. It\'s awesome to see what others are playing and connect with friends!',
                name: 'Sarah L., Pull Tab Fan',
              },
              {
                quote: 'I love being able to track my games and see community trends. It adds a whole new layer of fun to pull tabs!',
                name: 'David C., Community Member',
              },
            ].map(({ quote, name }) => (
              <Grid key={name} size={{ xs: 12, md: 6 }}>
                <Paper elevation={2} sx={{ p: 4 }}>
                  <Typography variant="body1" fontStyle="italic" gutterBottom>
                    "{quote}"
                  </Typography>
                  <Typography variant="subtitle1" color="primary">
                    - {name}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Responsible Gaming Section */}
      <Box id="responsible-gaming" sx={{ py: 10, bgcolor: 'grey.100', textAlign: 'center' }}>
        <Container>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Play Responsibly, Together
          </Typography>
          <Typography variant="h6" maxWidth={600} mx="auto" mb={4}>
            Use budget tools and access community-driven resources to maintain healthy play habits.
          </Typography>
          <Button variant="contained" color="primary">
            Learn About Responsible Gaming
          </Button>
        </Container>
      </Box>

      {/* Final Call to Action Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 10, textAlign: 'center', borderTopLeftRadius: 32, borderTopRightRadius: 32 }}>
        <Container>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Ready to Join the Pull Tab Community?
          </Typography>
          <Typography variant="h6" maxWidth={600} mx="auto" mb={4}>
            Connect with fellow enthusiasts, share insights, and elevate your pull tab experience today.
          </Typography>
          <Button variant="contained" sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}>
            Download the App
          </Button>
        </Container>
      </Box>

      {/* Footer Section */}
      <Box id="contact" sx={{ bgcolor: 'grey.900', color: 'grey.300', py: 6, textAlign: 'center' }}>
        <Typography variant="h6" color="white" gutterBottom>
          Pull Tab Community
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap', mb: 2 }}>
          {['Features', 'How It Works', 'Testimonials', 'Responsible Gaming', 'Privacy Policy'].map((item) => (
            <Button key={item} href={`#${item.toLowerCase().replace(/ /g, '-')}`} sx={{ color: 'inherit' }}>
              {item}
            </Button>
          ))}
        </Box>
        <Typography variant="caption">
          &copy; 2025 Pull Tab Community. All rights reserved. For entertainment purposes only. Please play responsibly.
        </Typography>
      </Box>
    </>
  );
};

export default Dashboard;
