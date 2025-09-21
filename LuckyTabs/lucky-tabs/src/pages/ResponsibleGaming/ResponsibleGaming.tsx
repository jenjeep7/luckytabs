import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemIcon, ListItemText, Link, Divider, IconButton } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import TimelineIcon from '@mui/icons-material/Timeline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import GroupIcon from '@mui/icons-material/Group';
import HelpIcon from '@mui/icons-material/Help';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const ResponsibleGaming: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box sx={{
      maxWidth: 700,
      mx: 'auto',
      my: { xs: 0, md: 4 },
      p: { xs: 2, md: 4 },
      bgcolor: 'background.paper',
    }}>
      {/* Back Button */}
      <Box sx={{ mb: 2 }}>
        <IconButton 
          onClick={() => void navigate(-1)}
          size="small"
          sx={{ 
            color: theme.neon.colors.cyan,
            '&:hover': {
              backgroundColor: 'rgba(0, 255, 255, 0.1)',
            }
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Box>
      
      <Typography variant="h5" sx={{
        fontWeight: 900,
        color: theme.neon.colors.cyan,
        mb: 1,
        textAlign: 'center',
        ...theme.neon.effects.textGlow(theme.neon.colors.cyan, 0.7)
      }}>
        🎯 Responsible Gambling
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 3, color: theme.neon.colors.text.secondary, textAlign: 'center' }}>
        Play smart. Stay safe. Keep it magical.
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
        At Tabsy Wins, we believe pull tab play should be fun, social, and empowering—not stressful or harmful. Tabsy’s here to help you make smart choices, track your play, and stay in control—because the real win is playing with purpose.
      </Typography>

      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ color: theme.neon.colors.pink, fontWeight: 800, mb: 2, ...theme.neon.effects.textGlow(theme.neon.colors.pink, 0.5) }}>
          🧠 Tabsy’s Smart Play Principles
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText primary={<>
              <b>Set a budget before you play</b> – Decide what you can afford to lose and stick to it. Tabsy’s budgeting tools help you track spending and avoid surprises.
            </>} />
          </ListItem>
          <ListItem>
            <ListItemIcon><LightbulbIcon color="warning" /></ListItemIcon>
            <ListItemText primary={<>
              <b>Don’t chase losses</b> – If you’re on a cold streak, take a break. Tabsy’s prediction tools include recovery tips and gentle nudges to help you reset.
            </>} />
          </ListItem>
          <ListItem>
            <ListItemIcon><EmojiEventsIcon color="secondary" /></ListItemIcon>
            <ListItemText primary={<>
              <b>Play for fun, not income</b> – Pull tabs are entertainment—not a paycheck. Tabsy helps you focus on the experience, not the outcome.
            </>} />
          </ListItem>
          <ListItem>
            <ListItemIcon><TrackChangesIcon color="info" /></ListItemIcon>
            <ListItemText primary={<>
              <b>Know your patterns</b> – Use Tabsy’s session logs to spot trends in your play. If you’re playing more often or spending more than usual, it might be time to pause.
            </>} />
          </ListItem>
          <ListItem>
            <ListItemIcon><AutoAwesomeIcon sx={{ color: theme.neon.colors.amber }} /></ListItemIcon>
            <ListItemText primary={<>
              <b>Avoid mixing alcohol and high-stakes play</b> – A few drinks with friends? Great. But Tabsy recommends keeping your pulls light when your judgment might be fuzzy.
            </>} />
          </ListItem>
          <ListItem>
            <ListItemIcon><NotificationsActiveIcon color="primary" /></ListItemIcon>
            <ListItemText primary={<>
              <b>Take breaks and set limits</b> – Tabsy’s mindful play alerts can remind you to step away, stretch, or check your budget.
            </>} />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ color: theme.neon.colors.green, fontWeight: 800, mb: 2, ...theme.neon.effects.textGlow(theme.neon.colors.green, 0.5) }}>
          🧭 Tools That Help You Stay in Control
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><LocalAtmIcon color="success" /></ListItemIcon>
            <ListItemText primary="💸 Budget tracking and alerts" />
          </ListItem>
          <ListItem>
            <ListItemIcon><TimelineIcon color="info" /></ListItemIcon>
            <ListItemText primary="📊 Session logs with win/loss summaries" />
          </ListItem>
          <ListItem>
            <ListItemIcon><LightbulbIcon color="warning" /></ListItemIcon>
            <ListItemText primary="🔮 Prediction levels that include recovery advice" />
          </ListItem>
          <ListItem>
            <ListItemIcon><AutoAwesomeIcon sx={{ color: theme.neon.colors.amber }} /></ListItemIcon>
            <ListItemText primary="🧘 Mindful play reminders" />
          </ListItem>
          <ListItem>
            <ListItemIcon><GroupIcon color="secondary" /></ListItemIcon>
            <ListItemText primary="🧠 Community tips and shared strategies" />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, mb: 4, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h5" sx={{ color: theme.neon.colors.red, fontWeight: 800, mb: 2, ...theme.neon.effects.textGlow(theme.neon.colors.red, 0.5) }}>
          🆘 Need Help?
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          If gambling is no longer fun—or feels out of control—there’s help available.
        </Typography>
        <Typography variant="body2" sx={{ mb: 1 }}>
          <b>Minnesota residents can access:</b>
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon><HelpIcon color="error" /></ListItemIcon>
            <ListItemText primary={<>
              <b>A 24-hour confidential helpline:</b> <Link href="tel:8003334673" color="error.main" underline="hover">800-333-HOPE</Link>
            </>} />
          </ListItem>
          <ListItem>
            <ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon>
            <ListItemText primary="Free inpatient and outpatient treatment for those who qualify" />
          </ListItem>
          <ListItem>
            <ListItemIcon><NotificationsActiveIcon color="primary" /></ListItemIcon>
            <ListItemText primary={<>
              <b>A motivational text program:</b><br />
              Text <b>EncourageMeMN</b> (English) or <b>AnimameMN</b> (Spanish) to <b>53342</b><br />
              Offers tips, encouragement, and support for change
            </>} />
          </ListItem>
        </List>
        <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>
          Visit Minnesota’s Gambling Help page for more resources, brochures, and support options.
        </Typography>
        <Link href="https://mn.gov/dhs/people-we-serve/adults/services/gambling-problems/" target="_blank" rel="noopener" color="primary" underline="hover" sx={{ fontWeight: 700 }}>
          👉 MN Gambling Help Page
        </Link>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
          {`From MN.gov: "Problem gambling DHS pays for inpatient and outpatient problem gambling treatment for residents who qualify for help as well as a statewide, toll-free, confidential 24-hour helpline. For more information about problem gambling, call 800-333-HOPE or visit GetGamblingHelp.com. To participate in a motivational text messaging program, text EncourageMeMN (English) or AnimameMN (Spanish) to 53342 ..."`}
        </Typography>
      </Paper>

      <Divider sx={{ my: 4, borderColor: theme.neon.colors.cyan, opacity: 0.3 }} />

      <Typography variant="h5" sx={{ color: theme.neon.colors.cyan, fontWeight: 800, mb: 2, textAlign: 'center', ...theme.neon.effects.textGlow(theme.neon.colors.cyan, 0.5) }}>
        💬 Tabsy’s Final Word
      </Typography>
      <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
        You’re not just a player—you’re part of a crew. Tabsy’s mission is to make pull tab play smarter, safer, and more magical. That starts with trust, transparency, and looking out for each other.
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
        If you ever feel like the fun’s fading, reach out. There’s always a way forward—and Tabsy’s here to help you find it.
      </Typography>
    </Box>
  );
};

export default ResponsibleGaming;
