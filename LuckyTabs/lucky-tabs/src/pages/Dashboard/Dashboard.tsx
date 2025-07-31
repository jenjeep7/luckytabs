import React from 'react';
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

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  return (
    <>
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 10, textAlign: 'center' }}>
        <Container>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Turn Your Pull Tab Passion into a Shared Adventure
          </Typography>
          <Typography variant="h6" maxWidth={600} mx="auto" gutterBottom>
            Introducing the Pull Tab Community Player App – where every win, every game, and every insight is better together!
          </Typography>
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
      <Box id="features" sx={{ py: 10, bgcolor: 'white' }}>
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
