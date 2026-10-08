import type { JSXElement } from '@metamask/snaps-sdk/jsx';

import { NETWORKS } from '@/config/networks';
import { fetchAccount } from '@/services/horizon';
import { getKeypair } from '@/wallet/keyring';
import { getState } from '@/wallet/state';
import type { HomeContext } from '@/home/types';

/** Thin wrappers over the snap interface APIs used by every controller. */

/**
 * Replaces what the home page shows.
 *
 * @param id - Interface id.
 * @param ui - The screen.
 * @param context - Context the next event will receive.
 */
export async function show(id: string, ui: JSXElement, context: HomeContext = {}): Promise<void> {
  await snap.request({
    method: 'snap_updateInterface',
    params: { id, ui, context },
  });
}

/**
 * Values typed in a form, read back before leaving the screen (e.g. to pick an asset).
 *
 * @param id - Interface id.
 * @param form - Form name.
 * @returns The values, empty if the form is not on screen.
 */
export async function formValues(id: string, form: string): Promise<Record<string, unknown>> {
  try {
    const state = (await snap.request({
      method: 'snap_getInterfaceState',
      params: { id },
    })) as Record<string, unknown>;
    const values = state[form];
    return values && typeof values === 'object' ? (values as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export const readString = (value: Record<string, unknown>, key: string, fallback = '') =>
  typeof value[key] === 'string' ? (value[key] as string) : fallback;

/**
 * The selected account on the selected network, with its Horizon account
 * (null while not activated or unreachable).
 *
 * @returns State, keypair, network and account.
 */
export async function loadWallet() {
  const state = await getState();
  const keypair = await getKeypair(state.selectedAccount);
  const network = NETWORKS[state.network];
  const account = await fetchAccount(network, keypair.publicKey()).catch(() => null);
  return { state, keypair, network, account };
}
