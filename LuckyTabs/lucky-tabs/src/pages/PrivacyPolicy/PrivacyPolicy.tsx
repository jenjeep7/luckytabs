import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  useTheme,
  useMediaQuery,
  Link,
  List,
  ListItem,
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

// Policy dates - update these when policy changes
const EFFECTIVE_DATE = '2025-09-25';
const LAST_UPDATED = '2025-09-25';

export default function PrivacyPolicy() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleHomeClick = () => {
    void navigate('/home');
  };

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        py: { xs: 2, md: 4 },
        px: { xs: 2, md: 3 },
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Home Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <Button
          onClick={handleHomeClick}
          variant="outlined"
          startIcon={<HomeIcon />}
          sx={{
            borderColor: '#7DF9FF',
            color: '#7DF9FF',
            '&:hover': {
              borderColor: '#00E676',
              color: '#00E676',
              backgroundColor: 'rgba(125, 249, 255, 0.1)',
            },
            fontWeight: 600,
            px: 3,
            py: 1,
          }}
        >
          Home
        </Button>
      </Box>

      {/* Main Content */}
      <Paper
        elevation={6}
        sx={{
          p: { xs: 2, md: 4 },
          backgroundColor: '#181b22',
          border: '1.5px solid #7DF9FF',
          borderRadius: '14px',
          boxShadow: '0 0 24px 0 rgba(125,249,255,0.10)',
          color: '#EAF6FF',
          flex: 1,
        }}
      >
        {/* Print CSS for accessibility and printability */}
        <style>{`
          @media print {
            a { color: #000 !important; text-decoration: underline; }
            button, nav { display: none !important; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .MuiPaper-root { 
              background-color: white !important;
              color: black !important;
              border: 1px solid #ccc !important;
              box-shadow: none !important;
            }
            h1, h2, h3, h4, h5, h6 { 
              color: #333 !important;
              break-after: avoid;
            }
            p, li { orphans: 3; widows: 3; }
          }
        `}</style>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          component="h1"
          gutterBottom
          sx={{
            textAlign: 'center',
            color: '#7DF9FF',
            fontWeight: 900,
            letterSpacing: '0.01em',
            mb: 2,
            fontSize: { xs: '1.75rem', md: '2.5rem' }
          }}
        >
          🔐 Tabsy Wins Privacy Policy
        </Typography>

        <Typography 
          variant="body2" 
          component="p" 
          sx={{ 
            textAlign: 'center', 
            color: '#00E676', 
            fontWeight: 600,
            mb: 4
          }}
        >
          Effective Date: {EFFECTIVE_DATE} | Last Updated: {LAST_UPDATED}
        </Typography>

        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          Welcome to Tabsy Wins! We&apos;re all about smarter play, community connection, and magical experiences—but we take your privacy just as seriously as your streaks. This Privacy Policy explains how we collect, use, and protect your information when you use our app and website.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#7DF9FF', fontWeight: 700, mt: 4, mb: 2 }}>
          🏢 Who We Are
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 1 }}>
          <strong>Data Controller:</strong> Unnecessarily Complicated Ventures, LLC (Minnesota, USA)
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 1 }}>
          <strong>Address:</strong> 1745 White Oak Drive, Chaska, MN 55318, USA
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          <strong>Contact:</strong> <Link href="mailto:tabsywins@gmail.com" sx={{ color: '#00E676' }}>tabsywins@gmail.com</Link>
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#7DF9FF', fontWeight: 700, mt: 4, mb: 2 }}>
          🧙‍♂️ What We Collect
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          We collect two types of data to help Tabsy work his magic:
        </Typography>

        <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#00E676', fontWeight: 600, mt: 3, mb: 1 }}>
          1. Personal Information
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          Only what you choose to share, such as:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Username or nickname
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Email address (for account setup, support, or tier upgrades)
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Profile photo or avatar (optional)
          </Typography>
        </Box>

        <Typography variant="h6" component="h3" gutterBottom sx={{ color: '#00E676', fontWeight: 600, mt: 3, mb: 1 }}>
          2. Gameplay & Usage Data
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          To improve predictions and community features:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Session logs (game type, location, wins/losses)
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Flare scans and uploaded images
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Streak tracking and budget tools
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Device type and app usage patterns
          </Typography>
        </Box>

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#7DF9FF', fontWeight: 700, mt: 4, mb: 2 }}>
          🔍 How We Use Your Data
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          Tabsy uses your data to:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Provide smarter predictions and personalized insights
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Track your play history and streaks
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Power community features like leaderboards and Flare sharing
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Improve app performance and user experience
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Send occasional updates or feature drops (if you opt in)
          </Typography>
        </Box>

        <Typography 
          variant="body1" 
          component="p"
          sx={{ 
            fontSize: { xs: '1rem', md: '1.1rem' }, 
            lineHeight: 1.7,
            fontWeight: 600,
            color: '#00E676',
            mb: 2
          }}
        >
          We do not sell your data. Ever.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#7DF9FF', fontWeight: 700, mt: 4, mb: 2 }}>
          🤝 Third-Party Services
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          We may use trusted third-party tools for:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Analytics (to improve the app)
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Image processing (for Flare scans)
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Payment processing (for tier upgrades)
          </Typography>
        </Box>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          These services follow strict data protection standards. We never share more than necessary.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#7DF9FF', fontWeight: 700, mt: 4, mb: 2 }}>
          🔧 Service Providers (SDKs)
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          We use the following specific service providers:
        </Typography>
        <List sx={{ pl: 2, mb: 2 }}>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1 }}>
            <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>
              <strong>Firebase Authentication</strong> – secure user sign-in and account management.
              Privacy: <Link href="https://firebase.google.com/support/privacy" target="_blank" sx={{ color: '#00E676' }}>https://firebase.google.com/support/privacy</Link>
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1 }}>
            <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>
              <strong>Cloud Firestore</strong> – database for user data and game logs.
              Privacy: <Link href="https://firebase.google.com/support/privacy" target="_blank" sx={{ color: '#00E676' }}>https://firebase.google.com/support/privacy</Link>
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1 }}>
            <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>
              <strong>Firebase Cloud Storage</strong> – image and file uploads.
              Privacy: <Link href="https://firebase.google.com/support/privacy" target="_blank" sx={{ color: '#00E676' }}>https://firebase.google.com/support/privacy</Link>
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1 }}>
            <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>
              <strong>Firebase Cloud Functions</strong> – server-side processing and data management.
              Privacy: <Link href="https://firebase.google.com/support/privacy" target="_blank" sx={{ color: '#00E676' }}>https://firebase.google.com/support/privacy</Link>
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1 }}>
            <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>
              <strong>Google Analytics for Firebase</strong> – usage analytics and app performance monitoring (web version only).
              Privacy: <Link href="https://policies.google.com/privacy" target="_blank" sx={{ color: '#00E676' }}>https://policies.google.com/privacy</Link>
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1 }}>
            <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>
              <strong>Capacitor (Ionic)</strong> – native mobile app functionality and device access.
              Privacy: <Link href="https://ionic.io/privacy" target="_blank" sx={{ color: '#00E676' }}>https://ionic.io/privacy</Link>
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1 }}>
            <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>
              <strong>Google Maps Platform</strong> – location services and mapping functionality.
              Privacy: <Link href="https://policies.google.com/privacy" target="_blank" sx={{ color: '#00E676' }}>https://policies.google.com/privacy</Link>
            </Typography>
          </ListItem>
        </List>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          We share the minimum data necessary to operate these services under contracts that restrict their use of your information.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#7DF9FF', fontWeight: 700, mt: 4, mb: 2 }}>
          🔐 Data Security
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          We protect your data with:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Encryption in transit and at rest
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Secure Firebase infrastructure and access controls
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Regular security monitoring and updates
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Limited access on a need-to-know basis
          </Typography>
        </Box>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee absolute security.
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          If there&apos;s ever a breach, we&apos;ll notify affected users promptly and take immediate action.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#7DF9FF', fontWeight: 700, mt: 4, mb: 2 }}>
          👤 Your Privacy Rights
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          You have the right to:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Access your personal data we hold about you
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Request correction of inaccurate personal data
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Request deletion of your personal data
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Object to processing of your personal data
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Export your data in a portable format
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Withdraw consent at any time
          </Typography>
        </Box>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          To exercise these rights, contact us using the information below.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#7DF9FF', fontWeight: 700, mt: 4, mb: 2 }}>
          📱 App-Specific Data Collection
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          Our mobile app may request access to:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            <strong>Camera:</strong> To scan flare sheets and capture game photos (optional)
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            <strong>Photo Library:</strong> To select and upload images (optional)
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            <strong>Push Notifications:</strong> To send game updates and reminders (optional)
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            <strong>Location Services:</strong> To find nearby gaming locations (optional)
          </Typography>
        </Box>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          All permissions are optional and can be disabled in your device settings.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#7DF9FF', fontWeight: 700, mt: 4, mb: 2 }}>
          🕐 Data Retention
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          We retain your data according to these specific timeframes:
        </Typography>
        <List sx={{ pl: 2, mb: 2 }}>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1 }}>
            <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>
              <strong>Account/profile data:</strong> Kept while your account is active; deleted within 30 days after you delete your account
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1 }}>
            <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>
              <strong>Analytics data:</strong> Up to 2 months (Firebase Analytics default) unless you opt-out or we extend retention
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1 }}>
            <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>
              <strong>Server logs & security events:</strong> Up to 90 days for security and troubleshooting
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1 }}>
            <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>
              <strong>Database backups:</strong> Up to 30 days, then automatically purged on a rolling basis
            </Typography>
          </ListItem>
          <ListItem sx={{ display: 'list-item', listStyleType: 'disc', pl: 1 }}>
            <Typography variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7 }}>
              <strong>Legal compliance:</strong> As required by applicable laws and regulations
            </Typography>
          </ListItem>
        </List>

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#7DF9FF', fontWeight: 700, mt: 4, mb: 2 }}>
          👶 Children&apos;s Privacy
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          Tabsy Wins is intended for users 18 years and older. We do not knowingly collect personal information from:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Children under 13 in the United States (COPPA compliance)
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Children under 16 in the European Economic Area without parental consent (GDPR compliance)
          </Typography>
        </Box>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          If we become aware that we have collected personal information from a child under these age limits, we will take steps to delete such information promptly. Parents or guardians who believe we may have collected information from their child should contact us immediately.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#7DF9FF', fontWeight: 700, mt: 4, mb: 2 }}>
          🇪🇺 EEA/UK Legal Bases & Rights (GDPR)
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          If you are in the European Economic Area (EEA) or UK, we process your personal data based on these legal bases:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            <strong>Performance of a contract:</strong> To provide the app and its features
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            <strong>Legitimate interests:</strong> Analytics, security, fraud prevention, and app improvement
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            <strong>Consent:</strong> Push notifications, camera/photo access, precise location, and marketing communications
          </Typography>
        </Box>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          Under GDPR, you have the right to request access, correction, deletion, restriction, portability, or object to processing of your personal data. You can also withdraw consent at any time and lodge a complaint with your local supervisory authority. EEA/UK users may lodge a complaint with their local supervisory authority.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#7DF9FF', fontWeight: 700, mt: 4, mb: 2 }}>
          🇺🇸 California Privacy (CCPA/CPRA)
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          We do not &quot;sell&quot; or &quot;share&quot; personal information as defined by the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA). We do not process personal information for targeted advertising or cross-context behavioral advertising.
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          California residents can request access, deletion, or correction of their personal information by emailing <Link href="mailto:tabsywins@gmail.com" sx={{ color: '#00E676' }}>tabsywins@gmail.com</Link>. We will respond to verifiable consumer requests within 45 days. We do not currently support Global Privacy Control (GPC) signals but may implement this in the future.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#7DF9FF', fontWeight: 700, mt: 4, mb: 2 }}>
          🌍 International Data Transfers
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          Your data may be transferred to and processed in countries other than your own. When transferring personal data outside your region, we rely on appropriate safeguards such as Standard Contractual Clauses to ensure adequate protection in accordance with applicable privacy laws.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#7DF9FF', fontWeight: 700, mt: 4, mb: 2 }}>
          🗑️ Delete Your Account
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          You can delete your account and associated personal data at any time:
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 1 }}>
          <strong>In the app:</strong> Profile → Settings → Account → Delete Account
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          <strong>Cannot access the app?</strong> Email <Link href="mailto:tabsywins@gmail.com" sx={{ color: '#00E676' }}>tabsywins@gmail.com</Link> with your account details.
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          Account deletion immediately schedules the removal of your personal data from our systems, completed within 7 days except where legally required to retain certain information.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#7DF9FF', fontWeight: 700, mt: 4, mb: 2 }}>
          🍪 Cookies & Similar Technologies
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          Our website and mobile app may use cookies, local storage, and similar technologies for:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Authentication and user preferences
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Analytics and performance monitoring
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            App functionality and user experience
          </Typography>
        </Box>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          You can control cookies in your browser settings. For Google Analytics opt-out: <Link href="https://tools.google.com/dlpage/gaoptout" target="_blank" sx={{ color: '#00E676' }}>Google Analytics Opt-out</Link>
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#7DF9FF', fontWeight: 700, mt: 4, mb: 2 }}>
          🔄 Policy Updates
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          We may update this Privacy Policy from time to time. For material changes, we will notify you by:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            In-app notification or prominent notice
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Email notification to your registered email address
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            Updating the &quot;Last Updated&quot; date at the top of this page
          </Typography>
        </Box>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          Your continued use of Tabsy Wins after any changes indicates your acceptance of the updated policy.
        </Typography>

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#7DF9FF', fontWeight: 700, mt: 4, mb: 2 }}>
          📧 Contact Us
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          If you have any questions about this Privacy Policy or our data practices, please contact us:
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 2 }}>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            <strong>Email:</strong> tabsywins@gmail.com
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            <strong>App:</strong> Use the Feedback feature in the app
          </Typography>
          <Typography component="li" variant="body1" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 0.5 }}>
            <strong>Response Time:</strong> We will respond within 30 days
          </Typography>
        </Box>

        <Typography variant="h5" component="h2" gutterBottom sx={{ color: '#7DF9FF', fontWeight: 700, mt: 4, mb: 2 }}>
          🧙‍♂️ Final Word from Tabsy
        </Typography>
        <Typography variant="body1" component="p" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.7, mb: 2 }}>
          Tabsy&apos;s mission is to make pull tab play smarter, safer, and more fun. That starts with trust. We&apos;ll always be transparent, respectful, and ready to listen.
        </Typography>

        {/* Bottom Home Button for mobile users */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            onClick={handleHomeClick}
            variant="contained"
            startIcon={<HomeIcon />}
            sx={{
              background: 'linear-gradient(45deg, #7DF9FF 0%, #00E676 100%)',
              color: '#000',
              fontWeight: 600,
              px: 4,
              py: 1.5,
              '&:hover': {
                background: 'linear-gradient(45deg, #00E676 0%, #7DF9FF 100%)',
              },
            }}
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
