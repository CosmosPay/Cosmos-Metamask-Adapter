import { t } from '@/i18n';
import { getState, IMPORTED_BASE, isImported } from '@/wallet/state';

/** Custom names (renamed by the user), cached so components can read them synchronously. */
let customNames: Record<string, string> = {};

/** Reloads the cached names; call at the start of every event that renders. */
export async function refreshAccountNames(): Promise<void> {
  customNames = (await getState()).accountNames;
}

/**
 * Display name of an account: the custom name, else "Account N" / "Imported N".
 *
 * @param index - Account index.
 * @returns The localized name.
 */
export const accountName = (index: number) =>
  customNames[String(index)] ??
  (isImported(index)
    ? t('accounts.importedName', { n: index - IMPORTED_BASE + 1 })
    : t('accounts.name', { n: index + 1 }));
