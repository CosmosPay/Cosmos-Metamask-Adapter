import { useSyncExternalStore } from 'react';

/** The site's pages and their paths (trailing slash, as the links use them). */
export const ROUTES = { home: '/', privacy: '/privacy/', terms: '/terms/', credits: '/credits/' } as const;

export type Route = keyof typeof ROUTES;

const isRoute = (name: string): name is Route => name in ROUTES;

/** The page for a path, with or without the trailing slash; anything unknown shows home. */
export function routeOf(pathname: string): Route {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return Object.keys(ROUTES).find((name): name is Route => isRoute(name) && ROUTES[name] === path) ?? 'home';
}

/** Fired by navigate(); back/forward fire `popstate` themselves. */
const NAVIGATE = 'site:navigate';

function subscribe(onChange: () => void): () => void {
  window.addEventListener('popstate', onChange);
  window.addEventListener(NAVIGATE, onChange);
  return () => {
    window.removeEventListener('popstate', onChange);
    window.removeEventListener(NAVIGATE, onChange);
  };
}

/** The page for the current URL, re-rendering on navigate() and on back/forward. */
export function useRoute(): Route {
  return useSyncExternalStore(subscribe, () => routeOf(window.location.pathname));
}

/**
 * Shows a site page without reloading (History API), from the top. Opening a
 * path directly needs the host to serve index.html for it, as Vite's dev
 * server and `vite preview` do.
 */
export function navigate(path: string): void {
  if (path !== window.location.pathname) {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new Event(NAVIGATE));
  }
  window.scrollTo(0, 0);
}
