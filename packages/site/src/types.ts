import type {
  Backend,
  EvmLink,
  SignOptions,
  StellarNetwork,
  StellarSnapClient,
  WithError,
} from '@cosmosapp/stellar-metamask-adapter';

export type { Backend, Sep43Error, StellarNetwork } from '@cosmosapp/stellar-metamask-adapter';

/** Snap-only extensions the demo relies on (testnet / futurenet). */
export type SnapExtensions = Pick<StellarSnapClient, 'getAccounts' | 'getBalance' | 'sendPayment'>;

/**
 * The slice of the wallet adapter the UI depends on. Components and hooks only
 * see this interface; the concrete adapter is created in `services/wallet.ts`.
 */
export interface StellarWallet {
  readonly backend: Backend;
  /** Throws until connected to the snap. */
  readonly snap: SnapExtensions;
  requestAccess(): Promise<WithError<{ address: string }>>;
  getAddress(): Promise<WithError<{ address: string }>>;
  getNetwork(): Promise<WithError<{ network: string; networkPassphrase: string }>>;
  getNetworkDetails(): Promise<WithError<{ network: string; networkPassphrase: string }>>;
  switchNetwork(network: StellarNetwork): Promise<WithError<{ network: string; networkPassphrase: string }>>;
  signAuthEntry(
    authEntry: string,
    opts?: SignOptions,
  ): Promise<WithError<{ signedAuthEntry: string | null; signerAddress: string }>>;
  signMessage(
    message: string,
    opts?: SignOptions,
  ): Promise<WithError<{ signedMessage: string | null; signerAddress: string }>>;
  linkEvmAddress(): Promise<WithError<{ link: EvmLink | null }>>;
  getLinkedAddresses(): Promise<WithError<{ links: EvmLink[] }>>;
  /** Subscribes to account / network changes; returns the unsubscribe function. */
  onChange(callback: () => void): () => void;
}

/** Native balance as reported by the snap; `unknown` on the official backend. */
export type Balance = { kind: 'unknown' } | { kind: 'unfunded' } | { kind: 'funded'; xlm: string };

/** Everything the account card shows, loaded in one go. */
export type AccountSnapshot = {
  address: string;
  /** Name the snap shows ("Cuenta 1"); null on the official backend. */
  accountName: string | null;
  network: StellarNetwork;
  backend: Backend;
  balance: Balance;
  linkedEvmAddresses: string[];
};

export type PaymentInput = {
  destination: string;
  amount: string;
  memo: string;
};

export type LogEntry = {
  label: string;
  text: string;
};
