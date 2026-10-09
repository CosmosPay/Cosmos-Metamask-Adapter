import { useEffect, useRef } from 'react';
import type { Location } from '@/lib/router';

/**
 * After a client-side navigation (a site link, the language menu, back or
 * forward), moves focus to the new page's heading, as a full page load would
 * reset it: keyboard users continue from the top and screen readers read the
 * new title. A link to a section (`/#donate`) opens the new page there, with
 * focus on the section, as the browser does on a full load. The first page
 * keeps the browser's own focus.
 */
export function usePageFocus({ route, language }: Location): void {
  const shown = useRef(`${route}/${language}`);
  useEffect(() => {
    const page = `${route}/${language}`;
    if (shown.current === page) return;
    shown.current = page;
    const section = window.location.hash ? document.getElementById(window.location.hash.slice(1)) : null;
    if (section) {
      section.scrollIntoView();
      section.focus({ preventScroll: true });
      return;
    }
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
  }, [route, language]);
}
