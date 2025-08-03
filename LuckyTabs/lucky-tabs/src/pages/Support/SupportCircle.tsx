// pages/SupportCircle.tsx
import { useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

export const SupportCircle = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8, textAlign: 'center' }}>
        <Container>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            {`🫱 Tabsy's Support Circle`}
          </Typography>
          <Typography variant="h6" maxWidth={700} mx="auto" mb={4}>
            {`Whether you're chasing wins or playing just for kicks, Tabsy's got your back.
            Lean on budget tools and community tips to stay grounded and game wisely.`}
          </Typography>
        </Container>
      </Box>

      {/* Content Section */}
      <Container sx={{ py: 6, textAlign: 'center' }}>
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {/* 1. Player Wellness Hub */}
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 4, mb: 2 }}>
            {`1. 🎧 Player Wellness Hub`}
          </Typography>
          <Typography paragraph>
            {`Self-check tools for players to assess mood, habits, and motivation behind play`}
          </Typography>
          <Typography paragraph>
            {`Brief mindfulness audios with Tabsy's cheerful voice to help players reset`}
          </Typography>
          <Typography paragraph>
            {`Encouraging messages reminding players that it's okay to pause and take breaks`}
          </Typography>

          {/* 2. Smart Play Toolkit */}
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 4, mb: 2 }}>
            {`2. 🧠 Smart Play Toolkit`}
          </Typography>
          <Typography paragraph>
            {`Downloadable budget planners and goal-setting worksheets tailored for pull-tab players`}
          </Typography>
          <Typography paragraph>
            {`A "Know Your Odds" guide explaining pull-tab probabilities in a friendly, visual way`}
          </Typography>
          <Typography paragraph>
            {`Articles on how to recognize compulsive behaviors and resources for seeking help`}
          </Typography>

          {/* 3. Uplift & Reflect Stories */}
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 4, mb: 2 }}>
            {`3. 🌟 Uplift & Reflect Stories`}
          </Typography>
          <Typography paragraph>
            {`Short user-submitted reflections like "How I Knew I Needed a Break" or "Playing With a Purpose"`}
          </Typography>
          <Typography paragraph>
            {`Tabsy's gentle commentary on player journeys and tips for staying balanced`}
          </Typography>
          <Typography paragraph>
            {`A rotating spotlight feature celebrating healthy play habits in the community`}
          </Typography>

          {/* 4. Help & Resources Section */}
          <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mt: 4, mb: 2 }}>
            {`4. 🛟 Help & Resources Section`}
          </Typography>
          <Box sx={{ textAlign: 'left', maxWidth: 600, mx: 'auto', mb: 3 }}>
            <ul>
              <li>{`Helplines, counseling services, and local support`}</li>
              <li>{`Financial counseling and debt/spending recovery tools`}</li>
            </ul>
          </Box>
          <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>{`What to do if I feel out of control?`}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  {`Reach out to support services immediately. You're not alone.`}
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography>{`How can I set play limits?`}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>
                  {`Use our planner tools and reminders to stay within safe play boundaries.`}
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>

          {/* 5. Tabsy Talks: Community Q&A */}
          <Paper elevation={3} sx={{ p: 4, mt: 6, textAlign: 'center' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {`💬 Tabsy Talks: Community Q&A`}
            </Typography>
            <Box sx={{ textAlign: 'left', maxWidth: 600, mx: 'auto' }}>
              <ul>
                <li>{`Moderated discussion board with weekly topics`}</li>
                <li>{`Wellness challenge rewards (like a "Pause & Reflect" badge)`}</li>
                <li>{`Anonymous Q&A answered by experts or Tabsy`}</li>
              </ul>
            </Box>
            {/* <Button variant="outlined" startIcon={<Groups />} sx={{ mt: 2 }}>
              Join the Conversation
            </Button> */}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};
