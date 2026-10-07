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
  /**
   * Accounts shown in the wallet, in display order: SEP-0005 indexes of the
   * MetaMask phrase, or ids ≥ {@link IMPORTED_BASE} for imported keys.
   */
  accounts: number[];
  /** Index of the active account. */
  selectedAccount: number;
  /** Custom account names, keyed by account index. */
  accountNames: Record<string, string>;
  /**
   * Imported secret keys (`S…`), keyed by account id. Snap state is encrypted
   * by MetaMask; a recovery phrase is never stored, only the key derived from it.
   */
  imported: Record<string, string>;
};

/** Account ids from here up are imported keys, not derived from MetaMask's phrase. */
export const IMPORTED_BASE = 1_000_000;

export const isImported = (index: number) => index >= IMPORTED_BASE;

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
    imported: state?.imported ?? {},
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
  await updateState({
    accounts: [...accounts, index].sort((a, b) => a - b),
    selectedAccount: index,
  });
  return index;
}

/**
 * Adds an imported secret key as a new account and selects it.
 *
 * @param secret - Stellar secret key (`S…`), already validated.
 * @returns The new account id.
 */
export async function importAccount(secret: string): Promise<number> {
  const { accounts, imported } = await getState();
  let id = IMPORTED_BASE;
  while (accounts.includes(id) || imported[String(id)]) {
    id += 1;
  }
  await updateState({
    accounts: [...accounts, id],
    selectedAccount: id,
    imported: { ...imported, [String(id)]: secret },
  });
  return id;
}

/**
 * Removes an account from the wallet. A derived account is only hidden (its
 * key comes from the Secret Recovery Phrase, so adding an account again
 * restores it); an imported one has its key erased.
 *
 * @param index - Account index.
 */
export async function removeAccount(index: number): Promise<void> {
  const { accounts, selectedAccount, imported, accountNames } = await getState();
  const remaining = accounts.filter((account) => account !== index);
  if (remaining.length === 0) {
    throw new Error('At least one account is required.');
  }
  const update: Partial<SnapState> = {
    accounts: remaining,
    selectedAccount: selectedAccount === index ? (remaining[0] as number) : selectedAccount,
  };
  if (isImported(index)) {
    const { [String(index)]: _erased, ...keptKeys } = imported;
    const { [String(index)]: _name, ...keptNames } = accountNames;
    update.imported = keptKeys;
    update.accountNames = keptNames;
  }
  await updateState(update);
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
