
import { Typography, IconButton, Button, useTheme } from "@mui/material"
import { Box } from "@mui/system"
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { getVersionInfo } from '../utils/version';

// TikTok SVG Icon
const TikTokIcon = (props: any) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M12.5 2h2.25c.14 2.02 1.67 3.54 3.75 3.7V8.1c-.97-.02-1.9-.19-2.75-.52v7.67c0 3.13-2.19 5.6-5.13 5.75-3.09.16-5.62-2.36-5.62-5.44 0-3.09 2.53-5.6 5.62-5.44.13 0 .25.01.38.02v2.27c-.13-.02-.25-.03-.38-.03-1.8-.09-3.25 1.29-3.25 3.18 0 1.89 1.45 3.27 3.25 3.18 1.77-.09 3.13-1.56 3.13-3.36V2z" fill="#000"/>
    <path d="M12.5 2h2.25c.14 2.02 1.67 3.54 3.75 3.7V8.1c-.97-.02-1.9-.19-2.75-.52v7.67c0 3.13-2.19 5.6-5.13 5.75-3.09.16-5.62-2.36-5.62-5.44 0-3.09 2.53-5.6 5.62-5.44.13 0 .25.01.38.02v2.27c-.13-.02-.25-.03-.38-.03-1.8-.09-3.25 1.29-3.25 3.18 0 1.89 1.45 3.27 3.25 3.18 1.77-.09 3.13-1.56 3.13-3.36V2z" fill="#25F4EE" fillOpacity=".7"/>
    <path d="M14.75 2h-2.25v15.19c0 1.8-1.36 3.27-3.13 3.36-1.8.09-3.25-1.29-3.25-3.18 0-1.89 1.45-3.27 3.25-3.18.13 0 .25.01.38.03v-2.27c-.13-.01-.25-.02-.38-.02-3.09-.16-5.62 2.35-5.62 5.44 0 3.08 2.53 5.6 5.62 5.44 2.94-.15 5.13-2.62 5.13-5.75V7.58c.85.33 1.78.5 2.75.52V5.7c-2.08-.16-3.61-1.68-3.75-3.7z" fill="#FE2C55" fillOpacity=".7"/>
  </svg>
);

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
            href="https://www.facebook.com/profile.php?id=61580827040302"
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
            href="https://x.com/TabsyWins"
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
          <IconButton
            href="https://www.tiktok.com/@tabsywins?lang=en"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              ...theme.neon.effects.socialIcon(),
              ...theme.neon.effects.socialIconHover('#000000')
            }}
          >
            <TikTokIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 2 }}>
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

        {/* App Version */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.neon.colors.text.secondary,
              fontSize: { xs: '0.875rem', sm: '0.75rem' },
              fontWeight: 500,
              textAlign: 'center',
              minHeight: '20px',
              lineHeight: 1.4
            }}
          >
            V {getVersionInfo().version}
          </Typography>
        </Box>
      </Box></>
}