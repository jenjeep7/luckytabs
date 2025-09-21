import { logEvent, setUserProperties } from 'firebase/analytics';
import { analytics } from '../firebase';

// Custom event names for your lottery app
export const AnalyticsEvents = {
  // Box operations
  BOX_CREATED: 'box_created',
  BOX_EDITED: 'box_edited',
  BOX_REMOVED: 'box_removed',
  BOX_SHARED: 'box_shared',
  
  // Ticket operations
  TICKETS_ESTIMATED: 'tickets_estimated',
  PRIZE_CLAIMED: 'prize_claimed',
  PRIZE_UNCLAIMED: 'prize_unclaimed',
  
  // Analytics and features
  ADVANCED_ANALYTICS_VIEWED: 'advanced_analytics_viewed',
  FLARE_SHEET_UPLOADED: 'flare_sheet_uploaded',
  DATA_EXPORTED: 'data_exported',
  
  // Page tracking
  PAGE_VIEW: 'page_view',
  HOME_PAGE_VISITED: 'home_page_visited',
  LANDING_PAGE_VISITED: 'landing_page_visited',
  
  // User engagement
  LOGIN: 'login',
  SIGNUP: 'sign_up',
  PROFILE_UPDATED: 'profile_updated',
  
  // Subscription events
  SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  FREE_LIMIT_REACHED: 'free_limit_reached',
  PRO_FEATURE_ATTEMPTED_BY_FREE_USER: 'pro_feature_attempted_by_free_user',
  
  // Location operations
  LOCATION_CREATED: 'location_created',
  LOCATION_SELECTED: 'location_selected'
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
      starting_tickets: boxData.startingTickets || null,
      device_type: getDeviceType(),
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
      method: method,
      device_type: getDeviceType()
    });
  }
};

export const trackUserSignup = (method: string) => {
  if (analytics) {
    logEvent(analytics, AnalyticsEvents.SIGNUP, {
      method: method,
      device_type: getDeviceType()
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
export const setUserAnalyticsProperties = (userData: {
  userId: string;
  plan: string;
  totalBoxesCreated?: number;
  signupDate?: string;
  preferredBoxType?: 'wall' | 'bar box';
}) => {
  if (analytics) {
    setUserProperties(analytics, {
      user_id: userData.userId,
      subscription_plan: userData.plan,
      total_boxes_created: userData.totalBoxesCreated || 0,
      user_since: userData.signupDate || '',
      preferred_box_type: userData.preferredBoxType || 'unknown',
      device_type: getDeviceType()
    });
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
      device_type: getDeviceType(),
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
