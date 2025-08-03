// pages/SupportCircle.tsx
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore,
  Psychology,
  SelfImprovement,
  Balance,
  Groups,
} from '@mui/icons-material';

export const SupportCircle = () => {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8, textAlign: 'center' }}>
        <Container>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            🫱 Tabsy's Support Circle
          </Typography>
          <Typography variant="h6" maxWidth={700} mx="auto" mb={4}>
            Whether you're chasing wins or playing just for kicks, Tabsy’s got your back. Lean on budget tools and community tips to stay grounded and game wisely.
          </Typography>
          <Button 
            variant="contained" 
            size="large"
            sx={{ 
              bgcolor: 'secondary.main', 
              color: 'primary.main',
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              '&:hover': { bgcolor: 'secondary.light' }
            }}
          >
            💡 Helping Hands, Winning Plans
          </Button>
        </Container>
      </Box>

      <Container sx={{ py: 6 }}>
        {/* 1. Player Wellness Hub */}
        <Paper elevation={3} sx={{ p: 4, mb: 6, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🎧 Player Wellness Hub
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <SelfImprovement sx={{ fontSize: 40, mb: 2, color: 'primary.main' }} />
                  <Typography variant="h6" gutterBottom>Self-check tools</Typography>
                  <Typography>Assess mood, habits, and motivation behind play.</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Psychology sx={{ fontSize: 40, mb: 2, color: 'secondary.main' }} />
                  <Typography variant="h6" gutterBottom>Mindfulness audios</Typography>
                  <Typography>Brief audios with Tabsy’s cheerful voice to help players reset.</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Balance sx={{ fontSize: 40, mb: 2, color: 'success.main' }} />
                  <Typography variant="h6" gutterBottom>Encouraging messages</Typography>
                  <Typography>Reminders that it's okay to pause and take breaks.</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>

        {/* 2. Smart Play Toolkit */}
        <Paper elevation={3} sx={{ p: 4, mb: 6, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🧠 Smart Play Toolkit
          </Typography>
          <Box sx={{ textAlign: 'left', maxWidth: 600, mx: 'auto' }}>
            <ul>
              <li>Downloadable budget planners and goal-setting worksheets</li>
              <li>"Know Your Odds" guide with visual explanations</li>
              <li>Articles on compulsive behavior and help resources</li>
            </ul>
          </Box>
        </Paper>

        {/* 3. Uplift & Reflect Stories */}
        <Paper elevation={3} sx={{ p: 4, mb: 6, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🌟 Uplift & Reflect Stories
          </Typography>
          <Box sx={{ textAlign: 'left', maxWidth: 600, mx: 'auto' }}>
            <ul>
              <li>User reflections like "How I Knew I Needed a Break"</li>
              <li>Tabsy's gentle commentary and balance tips</li>
              <li>Rotating spotlight on healthy play habits</li>
            </ul>
          </Box>
        </Paper>

        {/* 4. Help & Resources Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 6, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            🛟 Help & Resources Section
          </Typography>
          <Box sx={{ textAlign: 'left', maxWidth: 600, mx: 'auto', mb: 3 }}>
            <ul>
              <li>Helplines, counseling services, and local support</li>
              <li>Financial counseling and debt/spending recovery tools</li>
            </ul>
          </Box>
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>What to do if I feel out of control?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>Reach out to support services immediately. You're not alone.</Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>How can I set play limits?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>Use our planner tools and reminders to stay within safe play boundaries.</Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        </Paper>

        {/* 5. Tabsy Talks: Community Q&A */}
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            💬 Tabsy Talks: Community Q&A
          </Typography>
          <Box sx={{ textAlign: 'left', maxWidth: 600, mx: 'auto' }}>
            <ul>
              <li>Moderated discussion board with weekly topics</li>
              <li>Wellness challenge rewards (like a "Pause & Reflect" badge)</li>
              <li>Anonymous Q&A answered by experts or Tabsy</li>
            </ul>
          </Box>
          <Button variant="outlined" startIcon={<Groups />} sx={{ mt: 2 }}>
            Join the Conversation
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};
