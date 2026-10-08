import { useEffect, useRef } from 'react';
import { useConsent } from '@/analytics/consent';
import { startAnalytics, stopAnalytics, trackPageView } from '@/analytics/googleAnalytics';
import { GA_MEASUREMENT_ID } from '@/config';
import type { Location } from '@/lib/router';

/**
 * Measures the site only when Google Analytics is configured and the visitor
 * said yes: starts it, sends a page view for each page shown, and stops it if
 * they change their mind. Call after useDocumentHead, so each view gets its
 * page's title.
 */
export function useAnalytics({ route, language }: Location): void {
  const { consent } = useConsent();
  const enabled = GA_MEASUREMENT_ID !== null && consent === 'granted';
  const wasEnabled = useRef(false);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    if (enabled) startAnalytics(GA_MEASUREMENT_ID);
    else if (wasEnabled.current) stopAnalytics(GA_MEASUREMENT_ID);
    wasEnabled.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (enabled) trackPageView(language);
  }, [enabled, route, language]);
}
