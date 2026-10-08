import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

/** Same key the inline script in index.html reads before first paint. */
const STORAGE_KEY = 'theme';

const root = document.documentElement;
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

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
export const currentTheme = (): Theme => (root.dataset.theme === 'dark' ? 'dark' : 'light');

/** Applies and remembers an explicit choice; from then on the OS scheme no longer applies. */
export function setTheme(theme: Theme): void {
  root.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // See storedTheme.
  }
}

// Without an explicit choice, keep following the OS while the page is open.
systemDark.addEventListener('change', (event) => {
  if (!storedTheme()) root.dataset.theme = event.matches ? 'dark' : 'light';
});

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

/** The current theme, re-rendering on change (toggle or OS switch). */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, currentTheme);
}
