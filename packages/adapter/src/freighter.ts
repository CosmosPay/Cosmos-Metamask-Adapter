import type { HybridAdapterOptions } from './hybrid.ts';
import { HybridStellarAdapter } from './hybrid.ts';
import type { ChangeEvent } from './types.ts';

/** Base for the Freighter-compatible `WatchWalletChanges`. */
export class WalletChangesWatcher {
  #unsubscribe: (() => void) | null = null;
  readonly #adapter: HybridStellarAdapter;
  readonly timeout: number;

  constructor(adapter: HybridStellarAdapter, timeout = 3000) {
    this.#adapter = adapter;
    this.timeout = timeout;
  }

  watch(callback: (event: { address: string; network: string; networkPassphrase: string }) => void) {
    this.stop();
    this.#unsubscribe = this.#adapter.onChange(({ address, network, networkPassphrase }: ChangeEvent) =>
      callback({ address, network, networkPassphrase }),
    );
    return {};
  }

  stop() {
    this.#unsubscribe?.();
    this.#unsubscribe = null;
  }
}

/**
 * Drop-in replacement for `@stellar/freighter-api` (v6) backed by MetaMask.
 *
 * dApps written against Freighter can switch with a bundler alias, e.g. Vite:
 *
 * ```ts
 * resolve: { alias: { '@stellar/freighter-api': '/src/freighter-metamask.ts' } }
 * ```
 *
 * where that file does `export default createFreighterApi({...}); export const { getAddress, ... } = api;`.
 */
export function createFreighterApi(
  adapterOrOptions: HybridStellarAdapter | HybridAdapterOptions = {},
) {
  const adapter =
    adapterOrOptions instanceof HybridStellarAdapter
      ? adapterOrOptions
      : new HybridStellarAdapter(adapterOrOptions);

  /** Freighter's `isConnected` means "the wallet is installed". */
  const isConnected = async () => ({ isConnected: await adapter.isAvailable() });

  const ensureConnected = async () => {
    const current = await adapter.getAddress();
    return current.error ? adapter.restore() : current;
  };

  const requestAccess = () => adapter.requestAccess();

  const setAllowed = async () => {
    const result = await adapter.requestAccess();
    return result.error ? { isAllowed: false, error: result.error } : { isAllowed: true };
  };

  const getAddress = async () => {
    const result = await ensureConnected();
    // Freighter returns an empty address (no error) when the dApp is not allowed yet.
    return result.error ? { address: '' } : result;
  };

  const withConnection =
    <Args extends unknown[], Result>(fn: (...args: Args) => Promise<Result>) =>
    async (...args: Args) => {
      await ensureConnected();
      return fn(...args);
    };

  /** Polls for account / network changes, like Freighter's WatchWalletChanges. */
  class WatchWalletChanges extends WalletChangesWatcher {
    constructor(timeout = 3000) {
      super(adapter, timeout);
    }
  }

  return {
    adapter,
    isConnected,
    isAllowed: () => adapter.isAllowed(),
    setAllowed,
    requestAccess,
    getAddress,
    getNetwork: withConnection(() => adapter.getNetwork()),
    getNetworkDetails: withConnection(() => adapter.getNetworkDetails()),
    signTransaction: withConnection(
      (xdr: string, opts?: { networkPassphrase?: string; address?: string }) =>
        adapter.signTransaction(xdr, opts),
    ),
    signAuthEntry: withConnection(
      (entryXdr: string, opts?: { networkPassphrase?: string; address?: string }) =>
        adapter.signAuthEntry(entryXdr, opts),
    ),
    signMessage: withConnection(
      (message: string, opts?: { networkPassphrase?: string; address?: string }) =>
        adapter.signMessage(message, opts),
    ),
    addToken: async (_args: { contractId: string; networkPassphrase?: string }) => ({
      contractId: '',
      error: { code: -3 as const, message: 'addToken is not supported by MetaMask.' },
    }),
    WatchWalletChanges: WatchWalletChanges as new (timeout?: number) => WalletChangesWatcher,
  };
}

export type FreighterCompatibleApi = ReturnType<typeof createFreighterApi>;
