import { setUserProperties } from 'firebase/analytics';
import { analytics } from '../firebase';

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
}

function parseQuery(qs: string): AttributionData {
  const p = new URLSearchParams(qs);
  return {
    utm_source: p.get('utm_source') || undefined,
    utm_medium: p.get('utm_medium') || undefined,
    utm_campaign: p.get('utm_campaign') || undefined,
    utm_term: p.get('utm_term') || undefined,
    utm_content: p.get('utm_content') || undefined,
    gclid: p.get('gclid') || undefined,
    fbclid: p.get('fbclid') || undefined,
  };
}

export function captureAttributionOnLoad() {
  if (!analytics) return;
  
  const firstTouch = sessionStorage.getItem('ft_attrs');
  const attrs = parseQuery(window.location.search);

  // Store first touch attribution if not already stored
  if (!firstTouch && (attrs.utm_source || attrs.gclid || attrs.fbclid)) {
    sessionStorage.setItem('ft_attrs', JSON.stringify(attrs));
    
    setUserProperties(analytics, {
      first_utm_source: attrs.utm_source || '(none)',
      first_utm_medium: attrs.utm_medium || '(none)',
      first_utm_campaign: attrs.utm_campaign || '(none)',
      first_gclid: attrs.gclid || '',
      first_fbclid: attrs.fbclid || '',
    });
  }

  return attrs;
}

export function getLastTouchAttribution(): AttributionData {
  return parseQuery(window.location.search);
}

export function getFirstTouchAttribution(): AttributionData | null {
  const stored = sessionStorage.getItem('ft_attrs');
  return stored ? JSON.parse(stored) as AttributionData : null;
}