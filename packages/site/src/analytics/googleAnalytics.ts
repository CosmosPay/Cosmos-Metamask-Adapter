/**
 * Google Analytics 4, loaded only after the visitor accepts it: page views
 * (client-side navigation included, since the site switches pages in place)
 * and the Core Web Vitals, to watch real-world performance.
 */

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

let started: string | null = null;

/** Loads gtag.js and starts measuring, once. Page views are sent by `trackPageView`. */
export function startAnalytics(measurementId: string): void {
  if (started) return;
  started = measurementId;
  Reflect.deleteProperty(window, `ga-disable-${measurementId}`);
  window.dataLayer = window.dataLayer ?? [];
  // gtag.js reads `arguments` objects from the data layer, not arrays.
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  // gtag's default puts `_ga` on the parent domain (cosmospay.lat), shared with the
  // sites there; consent here covers only this host, so its cookies stay on it.
  window.gtag('config', measurementId, { send_page_view: false, cookie_domain: window.location.hostname });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.append(script);

  void import('web-vitals').then(({ onCLS, onFCP, onINP, onLCP, onTTFB }) => {
    const send = ({
      name,
      delta,
      value,
      id,
      rating,
    }: {
      name: string;
      delta: number;
      value: number;
      id: string;
      rating: string;
    }) =>
      window.gtag?.('event', name, {
        // GA sums integer values; CLS is a small fraction, so it's scaled up.
        value: Math.round(name === 'CLS' ? delta * 1000 : delta),
        metric_id: id,
        metric_value: value,
        metric_rating: rating,
        non_interaction: true,
      });
    onCLS(send);
    onFCP(send);
    onINP(send);
    onLCP(send);
    onTTFB(send);
  });
}

/** One page view: the URL, the head's title (already updated) and the page's language. */
export function trackPageView(language: string): void {
  window.gtag?.('event', 'page_view', {
    page_location: window.location.href,
    page_title: document.title,
    language,
  });
}

/**
 * Stops measuring after the visitor withdraws consent: gtag's opt-out flag,
 * and Google's `_ga` cookies removed from this site. The parent domain's
 * belong to the other sites there and the visitor's answer on them.
 */
export function stopAnalytics(measurementId: string): void {
  Reflect.set(window, `ga-disable-${measurementId}`, true);
  const host = window.location.hostname;
  const domains = ['', host, `.${host}`];
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0]?.trim() ?? '';
    if (!name.startsWith('_ga')) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
    }
  }
}
