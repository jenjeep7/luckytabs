import React from 'react';
import { Box, Button, Typography, Paper, Divider } from '@mui/material';
import { 
  trackCtaClick, 
  trackFeatureUse, 
  trackOnboardingStep,
  trackBoxStarted,
  trackUiError,
  trackApiCall
} from '../utils/analytics';

/**
 * Example component demonstrating enhanced analytics usage
 * This shows how to track various user interactions and events
 */
const AnalyticsDemo: React.FC = () => {
  
  const handleCtaClick = (ctaId: string, location: string) => {
    trackCtaClick(ctaId, location, 'default');
  };

  const handleFeatureAccess = (feature: string, hasAccess: boolean) => {
    trackFeatureUse(feature, hasAccess ? 'allowed' : 'blocked', hasAccess ? '' : 'upgrade_required');
  };

  const handleOnboardingStep = (step: number) => {
    trackOnboardingStep(step, `step_${step}_demo`);
  };

  const handleApiTest = async () => {
    const start = performance.now();
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const duration = performance.now() - start;
      trackApiCall('demo_api', 200, duration);
    } catch (error) {
      const duration = performance.now() - start;
      trackApiCall('demo_api', 500, duration);
      trackUiError('api_demo', 'simulation_error', false);
    }
  };

  const handleBoxCreation = () => {
    trackBoxStarted('wall');
  };

  return (
    <Paper elevation={2} sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        🔥 Enhanced Analytics Demo
      </Typography>
      
      <Typography variant="body2" color="text.secondary" paragraph>
        This demonstrates the new analytics tracking capabilities. 
        Check your Firebase Analytics dashboard to see these events in real-time!
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        
        <Box>
          <Typography variant="h6" gutterBottom>CTA Tracking</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              onClick={() => handleCtaClick('upgrade_banner', 'header')}
            >
              Track Upgrade CTA
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => handleCtaClick('learn_more', 'features_section')}
            >
              Track Learn More
            </Button>
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Feature Gating</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              color="success"
              onClick={() => handleFeatureAccess('advanced_analytics', true)}
            >
              Allow Feature Use
            </Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={() => handleFeatureAccess('export_data', false)}
            >
              Block Feature Use
            </Button>
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Onboarding Steps</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {[1, 2, 3, 4].map(step => (
              <Button 
                key={step}
                variant="outlined"
                size="small"
                onClick={() => handleOnboardingStep(step)}
              >
                Step {step}
              </Button>
            ))}
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Box Operations</Typography>
          <Button 
            variant="contained" 
            onClick={handleBoxCreation}
          >
            Start Creating Box
          </Button>
        </Box>

        <Box>
          <Typography variant="h6" gutterBottom>Performance & Errors</Typography>
          <Button 
            variant="contained" 
            onClick={() => void handleApiTest()}
          >
            Test API Performance
          </Button>
        </Box>

      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="body2" color="text.secondary">
        <strong>What&apos;s being tracked:</strong>
        <br />• Page views with engagement time
        <br />• User attribution (UTM parameters)
        <br />• Feature usage and access control
        <br />• Performance metrics and errors
        <br />• Conversion funnel events
        <br />• Scroll depth and user behavior
      </Typography>
    </Paper>
  );
};

export default AnalyticsDemo;