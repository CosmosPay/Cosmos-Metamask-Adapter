import type { HomeContext } from '@/home/types';

/**
 * Routing for home page events. Button and form names are `action` or
 * `action:argument` (e.g. `select-account:2`, `choose-asset:send:native`);
 * each feature registers handlers for its actions, so adding a screen never
 * means editing a central switch.
 */

export type ClickEvent = {
  id: string;
  /** Full button name. */
  name: string;
  /** Everything after the first `:` (empty when there is none). */
  arg: string;
  context: HomeContext;
};

export type FormEvent = {
  id: string;
  arg: string;
  values: Record<string, unknown>;
  context: HomeContext;
};

export type ClickHandler = (event: ClickEvent) => Promise<void>;
export type FormHandler = (event: FormEvent) => Promise<void>;

export type Routes = {
  clicks?: Record<string, ClickHandler>;
  forms?: Record<string, FormHandler>;
};

/**
 * Splits `action:argument` at the first colon.
 *
 * @param name - Button or form name.
 * @returns The action and its argument.
 */
export function parseName(name: string): { action: string; arg: string } {
  const colon = name.indexOf(':');
  return colon === -1 ? { action: name, arg: '' } : { action: name.slice(0, colon), arg: name.slice(colon + 1) };
}

/**
 * Merges feature routes, refusing duplicate actions so two features can't
 * silently claim the same button.
 *
 * @param routes - Each feature's routes.
 * @returns One table of click and form handlers.
 */
export function combineRoutes(...routes: Routes[]) {
  const clicks: Record<string, ClickHandler> = {};
  const forms: Record<string, FormHandler> = {};
  for (const route of routes) {
    for (const [table, entries] of [
      [clicks, route.clicks],
      [forms, route.forms],
    ] as const) {
      for (const [action, handler] of Object.entries(entries ?? {})) {
        if (Object.prototype.hasOwnProperty.call(table, action)) {
          throw new Error(`Duplicate home route: ${action}`);
        }
        (table as Record<string, unknown>)[action] = handler;
      }
    }
  }
  return {
    click: (action: string) => (Object.prototype.hasOwnProperty.call(clicks, action) ? clicks[action] : undefined),
    form: (action: string) => (Object.prototype.hasOwnProperty.call(forms, action) ? forms[action] : undefined),
  };
}
