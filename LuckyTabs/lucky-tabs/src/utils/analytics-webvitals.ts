import { analytics } from '../firebase';
import { logEvent } from 'firebase/analytics';

export function initWebVitals() {
  if (!analytics) return;
  
  const send = (name: string, value: number) => {
    if (analytics) {
      logEvent(analytics, 'web_vital', { 
        metric: name, 
        value: Math.round(value),
        page_location: window.location.href,
      });
    }
  };
  
  // Basic performance observation without external dependencies
  try {
    // Observe Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          send('LCP', lastEntry.startTime);
        }
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Clean up observer after 10 seconds
      setTimeout(() => observer.disconnect(), 10000);
    }
    
    // Track page load time
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      send('page_load_time', loadTime);
    });
    
  } catch (error) {
    console.warn('Performance monitoring setup failed:', error);
  }
}