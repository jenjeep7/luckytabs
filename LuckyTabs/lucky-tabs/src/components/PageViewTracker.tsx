import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';
import { useAuthStateCompat } from '../services/useAuthStateCompat';

/**
 * PageViewTracker component that automatically tracks page views
 * for Firebase Analytics whenever the route changes.
 */
export const PageViewTracker = () => {
  const { pathname, search } = useLocation();
  const [user] = useAuthStateCompat();

  useEffect(() => {
    // Get page name from pathname
    const getPageName = (path: string) => {
      // Remove leading slash and get the first segment
      const segments = path.replace(/^\//, '').split('/');
      const pageName = segments[0] || 'home';
      
      // Map specific paths to readable names
      const pageNameMap: Record<string, string> = {
        '': 'home',
        'home': 'landing',
        'login': 'login',
        'signup': 'signup',
        'play': 'play',
        'tracking': 'tracking',
        'community': 'community',
        'profile': 'profile',
        'features': 'features',
        'support-circle': 'support-circle',
        'privacy-policy': 'privacy-policy',
        'responsible-gaming': 'responsible-gaming',
        'tabsy': 'tabsy'
      };

      return pageNameMap[pageName] || pageName;
    };

    const pageName = getPageName(pathname);
    
    // Track the page view with additional context
    trackPageView(pageName, {
      page_path: pathname,
      page_search: search,
      user_status: user ? 'authenticated' : 'anonymous',
      user_id: user?.uid || 'anonymous',
      full_url: `${pathname}${search}`
    });

  }, [pathname, search, user]);

  // This component doesn't render anything
  return null;
};