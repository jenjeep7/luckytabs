import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component that automatically scrolls to the top of the page
 * whenever the route changes. This ensures a consistent user experience
 * when navigating between pages.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const scrollToTop = () => {
      // Force synchronous scroll to top using multiple methods
      
      // Method 1: Immediate window scroll with both techniques
      window.scrollTo(0, 0);
      if (window.scrollTo) {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      
      // Method 2: Document elements
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;
      }
      
      // Method 3: Find and reset all potentially scrollable elements
      const scrollableElements = document.querySelectorAll('*');
      scrollableElements.forEach(element => {
        if (element instanceof HTMLElement && element.scrollTop > 0) {
          element.scrollTop = 0;
          element.scrollLeft = 0;
        }
      });
    };

    // Use requestAnimationFrame to ensure DOM is ready
    const frameId = requestAnimationFrame(() => {
      scrollToTop();
      
      // Double-check after another frame
      requestAnimationFrame(() => {
        scrollToTop();
      });
    });
    
    return () => cancelAnimationFrame(frameId);
  }, [pathname]);

  return null;
};