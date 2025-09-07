import { Typography, IconButton, Button, useTheme } from "@mui/material"
import { Box } from "@mui/system"
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';

export const Footer = () => {
  const theme = useTheme();

  return <>  {/* Footer Section */}
      <Box 
        id="contact" 
        sx={{ 
          position: 'relative',
          py: 3, 
          textAlign: 'center',
          ...theme.neon.effects.gamingBackground(),
          color: theme.neon.colors.text.primary,
          borderTop: '1px solid rgba(125, 249, 255, 0.2)',
          backdropFilter: 'blur(8px)',
          ...theme.neon.effects.neonDivider()
        }}
      >
        <Typography 
          variant="h6" 
          sx={{
            color: theme.neon.colors.cyan,
            fontWeight: 700,
            ...theme.neon.effects.textGlow(theme.neon.colors.cyan),
            mb: 3
          }}
        >
          {`Tabsy's Community`}
        </Typography>

        {/* Social Media Icons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 2 }}>
          <IconButton
            href="https://facebook.com/tabsyscommunity"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              ...theme.neon.effects.socialIcon(),
              ...theme.neon.effects.socialIconHover('#1877F2')
            }}
          >
            <FacebookIcon />
          </IconButton>
          <IconButton
            href="https://www.instagram.com/tabsy_wins/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              ...theme.neon.effects.socialIcon(),
              ...theme.neon.effects.socialIconHover('#E4405F')
            }}
          >
            <InstagramIcon />
          </IconButton>
          <IconButton
            href="https://twitter.com/tabsyscommunity"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              ...theme.neon.effects.socialIcon(),
              ...theme.neon.effects.socialIconHover('#1DA1F2')
            }}
          >
            <TwitterIcon />
          </IconButton>
          <IconButton
            href="https://www.youtube.com/@TabsyWins"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              ...theme.neon.effects.socialIcon(),
              ...theme.neon.effects.socialIconHover('#FF0000')
            }}
          >
            <YouTubeIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography 
            variant="caption"
            sx={{
              color: theme.neon.colors.text.secondary,
              fontSize: '0.8rem'
            }}
          >
            {`© 2025 Tabsy's Community. All rights reserved. For entertainment purposes only. Please play responsibly.`}
          </Typography>
          <Button 
            href="#privacy-policy" 
            sx={{ 
              color: theme.neon.colors.text.secondary, 
              textTransform: 'none',
              fontSize: 'inherit',
              p: 0,
              minWidth: 'auto',
              borderRadius: 1,
              transition: 'all 0.3s ease',
              '&:hover': { 
                color: theme.neon.colors.cyan,
                ...theme.neon.effects.textGlow(theme.neon.colors.cyan, 0.6)
              }
            }}
          >
            Privacy Policy
          </Button>
        </Box>
      </Box></>
}