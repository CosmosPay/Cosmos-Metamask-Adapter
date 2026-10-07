import type { StellarNetwork } from './networks';
import { DEFAULT_NETWORK } from './networks';

export type EvmLink = {
  evmAddress: string;
  stellarAddress: string;
  message: string;
  /** personal_sign signature by the EVM account (hex). */
  evmSignature: string;
  /** SEP-53 signature by the Stellar account (base64). */
  stellarSignature: string;
  linkedAt: number;
};

export type SnapState = {
  network: StellarNetwork;
  links: EvmLink[];
  /** SEP-0005 indexes of the accounts shown in the wallet, in display order. */
  accounts: number[];
  /** Index of the active account. */
  selectedAccount: number;
  /** Custom account names, keyed by account index. */
  accountNames: Record<string, string>;
};

/**
 * Reads the persisted snap state.
 *
 * @returns The state, with defaults filled in.
 */
export async function getState(): Promise<SnapState> {
  const state = (await snap.request({
    method: 'snap_manageState',
    params: { operation: 'get' },
  })) as Partial<SnapState> | null;

  const accounts = state?.accounts?.length ? state.accounts : [0];
  const selectedAccount =
    state?.selectedAccount !== undefined && accounts.includes(state.selectedAccount)
      ? state.selectedAccount
      : (accounts[0] as number);

  return {
    network: state?.network ?? DEFAULT_NETWORK,
    links: state?.links ?? [],
    accounts,
    selectedAccount,
    accountNames: state?.accountNames ?? {},
  };
}

/**
 * Merges and persists snap state.
 *
 * @param update - Fields to update.
 */
export async function updateState(update: Partial<SnapState>): Promise<void> {
  const state = await getState();
  await snap.request({
    method: 'snap_manageState',
    params: { operation: 'update', newState: { ...state, ...update } },
  });
}

/**
 * Adds the lowest unused account index (so a removed account comes back with
 * its funds) and selects it.
 *
 * @returns The new account index.
 */
export async function addAccount(): Promise<number> {
  const { accounts } = await getState();
  let index = 0;
  while (accounts.includes(index)) {
    index += 1;
  }
  await updateState({ accounts: [...accounts, index].sort((a, b) => a - b), selectedAccount: index });
  return index;
}

/**
 * Hides an account from the wallet. Keys are derived from the Secret Recovery
 * Phrase, so nothing is destroyed: adding an account again restores it.
 *
 * @param index - Account index.
 */
export async function removeAccount(index: number): Promise<void> {
  const { accounts, selectedAccount } = await getState();
  const remaining = accounts.filter((account) => account !== index);
  if (remaining.length === 0) {
    throw new Error('At least one account is required.');
  }
  await updateState({
    accounts: remaining,
    selectedAccount: selectedAccount === index ? (remaining[0] as number) : selectedAccount,
  });
}

export const MAX_ACCOUNT_NAME = 24;

/**
 * Renames an account. An empty name restores the default ("Account 2").
 *
 * @param index - Account index.
 * @param name - New name.
 */
export async function renameAccount(index: number, name: string): Promise<void> {
  const { accountNames } = await getState();
  const trimmed = name.trim().slice(0, MAX_ACCOUNT_NAME);
  const next = { ...accountNames };
  if (trimmed) {
    next[String(index)] = trimmed;
  } else {
    delete next[String(index)];
  }
  await updateState({ accountNames: next });
}
