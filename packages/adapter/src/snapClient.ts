import type { EIP1193Provider, EvmLink, NetworkInfo, StellarNetwork } from '@/types';

export const DEFAULT_SNAP_ID = 'npm:@cosmospay/stellar-snap';

type EIP6963ProviderDetail = {
  info: { rdns: string; name: string };
  provider: EIP1193Provider;
};

/**
 * Finds MetaMask through EIP-6963 so other injected wallets don't interfere.
 *
 * @param timeoutMs - How long to wait for announcements.
 * @returns The MetaMask provider, or null.
 */
export async function findMetaMask(timeoutMs = 500): Promise<EIP1193Provider | null> {
  if (typeof window === 'undefined') {
    return null;
  }
  return new Promise((resolve) => {
    const onAnnounce = (event: Event) => {
      const { detail } = event as CustomEvent<EIP6963ProviderDetail>;
      if (detail?.info?.rdns?.startsWith('io.metamask')) {
        window.removeEventListener('eip6963:announceProvider', onAnnounce);
        resolve(detail.provider);
      }
    };
    window.addEventListener('eip6963:announceProvider', onAnnounce);
    window.dispatchEvent(new Event('eip6963:requestProvider'));
    setTimeout(() => {
      window.removeEventListener('eip6963:announceProvider', onAnnounce);
      resolve(null);
    }, timeoutMs);
  });
}

type CommonParams = {
  network?: StellarNetwork;
  networkPassphrase?: string;
  accountIndex?: number;
  address?: string;
};

/** Thin typed wrapper around `wallet_invokeSnap` for the Stellar Snap. */
export class StellarSnapClient {
  readonly provider: EIP1193Provider;
  readonly snapId: string;

  constructor(provider: EIP1193Provider, snapId: string = DEFAULT_SNAP_ID) {
    this.provider = provider;
    this.snapId = snapId;
  }

  /** Installs (if needed) and connects the snap. */
  async connect(version?: string): Promise<void> {
    await this.provider.request({
      method: 'wallet_requestSnaps',
      params: { [this.snapId]: version ? { version } : {} },
    });
  }

  async isInstalled(): Promise<boolean> {
    try {
      const snaps = (await this.provider.request({ method: 'wallet_getSnaps' })) as Record<string, unknown>;
      return Boolean(snaps?.[this.snapId]);
    } catch {
      return false;
    }
  }

  private invoke<Result>(method: string, params: object = {}): Promise<Result> {
    return this.provider.request({
      method: 'wallet_invokeSnap',
      params: { snapId: this.snapId, request: { method, params } },
    }) as Promise<Result>;
  }

  getAddress(params: CommonParams = {}) {
    return this.invoke<{ address: string }>('stellar_getAddress', params);
  }

  /** Accounts the user added in the snap, and which one is selected. */
  getAccounts() {
    return this.invoke<{
      selectedAccount: number;
      accounts: { index: number; name: string; address: string }[];
    }>('stellar_getAccounts');
  }

  getNetwork(params: CommonParams = {}) {
    return this.invoke<NetworkInfo>('stellar_getNetwork', params);
  }

  switchNetwork(network: StellarNetwork) {
    return this.invoke<NetworkInfo>('stellar_switchNetwork', { network });
  }

  getBalance(params: CommonParams = {}) {
    return this.invoke<{
      address: string;
      network: string;
      funded: boolean;
      balances: { balance: string; asset_type: string; asset_code?: string; asset_issuer?: string }[];
    }>('stellar_getBalance', params);
  }

  signTransaction(xdr: string, params: CommonParams & { submit?: boolean } = {}) {
    return this.invoke<{ signedTxXdr: string; signerAddress: string; hash?: string }>('stellar_signTransaction', {
      ...params,
      xdr,
    });
  }

  /** SEP-43: `authEntry` is a base64 HashIdPreimage; returns the base64 signature. */
  signAuthEntry(authEntry: string, params: CommonParams = {}) {
    return this.invoke<{ signedAuthEntry: string; signerAddress: string }>('stellar_signAuthEntry', {
      ...params,
      authEntry,
    });
  }

  /** SEP-53 signature, base64. */
  signMessage(message: string, params: CommonParams = {}) {
    return this.invoke<{ signedMessage: string; signerAddress: string }>('stellar_signMessage', {
      ...params,
      message,
    });
  }

  sendPayment(
    params: CommonParams & {
      destination: string;
      amount: string;
      assetCode?: string;
      assetIssuer?: string;
      memo?: string;
    },
  ) {
    return this.invoke<{ hash: string; ledger: number; explorerUrl: string }>('stellar_sendPayment', params);
  }

  getLinkMessage(evmAddress: string, params: CommonParams = {}) {
    return this.invoke<{ message: string }>('stellar_getLinkMessage', { ...params, evmAddress });
  }

  linkEvmAddress(evmAddress: string, evmSignature: string, params: CommonParams = {}) {
    return this.invoke<EvmLink>('stellar_linkEvmAddress', {
      ...params,
      evmAddress,
      evmSignature,
    });
  }

  getLinkedAddresses(params: CommonParams = {}) {
    return this.invoke<EvmLink[]>('stellar_getLinkedAddresses', params);
  }
}
