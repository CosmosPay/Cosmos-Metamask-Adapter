import type { Json } from '@metamask/snaps-sdk';

import type { SnapState } from '@/wallet/walletModel';
import {
  normalizeState,
  withAccountName,
  withDerivedAccount,
  withImportedAccount,
  withoutAccount,
} from '@/wallet/walletModel';
import { stateStore } from '@/wallet/stateStore';

export type { EvmLink, SnapState } from '@/wallet/walletModel';
export { IMPORTED_BASE, isImported, LastAccountError, MAX_ACCOUNT_NAME } from '@/wallet/walletModel';

/**
 * Persistence of the wallet state: reads and writes through the configured
 * {@link stateStore}; the rules themselves live in `walletModel.ts`.
 */

/**
 * Reads the persisted snap state.
 *
 * @returns The state, with defaults filled in.
 */
export async function getState(): Promise<SnapState> {
  return normalizeState((await stateStore().read()) as Partial<SnapState> | null);
}

/**
 * Persists a whole state.
 *
 * @param state - The state to store.
 */
async function saveState(state: SnapState): Promise<void> {
  await stateStore().write(state as unknown as Record<string, Json>);
}

/**
 * Merges and persists snap state.
 *
 * @param update - Fields to update.
 */
export async function updateState(update: Partial<SnapState>): Promise<void> {
  await saveState({ ...(await getState()), ...update });
}

/**
 * Adds the next derived account and selects it.
 *
 * @returns The new account index.
 */
export async function addAccount(): Promise<number> {
  const { state, index } = withDerivedAccount(await getState());
  await saveState(state);
  return index;
}

/**
 * Adds an imported secret key as a new account and selects it.
 *
 * @param secret - Stellar secret key (`S…`), already validated.
 * @returns The new account id.
 */
export async function importAccount(secret: string): Promise<number> {
  const { state, index } = withImportedAccount(await getState(), secret);
  await saveState(state);
  return index;
}

/**
 * Removes an account (see {@link withoutAccount}).
 *
 * @param index - Account index.
 */
export async function removeAccount(index: number): Promise<void> {
  await saveState(withoutAccount(await getState(), index));
}

/**
 * Renames an account. An empty name restores the default.
 *
 * @param index - Account index.
 * @param name - New name.
 */
export async function renameAccount(index: number, name: string): Promise<void> {
  await saveState(withAccountName(await getState(), index, name));
}
