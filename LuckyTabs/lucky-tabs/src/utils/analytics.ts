import { logEvent, setUserProperties, isSupported, setUserId } from 'firebase/analytics';
import { analytics } from '../firebase';
import { APP_VERSION } from './version';
import { getLastTouchAttribution } from './analytics-attribution';

// Get app version from package.json
const packageVersion = process.env.REACT_APP_VERSION || '1.1.0';

// Helper function to add version info to all events
const addVersionInfo = (params: Record<string, string | number | boolean> = {}) => {
  return {
    ...params,
    app_version: APP_VERSION,
    package_version: packageVersion,
    build_timestamp: process.env.REACT_APP_BUILD_DATE || new Date().toISOString(),
    platform: 'web'
  };
};

export function initAnalyticsDefaults(env: 'prod' | 'staging' | 'dev' = 'prod') {
  if (!analytics) return;

  // Set default parameters that will be included with every event
  const attribution = getLastTouchAttribution();
  
  // Note: setDefaultEventParameters may not be available in all Firebase versions
  // Using manual parameter addition instead
  console.log('Setting analytics defaults:', {
    app_version: APP_VERSION,
    package_version: packageVersion,
    platform: 'web',
    env,
    device_type: getDeviceType(),
    ...attribution
  });

  setUserProperties(analytics, {
    device_type: getDeviceType(),
    app_version: APP_VERSION,
    platform: 'web'
  });

  console.log('✅ Analytics defaults initialized');
}

export const initializeAnalyticsWithVersion = async () => {
  try {
    // Wait for Firebase Analytics to be ready
    const supported = await isSupported();
    if (!supported) {
      console.log('Analytics not supported in this environment');
      return;
    }
    
    if (!analytics) {
      console.warn('Analytics not initialized');
      return;
    }
    
    // Initialize defaults
    initAnalyticsDefaults();
    
    console.log('🔧 Initializing analytics with enhanced tracking');
    
    // Log initialization event
    logEvent(analytics, 'app_open', {
      first_open_time: Date.now()
    });
    
    console.log('✅ Analytics initialized with enhanced tracking');
  } catch (error) {
    console.error('❌ Failed to initialize analytics:', error);
  }
};

// Initialize analytics with version tracking when the module loads
void initializeAnalyticsWithVersion();

// Custom event names for your lottery app
export const AnalyticsEvents = {
  // Box operations
  BOX_CREATED: 'box_created',
  BOX_EDITED: 'box_edited',
  BOX_REMOVED: 'box_removed',
  BOX_SHARED: 'box_shared',
  BOX_STARTED: 'box_started',
  BOX_CONFIGURED: 'box_configured',
  BOX_PUBLISHED: 'box_published',
  
  // Ticket operations
  TICKETS_ESTIMATED: 'tickets_estimated',
  PRIZE_CLAIMED: 'prize_claimed',
  PRIZE_UNCLAIMED: 'prize_unclaimed',
  
  // Analytics and features
  ADVANCED_ANALYTICS_VIEWED: 'advanced_analytics_viewed',
  FLARE_SHEET_UPLOADED: 'flare_sheet_uploaded',
  DATA_EXPORTED: 'data_exported',
  FEATURE_USE: 'feature_use',
  
  // Page tracking
  PAGE_VIEW: 'page_view',
  PAGE_ENGAGEMENT: 'page_engagement',
  HOME_PAGE_VISITED: 'home_page_visited',
  LANDING_PAGE_VISITED: 'landing_page_visited',
  SCROLL_DEPTH: 'scroll_depth',
  
  // User engagement
  LOGIN: 'login',
  SIGNUP: 'sign_up',
  PROFILE_UPDATED: 'profile_updated',
  
  // Onboarding & Funnel
  ONBOARDING_STARTED: 'onboarding_started',
  ONBOARDING_STEP: 'onboarding_step',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  EMAIL_VERIFICATION_SENT: 'email_verification_sent',
  EMAIL_VERIFIED: 'email_verified',
  
  // Subscription events
  SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  FREE_LIMIT_REACHED: 'free_limit_reached',
  PRO_FEATURE_ATTEMPTED_BY_FREE_USER: 'pro_feature_attempted_by_free_user',
  
  // Location operations
  LOCATION_CREATED: 'location_created',
  LOCATION_SELECTED: 'location_selected',
  
  // Conversion & Engagement
  CTA_CLICK: 'cta_click',
  INVITE_SENT: 'invite_sent',
  INVITE_ACCEPTED: 'invite_accepted',
  
  // Technical & Performance
  UI_ERROR: 'ui_error',
  API_CALL: 'api_call',
  WEB_VITAL: 'web_vital',
  
  // App Events
  APP_OPEN: 'app_open'
} as const;

// Helper function to get device type
const getDeviceType = (): string => {
  const userAgent = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
};

// Analytics tracking functions
export const trackBoxCreated = (boxData: {
  type: 'wall' | 'bar box';
  pricePerTicket: number;
  userPlan: string;
  startingTickets?: number;
}) => {
  if (analytics) {
    logEvent(analytics, AnalyticsEvents.BOX_CREATED, {
      box_type: boxData.type,
      price_per_ticket: boxData.pricePerTicket,
      user_plan: boxData.userPlan,
      starting_tickets: boxData.startingTickets || 0,
      timestamp: Date.now()
    });
  }
};

export const trackBoxEdited = (boxData: {
  boxId: string;
  boxType: 'wall' | 'bar box';
  changesMade: string[];
  userPlan: string;
}) => {
  if (analytics) {
    logEvent(analytics, AnalyticsEvents.BOX_EDITED, {
      box_id: boxData.boxId,
      box_type: boxData.boxType,
      changes_made: boxData.changesMade.join(','),
      user_plan: boxData.userPlan,
      device_type: getDeviceType()
    });
  }
};

export const trackBoxRemoved = (boxData: {
  boxId: string;
  boxType: 'wall' | 'bar box';
  userPlan: string;
}) => {
  if (analytics) {
    logEvent(analytics, AnalyticsEvents.BOX_REMOVED, {
      box_id: boxData.boxId,
      box_type: boxData.boxType,
      user_plan: boxData.userPlan,
      device_type: getDeviceType()
    });
  }
};

export const trackTicketsEstimated = (data: {
  boxId: string;
  boxType: 'wall' | 'bar box';
  estimatedTickets: number;
  userPlan: string;
  estimationMethod: 'manual' | 'row_by_row';
}) => {
  if (analytics) {
    logEvent(analytics, AnalyticsEvents.TICKETS_ESTIMATED, {
      box_id: data.boxId,
      box_type: data.boxType,
      estimated_tickets: data.estimatedTickets,
      user_plan: data.userPlan,
      estimation_method: data.estimationMethod,
      device_type: getDeviceType()
    });
  }
};

export const trackPrizeClaimed = (data: {
  boxId: string;
  boxType: 'wall' | 'bar box';
  prizeValue: number;
  userPlan: string;
  action: 'claimed' | 'unclaimed';
}) => {
  const eventName = data.action === 'claimed' ? AnalyticsEvents.PRIZE_CLAIMED : AnalyticsEvents.PRIZE_UNCLAIMED;
  if (analytics) {
    logEvent(analytics, eventName, {
      box_id: data.boxId,
      box_type: data.boxType,
      prize_value: data.prizeValue,
      user_plan: data.userPlan,
      device_type: getDeviceType()
    });
  }
};

export const trackAdvancedAnalyticsViewed = (data: {
  boxId: string;
  boxType: 'wall' | 'bar box';
  userPlan: string;
  accessGranted: boolean;
}) => {
  if (analytics) {
    logEvent(analytics, AnalyticsEvents.ADVANCED_ANALYTICS_VIEWED, {
      box_id: data.boxId,
      box_type: data.boxType,
      user_plan: data.userPlan,
      access_granted: data.accessGranted,
      feature_gate: data.accessGranted ? 'allowed' : 'restricted',
      device_type: getDeviceType()
    });
  }
};

export const trackProFeatureAttemptByFreeUser = (feature: string) => {
  if (analytics) {
    logEvent(analytics, AnalyticsEvents.PRO_FEATURE_ATTEMPTED_BY_FREE_USER, {
      feature_name: feature,
      device_type: getDeviceType(),
      conversion_opportunity: true
    });
  }
};

export const trackUserLogin = (method: string) => {
  if (analytics) {
    logEvent(analytics, AnalyticsEvents.LOGIN, {
      method: method
    });
  }
};

export const trackUserSignup = (method: string) => {
  if (analytics) {
    logEvent(analytics, AnalyticsEvents.SIGNUP, {
      method: method
    });
  }
};

export const trackFlareSheetUploaded = (data: {
  boxId: string;
  boxType: 'wall' | 'bar box';
  userPlan: string;
}) => {
  if (analytics) {
    logEvent(analytics, AnalyticsEvents.FLARE_SHEET_UPLOADED, {
      box_id: data.boxId,
      box_type: data.boxType,
      user_plan: data.userPlan,
      device_type: getDeviceType()
    });
  }
};

// Set user properties for segmentation
export const setUserAnalyticsProperties = (user: {
  userId: string;
  plan: string;
  totalBoxesCreated?: number;
  signupDate?: string;
  preferredBoxType?: 'wall' | 'bar box';
}) => {
  try {
    if (!analytics) {
      console.warn('Analytics not initialized');
      return;
    }

    const versionInfo = addVersionInfo({});
    
    const properties = {
      user_id: user.userId,
      subscription_plan: user.plan,
      total_boxes_created: user.totalBoxesCreated || 0,
      signup_date: user.signupDate || new Date().toISOString().split('T')[0],
      preferred_box_type: user.preferredBoxType || 'wall',
      ...versionInfo
    };
    
    console.log('Setting user properties with version info:', properties);
    
    setUserProperties(analytics, properties);
    
    console.log('✅ User properties set with version tracking');
  } catch (error) {
    console.error('❌ Failed to set user properties:', error);
  }
};

// Generic event tracking for custom events
export const trackCustomEvent = (eventName: string, parameters: Record<string, string | number | boolean>) => {
  if (analytics) {
    logEvent(analytics, eventName, {
      ...parameters,
      device_type: getDeviceType(),
      timestamp: Date.now()
    });
  }
};

// Page view tracking
export const trackPageView = (pageName: string, additionalParams?: Record<string, string | number | boolean>) => {
  if (analytics) {
    logEvent(analytics, AnalyticsEvents.PAGE_VIEW, {
      page_name: pageName,
      timestamp: Date.now(),
      ...additionalParams
    });
  }
};

export const trackHomePageVisit = (userStatus: 'logged_in' | 'logged_out' = 'logged_out') => {
  if (analytics) {
    logEvent(analytics, AnalyticsEvents.HOME_PAGE_VISITED, {
      user_status: userStatus,
      device_type: getDeviceType(),
      timestamp: Date.now(),
      page_name: 'home'
    });
  }
};

export const trackLandingPageVisit = (source?: string, medium?: string) => {
  if (analytics) {
    logEvent(analytics, AnalyticsEvents.LANDING_PAGE_VISITED, {
      traffic_source: source || 'direct',
      traffic_medium: medium || 'none',
      device_type: getDeviceType(),
      timestamp: Date.now(),
      page_name: 'landing'
    });
  }
};

// ========== ENHANCED ANALYTICS FUNCTIONS ==========

// User Identity Management
export function bindUserIdentity(uid?: string | null) {
  if (!analytics) return;
  setUserId(analytics, uid || null);
}

// Onboarding & Funnel Tracking
export const trackOnboardingStep = (stepIndex: number, stepName: string) => {
  if (!analytics) return;
  logEvent(analytics, 'onboarding_step', { 
    step_index: stepIndex, 
    step_name: stepName 
  });
};

export const trackOnboardingCompleted = () => {
  if (!analytics) return;
  logEvent(analytics, 'onboarding_completed', {});
};

export const trackEmailVerificationSent = () => {
  if (!analytics) return;
  logEvent(analytics, 'email_verification_sent', {});
};

export const trackEmailVerified = () => {
  if (!analytics) return;
  logEvent(analytics, 'email_verified', {});
};

// Enhanced Box Funnel Tracking
export const trackBoxStarted = (boxType: 'wall' | 'bar box') => {
  if (!analytics) return;
  logEvent(analytics, 'box_started', { box_type: boxType });
};

export const trackBoxConfigured = (boxType: 'wall' | 'bar box', settingsCount: number) => {
  if (!analytics) return;
  logEvent(analytics, 'box_configured', { 
    box_type: boxType, 
    settings_count: settingsCount 
  });
};

export const trackBoxPublished = (boxType: 'wall' | 'bar box') => {
  if (!analytics) return;
  logEvent(analytics, 'box_published', { box_type: boxType });
};

// Feature Usage & Access Control
export const trackFeatureUse = (feature: string, access: 'allowed'|'blocked', reason?: string) => {
  if (!analytics) return;
  logEvent(analytics, 'feature_use', { 
    feature_name: feature, 
    access, 
    reason: reason || '' 
  });
};

// CTA & Conversion Tracking
export const trackCtaClick = (id: string, location: string, variant?: string) => {
  if (!analytics) return;
  logEvent(analytics, 'cta_click', { 
    cta_id: id, 
    cta_location: location, 
    cta_variant: variant || 'default' 
  });
};

// Error & Performance Tracking
export const trackUiError = (where: string, code: string, fatal = false) => {
  if (!analytics) return;
  logEvent(analytics, 'ui_error', { where, code, fatal });
};

export const trackApiCall = (name: string, status: number, durationMs: number) => {
  if (!analytics) return;
  logEvent(analytics, 'api_call', { 
    name, 
    status, 
    duration_ms: durationMs, 
    ok: status >= 200 && status < 300 
  });
};

// Scroll Depth Tracking
export function initScrollDepth() {
  if (!analytics) return;
  
  let maxDepth = 0;
  const thresholds = [25, 50, 75, 100];
  
  const onScroll = () => {
    const scrolled = window.scrollY + window.innerHeight;
    const total = document.documentElement.scrollHeight;
    const depth = Math.round((scrolled / total) * 100);
    
    if (depth > maxDepth) {
      const newThreshold = thresholds.find(t => t > maxDepth && t <= depth);
      if (newThreshold && analytics) {
        maxDepth = newThreshold;
        logEvent(analytics, 'scroll_depth', { 
          depth_percent: newThreshold, 
          page_location: window.location.href 
        });
      }
    }
  };
  
  window.addEventListener('scroll', onScroll, { passive: true });
  
  // Return cleanup function
  return () => window.removeEventListener('scroll', onScroll);
}

// Invite & Sharing Tracking
export const trackInviteSent = (method: string, recipientCount: number) => {
  if (!analytics) return;
  logEvent(analytics, 'invite_sent', { 
    method, 
    recipient_count: recipientCount 
  });
};

export const trackInviteAccepted = (method: string) => {
  if (!analytics) return;
  logEvent(analytics, 'invite_accepted', { method });
};
