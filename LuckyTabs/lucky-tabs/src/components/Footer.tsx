import { Typography, IconButton, Button } from "@mui/material"
import { Box } from "@mui/system"
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';

export const Footer = () => {

  return <>  {/* Footer Section */}
      <Box id="contact" sx={{ bgcolor: 'grey.900', color: 'grey.300', py: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="white" gutterBottom>
          {`Tabsy's Community`}
        </Typography>

        {/* Social Media Icons */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, my: 2 }}>
          <IconButton
            href="https://facebook.com/tabsyscommunity"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'grey.300', '&:hover': { color: '#1877F2' }, p: 1 }}
          >
            <FacebookIcon />
          </IconButton>
          <IconButton
            href="https://www.instagram.com/tabsy_wins/"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'grey.300', '&:hover': { color: '#E4405F' }, p: 1 }}
          >
            <InstagramIcon />
          </IconButton>
          <IconButton
            href="https://twitter.com/tabsyscommunity"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'grey.300', '&:hover': { color: '#1DA1F2' }, p: 1 }}
          >
            <TwitterIcon />
          </IconButton>
          <IconButton
            href="https://www.youtube.com/@TabsyWins"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ color: 'grey.300', '&:hover': { color: '#FF0000' }, p: 1 }}
          >
            <YouTubeIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="caption">
            {`© 2025 Tabsy's Community. All rights reserved. For entertainment purposes only. Please play responsibly.`}
          </Typography>
          <Button 
            href="#privacy-policy" 
            sx={{ 
              color: 'grey.300', 
              textTransform: 'none',
              fontSize: 'inherit',
              p: 0,
              minWidth: 'auto',
              '&:hover': { color: '#ffffff' }
            }}
          >
            Privacy Policy
          </Button>
        </Box>
      </Box></>
}