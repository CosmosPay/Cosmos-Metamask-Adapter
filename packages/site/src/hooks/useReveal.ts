import { type CSSProperties, useEffect } from 'react';

/** Pieces that come into view together enter one after another, up to this many steps apart. */
const MAX_ORDER = 8;

/** A `.reveal` element's place in the page's opening sequence; the CSS turns it into a delay. */
export const revealStep = (index: number) => ({ '--step': index }) as CSSProperties;

/**
 * Plays each `.reveal` element's entrance (global.css) when it scrolls into
 * view. A fresh page plays every entrance at once, which only the pieces on
 * screen show; so once the page runs, the ones off screen are hidden
 * (`data-reveal="pending"`) and play it again when they arrive (`"in"`),
 * those arriving together in turn (`--reveal-order`). Without JavaScript
 * nothing is ever hidden. Elements must be on the page when it mounts.
 */
export function useReveal(): void {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        let order = 0;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const element = entry.target as HTMLElement;
          element.style.setProperty('--reveal-order', String(Math.min(order++, MAX_ORDER)));
          element.dataset.reveal = 'in';
          observer.unobserve(element);
        }
      },
      // A little above the bottom edge, so the entrance is seen rather than finished below the fold.
      { rootMargin: '0px 0px -8% 0px' },
    );
    const elements = [...document.querySelectorAll<HTMLElement>('.reveal')].filter(
      (element) => element.dataset.reveal !== 'in',
    );
    // Read every position before writing, so the page is laid out once.
    const offScreen = elements.filter((element) => {
      const { top, bottom } = element.getBoundingClientRect();
      return element.dataset.reveal === 'pending' || bottom <= 0 || top >= window.innerHeight;
    });
    for (const element of offScreen) {
      element.dataset.reveal = 'pending';
      observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);
}
