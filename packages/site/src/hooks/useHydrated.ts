import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * False while prerendering and hydrating, true once the page runs in the
 * browser: for parts that depend on it (the theme, storage, the browser's
 * languages), so the prerendered HTML and the first client render match.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
