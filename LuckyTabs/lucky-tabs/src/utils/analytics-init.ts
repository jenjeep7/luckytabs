import { initializeAnalyticsWithVersion } from './analytics';
import { captureAttributionOnLoad } from './analytics-attribution';
import { initWebVitals } from './analytics-webvitals';

/**
 * Initialize all analytics features when the app starts
 * Call this once in your App.tsx or index.tsx
 */
export async function initializeCompleteAnalytics() {
  try {
    console.log('🚀 Initializing comprehensive analytics...');
    
    // 1. Capture attribution data from URL parameters
    captureAttributionOnLoad();
    
    // 2. Initialize Firebase Analytics with defaults
    await initializeAnalyticsWithVersion();
    
    // 3. Start performance monitoring
    initWebVitals();
    
    console.log('✅ All analytics features initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize analytics:', error);
  }
}

/**
 * Get the current environment based on hostname
 */
export function getAnalyticsEnvironment(): 'prod' | 'staging' | 'dev' {
  const hostname = window.location.hostname;
  
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return 'dev';
  } else if (hostname.includes('staging') || hostname.includes('beta')) {
    return 'staging';
  } else {
    return 'prod';
  }
}