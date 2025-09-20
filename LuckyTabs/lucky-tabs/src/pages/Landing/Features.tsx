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
            mb={4}
            sx={{
              fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
              px: { xs: 1, sm: 2 },
              lineHeight: { xs: 1.5, md: 1.6 },
              color: theme.neon.colors.text.secondary,
              ...theme.neon.effects.textGlow(theme.neon.colors.pink, 0.3),
            }}
          >
            The smarter way to play, track, and win—powered by magic, data, and community.
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
              Imagine walking into your favorite restaurant, bar, VFW, American Legion or the like. The box looks untouched. You&apos;ve got a few bucks and a gut feeling. But what if you had more than just instinct?
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
              Tabsy turns casual play into strategic play. It&apos;s the only app built for pull tab players to log sessions, scan flair, predict box quality, and share wins with a vibrant community. Tabsy doesn&apos;t just track—he reacts, celebrates, and guides.
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
            What Tabsy Can Do?
          </Typography>
          
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {/* Pull Tab Map & Venue Explorer */}
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
                  🗺️ Pull Tab Map & Venue Explorer
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    lineHeight: 1.6,
                    mb: 3
                  }}
                >
                  Tabsy&apos;s integrated map helps you search and create nearby pull tab locations, explore what each venue offers, and see who&apos;s running the games behind the scenes. Whether you&apos;re chasing a new box or supporting a local nonprofit, Tabsy makes it easy to play with purpose.
                </Typography>
                
                <Typography 
                  variant="subtitle1" 
                  fontWeight="bold" 
                  color="text.primary"
                  sx={{ mb: 2 }}
                >
                  What you&apos;ll see on the map:
                </Typography>
                
                <Box sx={{ pl: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    📍 Nearby pull tab venues with hours and contact info
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    🎰 Gambling options offered (pull tabs, electronic games, bingo, raffles, etc.)
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    🏛️ Nonprofit operators behind each game—so you know who benefits
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    🧭 Community ratings and Flare freshness reports
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.5 }}>
                    📸 User-submitted photos of boxes, Flare, and venue vibes
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body1" 
                  color="text.primary"
                  sx={{ fontWeight: 500, fontStyle: 'italic' }}
                >
                  Tabsy&apos;s goal? Transparency, trust, and smarter play—right down to the location.
                </Typography>
              </Paper>
            </Grid>

            {/* Budgeting & Mindful Play */}
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
                  💸 Budgeting & Mindful Play
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    lineHeight: 1.6,
                    mb: 3
                  }}
                >
                  Tabsy helps you play smarter—not just harder.
                </Typography>
                
                <Box sx={{ pl: 1, mb: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Set personal budget limits and get gentle nudges when you&apos;re nearing them
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Track spending trends over time to spot patterns
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Get recovery tips when streaks dip or spending spikes
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body1" 
                  color="text.primary"
                  sx={{ fontWeight: 500, fontStyle: 'italic' }}
                >
                  Tabsy&apos;s goal: keep the fun alive without the regret
                </Typography>
              </Paper>
            </Grid>

            {/* Smart Predictions */}
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
                  🧠 Smart Predictions
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    lineHeight: 1.6,
                    mb: 3
                  }}
                >
                  Tabsy uses real data, timing patterns, and community wisdom to help you decide:
                </Typography>
                
                <Box sx={{ pl: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Should you jump in, wait, or skip?
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Is this box heating up or cooling off?
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    What&apos;s your streak telling you?
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Box Tracking & Insights */}
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
                  📊 Box Tracking & Insights
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    lineHeight: 1.6,
                    mb: 3
                  }}
                >
                  Turn data into decisions.
                </Typography>
                
                <Box sx={{ pl: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Log your play history by location, game, and outcome
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Upload Flare photos and shuffled ticket images for analysis
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Track wins, losses, budget, and box quality over time
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            {/* Community Magic */}
            <Grid size={{ xs: 12 }}>
              <Paper elevation={3} sx={{
                p: { xs: 3, md: 4 },
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
                  👥 Community Magic
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    lineHeight: 1.6,
                    mb: 3
                  }}
                >
                  Pull tabs are better together.
                </Typography>
                
                <Box sx={{ pl: 1 }}>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Share your finds, swap strategies, and celebrate wins
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Join private groups or public feeds
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Record rip videos and tag #tabsywins to spotlight your favorite venues
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
                    Learn from tutorials and tips shared by the crew
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
            Ready to Join Tabsy&apos;s Community?
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
            Connect with fellow enthusiasts, share insights, and elevate your pull tab experience today.
          </Typography>
          <Button
            variant="contained"
            href="/signup"
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
