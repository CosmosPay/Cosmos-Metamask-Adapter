import { useEffect, useRef } from 'react';
import type { Location } from '@/lib/router';

/**
 * After a client-side navigation (a site link, the language menu, back or
 * forward), moves focus to the new page's heading, as a full page load would
 * reset it: keyboard users continue from the top and screen readers read the
 * new title. The first page keeps the browser's own focus.
 */
export function usePageFocus({ route, language }: Location): void {
  const shown = useRef(`${route}/${language}`);
  useEffect(() => {
    const page = `${route}/${language}`;
    if (shown.current === page) return;
    shown.current = page;
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
  }, [route, language]);
}
