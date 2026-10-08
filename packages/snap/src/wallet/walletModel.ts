import type { StellarNetwork } from '@/config/networks';
import { DEFAULT_NETWORK, NETWORKS } from '@/config/networks';

/**
 * The wallet's persisted state and its rules, as pure functions: every
 * transition takes a state and returns the next one, so the rules are tested
 * without MetaMask and persistence stays in `state.ts`.
 */

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

export const MAX_ACCOUNT_NAME = 24;

export const isImported = (index: number) => index >= IMPORTED_BASE;

export class LastAccountError extends Error {
  constructor() {
    super('At least one account is required.');
    this.name = 'LastAccountError';
  }
}

/**
 * Fills defaults and drops anything inconsistent from what storage returned.
 *
 * @param raw - Stored state (any shape, or null on first run).
 * @returns A valid state.
 */
export function normalizeState(raw: Partial<SnapState> | null | undefined): SnapState {
  const accounts = raw?.accounts?.length ? raw.accounts : [0];
  const selectedAccount =
    raw?.selectedAccount !== undefined && accounts.includes(raw.selectedAccount)
      ? raw.selectedAccount
      : (accounts[0] as number);
  return {
    network: raw?.network && raw.network in NETWORKS ? raw.network : DEFAULT_NETWORK,
    links: raw?.links ?? [],
    accounts,
    selectedAccount,
    accountNames: raw?.accountNames ?? {},
    imported: raw?.imported ?? {},
  };
}

/**
 * Adds the lowest unused derived index (so a removed account comes back with
 * its funds) and selects it.
 *
 * @param state - Current state.
 * @returns Next state and the new index.
 */
export function withDerivedAccount(state: SnapState): { state: SnapState; index: number } {
  let index = 0;
  while (state.accounts.includes(index)) {
    index += 1;
  }
  return {
    index,
    state: {
      ...state,
      accounts: [...state.accounts, index].sort((a, b) => a - b),
      selectedAccount: index,
    },
  };
}

/**
 * Adds an imported secret key as a new, selected account.
 *
 * @param state - Current state.
 * @param secret - Validated Stellar secret key (`S…`).
 * @returns Next state and the new id.
 */
export function withImportedAccount(state: SnapState, secret: string): { state: SnapState; index: number } {
  let index = IMPORTED_BASE;
  while (state.accounts.includes(index) || state.imported[String(index)]) {
    index += 1;
  }
  return {
    index,
    state: {
      ...state,
      accounts: [...state.accounts, index],
      selectedAccount: index,
      imported: { ...state.imported, [String(index)]: secret },
    },
  };
}

/**
 * Removes an account. A derived account is only hidden (its key comes from the
 * Secret Recovery Phrase); an imported one has its key and name erased.
 *
 * @param state - Current state.
 * @param index - Account to remove.
 * @returns Next state.
 * @throws {LastAccountError} When it is the only account.
 */
export function withoutAccount(state: SnapState, index: number): SnapState {
  const accounts = state.accounts.filter((account) => account !== index);
  if (accounts.length === 0) {
    throw new LastAccountError();
  }
  const next: SnapState = {
    ...state,
    accounts,
    selectedAccount: state.selectedAccount === index ? (accounts[0] as number) : state.selectedAccount,
  };
  if (isImported(index)) {
    const { [String(index)]: _key, ...imported } = state.imported;
    const { [String(index)]: _name, ...accountNames } = state.accountNames;
    next.imported = imported;
    next.accountNames = accountNames;
  }
  return next;
}

/**
 * Renames an account; an empty name restores the default ("Account 2").
 *
 * @param state - Current state.
 * @param index - Account index.
 * @param name - New name (trimmed, at most {@link MAX_ACCOUNT_NAME} chars).
 * @returns Next state.
 */
export function withAccountName(state: SnapState, index: number, name: string): SnapState {
  const trimmed = Array.from(name.trim()).slice(0, MAX_ACCOUNT_NAME).join('');
  const accountNames = { ...state.accountNames };
  if (trimmed) {
    accountNames[String(index)] = trimmed;
  } else {
    delete accountNames[String(index)];
  }
  return { ...state, accountNames };
}
