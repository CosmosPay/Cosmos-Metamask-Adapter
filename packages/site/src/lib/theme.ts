import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

/** Same key the boot script (vite.config.ts) reads before first paint. */
const STORAGE_KEY = 'theme';

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    // Storage can be blocked (private mode, site data off): just don't persist.
    return null;
  }
}

/** The theme on <html data-theme>, which is all the CSS looks at. */
export const currentTheme = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

/** Applies and remembers an explicit choice; from then on the OS scheme no longer applies. */
export function setTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // See storedTheme.
  }
}

// Without an explicit choice, keep following the OS while the page is open. (Prerendering has no window.)
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
    if (!storedTheme()) document.documentElement.dataset.theme = event.matches ? 'dark' : 'light';
  });
}

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

/**
 * The current theme, re-rendering on change (toggle or OS switch). The
 * prerender can't know it, so it and hydration use light; what differs by
 * theme before scripts run is left to the CSS.
 */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, currentTheme, () => 'light');
}
