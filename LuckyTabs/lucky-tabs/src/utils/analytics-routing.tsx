import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '../firebase';
import { logEvent } from 'firebase/analytics';

export function usePageViews() {
  const location = useLocation();

  useEffect(() => {
    if (!analytics) return;

    // Track time on page
    const start = performance.now();

    // Log GA4-style page_view with recommended params
    logEvent(analytics, 'page_view', {
      page_location: window.location.href,
      page_referrer: document.referrer || '',
      page_title: document.title || '',
      // Custom context
      route_path: location.pathname,
      route_search: location.search || '',
    });

    // Return cleanup function to track engagement time
    return () => {
      const durationMs = Math.round(performance.now() - start);
      if (analytics && durationMs > 1000) { // Only log if user spent more than 1 second
        logEvent(analytics, 'page_engagement', {
          route_path: location.pathname,
          engagement_time_msec: durationMs,
          page_location: window.location.href,
        });
      }
    };
  }, [location]);
}