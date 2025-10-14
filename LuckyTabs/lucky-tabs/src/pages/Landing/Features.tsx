import React from 'react';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Paper,
  useTheme
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Features: React.FC = () => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box sx={{
      width: '100%',
      minHeight: '100vh',
      position: 'relative',
      zIndex: 1,
      overflow: 'hidden',
      ...theme.neon.effects.gamingBackground(0.98),
    }}>
      {/* Sparkle effect for flair */}
      <Box sx={{
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        background: `repeating-radial-gradient(circle at 80% 20%, rgba(125,249,255,0.08) 0, rgba(255,60,172,0.04) 40px, transparent 80px)`,
        opacity: 0.7,
        animation: 'tabsySparkle 8s linear infinite',
        '@keyframes tabsySparkle': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 100%' },
        },
      }} />
      {/* Hero Section */}
      <Box sx={{
        pt: { xs: 4, md: 6 },
        width: '100%',
        position: 'relative',
        bgcolor: 'background.paper',
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h3"
            align="center"
            fontWeight="bold"
            gutterBottom
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              mb: { xs: 2, md: 3 },
              color: theme.neon.colors.cyan,
              ...theme.neon.effects.textGlow(theme.neon.colors.cyan, 0.7),
              letterSpacing: '.01em',
            }}
          >
            Welcome to Tabsy Wins!
          </Typography>
          <Typography
            variant="h5"
            align="center"
            maxWidth={800}
            mx="auto"
            mb={2}
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
              px: { xs: 1, sm: 2 },
              lineHeight: { xs: 1.5, md: 1.6 },
              color: theme.neon.colors.text.secondary,
              ...theme.neon.effects.textGlow(theme.neon.colors.pink, 0.3),
            }}
          >
            The only pull tab app powered by magic, sarcasm, and your questionable decision-making.
          </Typography>
          <Typography
            variant="h6"
            align="center"
            maxWidth={700}
            mx="auto"
            mb={4}
            sx={{
              fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
              px: { xs: 1, sm: 2 },
              lineHeight: { xs: 1.5, md: 1.6 },
              color: theme.neon.colors.text.primary,
              fontWeight: 500,
            }}
          >
            Track your play. Predict your odds. Get roasted by Tabsy.
            <br />
            It&apos;s solo gambling, smarter—and way more entertaining.
          </Typography>
        </Container>
      </Box>

      {/* Why Tabsy Wins Section */}
      <Box sx={{
        py: { xs: 2 },
        bgcolor: 'background.paper',
        width: '100%',
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h4"
            align="center"
            fontWeight="bold"
            gutterBottom
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              mb: { xs: 3, md: 4 },
              color: theme.neon.colors.pink,
              ...theme.neon.effects.textGlow(theme.neon.colors.pink, 0.6),
            }}
          >
            Why Tabsy Wins?
          </Typography>
          
          <Paper elevation={3} sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            border: `1.5px solid ${theme.neon.colors.cyan}`,
            background: 'rgba(18,20,24,0.92)',
            boxShadow: theme.neon.effects.boxGlow(theme.neon.colors.cyan, 0.13).boxShadow,
            borderRadius: 1,
          }}>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '1rem', md: '1.125rem' },
                lineHeight: 1.7,
                mb: 3
              }}
            >
              Imagine walking into your favorite corner dive, American Legion, VFW or the like. The pull tab box is untouched. You&apos;ve got a few bucks, a gut feeling, and just enough optimism to ignore your past losses.
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '1rem', md: '1.125rem' },
                lineHeight: 1.7,
                mb: 3
              }}
            >
              But what if you had more than just blind hope and beer-fueled instincts?
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.primary"
              sx={{ 
                fontSize: { xs: '1rem', md: '1.125rem' },
                lineHeight: 1.7,
                fontWeight: 500,
                mb: 3
              }}
            >
              Enter Tabsy—your sarcastic sidekick and gambling magician. He doesn&apos;t just track your play, he reacts to it. He celebrates your wins like a game show host and roasts your losses like a stand-up comic.
            </Typography>
            
            <Typography 
              variant="body1" 
              color="text.primary"
              sx={{ 
                fontSize: { xs: '1rem', md: '1.125rem' },
                lineHeight: 1.7,
                fontWeight: 500
              }}
            >
              Tabsy Wins turns casual pull tab play into strategic solo missions. Log your sessions, scan the flare, predict box quality, and get real-time sass from the only app that&apos;s rooting for you… kind of.
            </Typography>
          </Paper>
        </Container>
      </Box>

      {/* What Tabsy Can Do Section */}
      <Box sx={{
        py: { xs: 2 },
        bgcolor: 'background.default',
        width: '100%',
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h4"
            align="center"
            fontWeight="bold"
            gutterBottom
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              mb: { xs: 4, md: 5 },
              color: theme.neon.colors.green,
              ...theme.neon.effects.textGlow(theme.neon.colors.green, 0.5),
            }}
          >
            Tabsy&apos;s Toolbox
          </Typography>
          
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {/* Private Play Logs & Stats */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper elevation={3} sx={{
                p: { xs: 3, md: 4 },
                height: '100%',
                border: `1.5px solid ${theme.neon.colors.cyan}`,
                background: 'rgba(18,20,24,0.92)',
                boxShadow: theme.neon.effects.boxGlow(theme.neon.colors.cyan, 0.13).boxShadow,
                borderRadius: 1,
              }}>
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  gutterBottom 
                  color="text.primary"
                  sx={{ mb: 2 }}
                >
                  � Private Play Logs & Stats
                </Typography>
                
                <Box sx={{ pl: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Log every glorious (or not-so-glorious) session: game name, location, spend, wins, losses, and your salty notes.
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Entries are private by default—because your pull tab secrets are yours alone.
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                    Visual dashboards to track your streaks, slumps, and spending habits (no judgment… okay, maybe a little).
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Pull Smart Tools */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper elevation={3} sx={{
                p: { xs: 3, md: 4 },
                height: '100%',
                border: `1.5px solid ${theme.neon.colors.pink}`,
                background: 'rgba(18,20,24,0.92)',
                boxShadow: theme.neon.effects.boxGlow(theme.neon.colors.pink, 0.13).boxShadow,
                borderRadius: 1,
              }}>
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  gutterBottom 
                  color="text.primary"
                  sx={{ mb: 2 }}
                >
                  🎯 Pull Smart Tools
                </Typography>
                
                <Box sx={{ pl: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    <strong>Budget Tracker:</strong> Set limits before your wallet stages a protest.
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    <strong>Mindful Play Nudges:</strong> Gentle reminders to take a breather—or a walk of shame.
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                    <strong>Tabsy&apos;s Alerts:</strong> &quot;You spent how much? Bold move, champ.&quot;
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Tabsy's AI Popups */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper elevation={3} sx={{
                p: { xs: 3, md: 4 },
                height: '100%',
                border: `1.5px solid ${theme.neon.colors.green}`,
                background: 'rgba(18,20,24,0.92)',
                boxShadow: theme.neon.effects.boxGlow(theme.neon.colors.green, 0.13).boxShadow,
                borderRadius: 1,
              }}>
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  gutterBottom 
                  color="text.primary"
                  sx={{ mb: 2 }}
                >
                  🎭 Tabsy&apos;s AI Popups
                </Typography>
                
                <Box sx={{ pl: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Real-time reactions from your magical, mildly condescending companion.
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Win big? Tabsy throws confetti (and shade).
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Lose again? Prepare for a roast. He&apos;s got jokes.
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                    Choose your sass level: <em>Light Tease</em>, <em>Full Roast</em>, or <em>Please Be Nice, Tabsy</em>.
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Game Discovery (Solo Style) */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper elevation={3} sx={{
                p: { xs: 3, md: 4 },
                height: '100%',
                border: `1.5px solid ${theme.neon.colors.amber}`,
                background: 'rgba(18,20,24,0.92)',
                boxShadow: theme.neon.effects.boxGlow(theme.neon.colors.amber, 0.13).boxShadow,
                borderRadius: 1,
              }}>
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  gutterBottom 
                  color="text.primary"
                  sx={{ mb: 2 }}
                >
                  � Game Discovery (Solo Style)
                </Typography>
                
                <Box sx={{ pl: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Find trending boxes near you—no need to ask the bartender or eavesdrop.
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Save your favorite games and venues like a true pull tab connoisseur.
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                    Tabsy&apos;s take on your odds: &quot;This box? 69% chance. But hey, you&apos;ve beaten worse.&quot;
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Personal Insights */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={3} sx={{
                p: { xs: 3, md: 4 },
                border: `1.5px solid ${theme.neon.colors.purple}`,
                background: 'rgba(18,20,24,0.92)',
                boxShadow: theme.neon.effects.boxGlow(theme.neon.colors.purple, 0.13).boxShadow,
                borderRadius: 1,
              }}>
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  gutterBottom 
                  color="text.primary"
                  sx={{ mb: 2 }}
                >
                  � Personal Insights
                </Typography>
                
                <Box sx={{ pl: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Your win/loss ratios, average spend, and streaks—served with a side of snark.
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Compare your current vibe to your past performance. Spoiler: Tabsy remembers everything.
                  </Typography>
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                    No group stats. No leaderboards. Just you vs. the odds (and Tabsy&apos;s commentary).
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Final Call to Action Section */}
      <Box
        sx={{
          bgcolor: 'transparent',
          py: { xs: 4, md: 6 },
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
              mb: 3,
              color: theme.neon.colors.cyan,
              ...theme.neon.effects.textGlow(theme.neon.colors.cyan, 0.7),
            }}
          >
            Ready to Play Smarter?
          </Typography>
          <Typography 
            variant="h6" 
            maxWidth={600} 
            mx="auto" 
            mb={4}
            sx={{
              fontSize: { xs: '1rem', md: '1.25rem' },
              lineHeight: 1.6
            }}
          >
            Get Tabsy in your corner—where magic meets sarcasm, and every pull is a learning experience.
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/signup"
            size="large"
            sx={{
              background: `linear-gradient(90deg, ${theme.neon.colors.cyan}, ${theme.neon.colors.pink})`,
              color: theme.neon.colors.text.dark,
              fontWeight: 800,
              fontSize: '1.1rem',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              boxShadow: theme.neon.effects.boxGlow(theme.neon.colors.cyan, 0.25).boxShadow,
              textTransform: 'none',
              letterSpacing: '.01em',
              '&:hover': {
                background: `linear-gradient(90deg, ${theme.neon.colors.pink}, ${theme.neon.colors.cyan})`,
                color: theme.neon.colors.text.primary,
                ...theme.neon.effects.textGlow(theme.neon.colors.cyan, 0.7),
              },
            }}
          >
            Join Now
          </Button>
          
          {/* Return to Home Button */}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="text"
              href="/"
              size="small"
              sx={{
                color: isDarkMode ? 'text.secondary' : 'rgba(255,255,255,0.7)',
                fontSize: '0.875rem',
                textTransform: 'none',
                '&:hover': {
                  color: isDarkMode ? 'text.primary' : 'white',
                  backgroundColor: 'transparent',
                },
              }}
            >
              ← Return to Home
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Features;
