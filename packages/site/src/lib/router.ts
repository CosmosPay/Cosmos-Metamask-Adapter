import { createContext, createElement, type ReactNode, useContext, useMemo, useSyncExternalStore } from 'react';
import { DEFAULT_LANGUAGE, isLanguage, type Language } from '@/i18n/languages';

/** The site's pages and their paths in the default language (trailing slash, as the links use them). */
export const ROUTES = {
  home: '/',
  privacy: '/privacy/',
  terms: '/terms/',
  credits: '/credits/',
  contact: '/contact/',
} as const;

export type Route = keyof typeof ROUTES;

const ROUTE_NAMES = Object.keys(ROUTES) as Route[];

/** Where a URL points: a page in a language. `route` is null when there's no such page (the 404). */
export type Location = { route: Route | null; language: Language };

/** A page's path in a language: `/privacy/` in Spanish, `/en/privacy/` in English. */
export function pathFor(route: Route, language: Language): string {
  return language === DEFAULT_LANGUAGE ? ROUTES[route] : `/${language}${ROUTES[route]}`;
}

/**
 * The page and language for a path, with or without the trailing slash or
 * `index.html` (static hosts serve both). The default language has no prefix,
 * so `/es/…` is not a page.
 */
export function locate(pathname: string): Location {
  let path = pathname.replace(/index\.html$/u, '');
  if (!path.endsWith('/')) path += '/';
  const prefix = path.split('/')[1] ?? '';
  const language = isLanguage(prefix) && prefix !== DEFAULT_LANGUAGE ? prefix : DEFAULT_LANGUAGE;
  const rest = language === DEFAULT_LANGUAGE ? path : path.slice(language.length + 1);
  return { route: ROUTE_NAMES.find((name) => ROUTES[name] === rest) ?? null, language };
}

/** A site link written in the default language (`/privacy/`, as the documents have them) in `language`; anything else as is. */
export function localizePath(href: string, language: Language): string {
  const { route } = locate(href);
  return href.startsWith('/') && route ? pathFor(route, language) : href;
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

const clientPath = () => window.location.pathname;

/** The path being prerendered (`entry-server.tsx`); in the browser there's none and the URL is read instead. */
const ServerPathContext = createContext<string | null>(null);

/** Renders `children` as the page at `path`, for prerendering. */
export function ServerLocation({ path, children }: { path: string; children: ReactNode }) {
  return createElement(ServerPathContext, { value: path }, children);
}

/**
 * The page and language for the current URL, re-rendering on navigate() and
 * on back/forward. Hydration reads the URL too, which is the path the page was
 * prerendered for.
 */
export function useLocation(): Location {
  const serverPath = useContext(ServerPathContext);
  const path = useSyncExternalStore(subscribe, clientPath, () => serverPath ?? clientPath());
  return useMemo(() => locate(path), [path]);
}

/** Shows a site page without reloading (History API), from the top. Every page is also a prerendered file. */
export function navigate(path: string): void {
  if (path !== window.location.pathname) {
    window.history.pushState(null, '', path);
    window.dispatchEvent(new Event(NAVIGATE));
  }
  window.scrollTo(0, 0);
}
