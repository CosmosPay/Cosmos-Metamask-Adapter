import { isUserRejection, toSep43Error } from './errors.ts';
import { DEFAULT_SNAP_ID, findMetaMask, StellarSnapClient } from './snapClient.ts';
import type {
  Backend,
  ChangeEvent,
  EIP1193Provider,
  EvmLink,
  NetworkInfo,
  SignOptions,
  StellarNetwork,
  WithError,
} from './types.ts';
import { NETWORK_PASSPHRASES, networkFromPassphrase } from './types.ts';

/** The subset of `@metamask/connect-stellar`'s MetaMaskStellarAdapter we use. */
export type OfficialAdapterLike = {
  requestAccess(): Promise<{ address: string; error?: unknown }>;
  isAllowed(): Promise<{ isAllowed: boolean; error?: unknown }>;
  signTransaction(
    xdr: string,
    opts?: SignOptions,
  ): Promise<{ signedTxXdr: string; signerAddress: string; error?: unknown }>;
  signAuthEntry(
    authEntry: string,
    opts?: SignOptions,
  ): Promise<{ signedAuthEntry: string | null; signerAddress: string; error?: unknown }>;
  signMessage(
    message: string,
    opts?: SignOptions,
  ): Promise<{ signedMessage: string | null; signerAddress: string; error?: unknown }>;
  disconnect(options?: { revokeSession?: boolean }): Promise<{ error?: unknown }>;
  on?(event: string, listener: (data: unknown) => void): void;
};

export type HybridAdapterOptions = {
  /** Stellar Snap ID. Use `local:http://localhost:8080` while developing. */
  snapId?: string;
  snapVersion?: string;
  /**
   * SEP-0005 account index used with the snap. Omit it to follow the account
   * the user selects in the snap (recommended).
   */
  accountIndex?: number;
  /**
   * Who signs on mainnet. `official` (default) uses MetaMask's built-in Stellar
   * support when available and falls back to the snap if MetaMask lacks it.
   */
  mainnet?: Backend;
  /** EIP-1193 provider; discovered through EIP-6963 when omitted. */
  provider?: EIP1193Provider;
  /** Factory for the official adapter (injectable for tests). */
  createOfficialAdapter?: () => Promise<OfficialAdapterLike>;
  /** How often to look for network changes made outside this dApp. */
  pollIntervalMs?: number;
};

const defaultOfficialFactory = async (): Promise<OfficialAdapterLike> => {
  const { MetaMaskStellarAdapter } = await import('@metamask/connect-stellar');
  return new MetaMaskStellarAdapter() as unknown as OfficialAdapterLike;
};

const NOT_CONNECTED = { code: -3, message: 'Not connected. Call requestAccess() first.' } as const;

const hexEncode = (text: string) =>
  `0x${Array.from(new TextEncoder().encode(text), (byte) => byte.toString(16).padStart(2, '0')).join('')}`;

/**
 * SEP-43 wallet adapter for MetaMask.
 *
 * - Mainnet → MetaMask's official Stellar support (`@metamask/connect-stellar`),
 *   falling back to the Stellar Snap on MetaMask versions without it.
 * - Testnet / Futurenet → the Stellar Snap (the official support is mainnet only).
 *
 * Every method resolves with `{ ...result, error? }` like Freighter and SEP-43;
 * it never throws.
 */
export class HybridStellarAdapter {
  readonly name = 'MetaMask';
  readonly url = 'https://metamask.io';

  private readonly options: Required<
    Pick<HybridAdapterOptions, 'snapId' | 'mainnet' | 'pollIntervalMs'>
  > &
    HybridAdapterOptions;

  private provider: EIP1193Provider | null;
  private snapClient: StellarSnapClient | null = null;
  private official: OfficialAdapterLike | null = null;
  private officialUnavailable = false;
  private officialAddress: string | null = null;

  private networkInfo: NetworkInfo | null = null;
  private currentBackend: Backend = 'snap';
  private currentAddress: string | null = null;

  private readonly listeners = new Set<(event: ChangeEvent) => void>();
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor(options: HybridAdapterOptions = {}) {
    this.options = {
      snapId: DEFAULT_SNAP_ID,
      mainnet: 'official',
      pollIntervalMs: 4000,
      ...options,
    };
    this.provider = options.provider ?? null;
  }

  /** Which signer is active for the selected network. */
  get backend(): Backend {
    return this.currentBackend;
  }

  get snap(): StellarSnapClient {
    if (!this.snapClient) {
      throw new Error(NOT_CONNECTED.message);
    }
    return this.snapClient;
  }

  // --- Connection -----------------------------------------------------------

  async isAvailable(timeoutMs = 800): Promise<boolean> {
    return (await this.getProvider(timeoutMs)) !== null;
  }

  async requestAccess(): Promise<WithError<{ address: string }>> {
    try {
      const snap = await this.ensureSnapClient();
      await snap.connect(this.options.snapVersion);
      this.networkInfo = await snap.getNetwork();
      await this.selectBackend(true);
      this.emitChange();
      return { address: this.currentAddress as string };
    } catch (error) {
      return { address: '', error: toSep43Error(error) };
    }
  }

  /** Reconnects without prompting when this origin was already approved. */
  async restore(): Promise<WithError<{ address: string }>> {
    try {
      const snap = await this.ensureSnapClient();
      if (!(await snap.isInstalled())) {
        return { address: '', error: NOT_CONNECTED };
      }
      this.networkInfo = await snap.getNetwork();
      await this.selectBackend(false);
      return { address: this.currentAddress as string };
    } catch (error) {
      return { address: '', error: toSep43Error(error) };
    }
  }

  async isConnected(): Promise<WithError<{ isConnected: boolean }>> {
    return { isConnected: this.currentAddress !== null };
  }

  async isAllowed(): Promise<WithError<{ isAllowed: boolean }>> {
    try {
      const snap = await this.ensureSnapClient();
      return { isAllowed: await snap.isInstalled() };
    } catch (error) {
      return { isAllowed: false, error: toSep43Error(error) };
    }
  }

  async disconnect(): Promise<void> {
    this.stopPolling();
    await this.official?.disconnect().catch(() => undefined);
    this.officialAddress = null;
    this.currentAddress = null;
    this.networkInfo = null;
    this.currentBackend = 'snap';
  }

  // --- SEP-43 ---------------------------------------------------------------

  async getAddress(): Promise<WithError<{ address: string }>> {
    return this.currentAddress
      ? { address: this.currentAddress }
      : { address: '', error: NOT_CONNECTED };
  }

  async getNetwork(): Promise<WithError<{ network: string; networkPassphrase: string }>> {
    if (!this.networkInfo) {
      return { network: '', networkPassphrase: '', error: NOT_CONNECTED };
    }
    return {
      network: this.networkInfo.sep43Name,
      networkPassphrase: this.networkInfo.networkPassphrase,
    };
  }

  /** Freighter-style details, including the Soroban RPC for the network. */
  async getNetworkDetails(): Promise<
    WithError<{ network: string; networkUrl: string; networkPassphrase: string; sorobanRpcUrl?: string }>
  > {
    if (!this.networkInfo) {
      return { network: '', networkUrl: '', networkPassphrase: '', error: NOT_CONNECTED };
    }
    const info = this.networkInfo;
    return {
      network: info.sep43Name,
      networkUrl: info.horizonUrl,
      networkPassphrase: info.networkPassphrase,
      ...(info.rpcUrl ? { sorobanRpcUrl: info.rpcUrl } : {}),
    };
  }

  async signTransaction(
    xdr: string,
    opts: SignOptions & { submit?: boolean } = {},
  ): Promise<WithError<{ signedTxXdr: string; signerAddress: string }>> {
    try {
      const { backend, network } = await this.route(opts);
      if (backend === 'official') {
        if (opts.submit) {
          throw { code: -3, message: 'submit is only supported on testnet/futurenet (Stellar Snap).' };
        }
        return this.fromOfficial(
          await this.requireOfficial().signTransaction(xdr, this.officialOptions(opts)),
          { signedTxXdr: '', signerAddress: '' },
        );
      }
      const result = await this.snap.signTransaction(xdr, {
        ...this.snapParams(network, opts),
        ...(opts.submit ? { submit: true } : {}),
      });
      return { signedTxXdr: result.signedTxXdr, signerAddress: result.signerAddress };
    } catch (error) {
      return { signedTxXdr: '', signerAddress: '', error: toSep43Error(error) };
    }
  }

  /**
   * Signs a Soroban authorization entry.
   *
   * @param authEntry - base64 `HashIdPreimage` (SEP-43).
   * @param opts - Network / address.
   * @returns The base64 ed25519 signature of sha256(preimage).
   */
  async signAuthEntry(
    authEntry: string,
    opts: SignOptions = {},
  ): Promise<WithError<{ signedAuthEntry: string | null; signerAddress: string }>> {
    try {
      const { backend, network } = await this.route(opts);
      if (backend === 'official') {
        return this.fromOfficial(
          await this.requireOfficial().signAuthEntry(authEntry, this.officialOptions(opts)),
          { signedAuthEntry: null, signerAddress: '' },
        );
      }
      return await this.snap.signAuthEntry(authEntry, this.snapParams(network, opts));
    } catch (error) {
      return { signedAuthEntry: null, signerAddress: '', error: toSep43Error(error) };
    }
  }

  async signMessage(
    message: string,
    opts: SignOptions = {},
  ): Promise<WithError<{ signedMessage: string | null; signerAddress: string }>> {
    try {
      const { backend, network } = await this.route(opts);
      if (backend === 'official') {
        return this.fromOfficial(
          await this.requireOfficial().signMessage(message, this.officialOptions(opts)),
          { signedMessage: null, signerAddress: '' },
        );
      }
      return await this.snap.signMessage(message, this.snapParams(network, opts));
    } catch (error) {
      return { signedMessage: null, signerAddress: '', error: toSep43Error(error) };
    }
  }

  // --- Extensions -----------------------------------------------------------

  /** Asks the user to switch network (persisted in the snap). */
  async switchNetwork(network: StellarNetwork): Promise<WithError<{ network: string; networkPassphrase: string }>> {
    try {
      this.networkInfo = await this.snap.switchNetwork(network);
      await this.selectBackend(true);
      this.emitChange();
      return this.getNetwork();
    } catch (error) {
      return { network: '', networkPassphrase: '', error: toSep43Error(error) };
    }
  }

  /**
   * Proves that the user's MetaMask EVM account and Stellar account belong to
   * the same person: the EVM key signs (personal_sign), the snap verifies it,
   * co-signs with the Stellar key (SEP-53) and stores the link.
   */
  async linkEvmAddress(evmAddress?: string): Promise<WithError<{ link: EvmLink | null }>> {
    try {
      const provider = await this.requireProvider();
      const evm =
        evmAddress ??
        ((await provider.request({ method: 'eth_requestAccounts' })) as string[])[0];
      if (!evm) {
        throw { code: -3, message: 'No EVM account available.' };
      }
      const params = this.accountParams();
      const { message } = await this.snap.getLinkMessage(evm, params);
      const evmSignature = (await provider.request({
        method: 'personal_sign',
        params: [hexEncode(message), evm],
      })) as string;
      return { link: await this.snap.linkEvmAddress(evm, evmSignature, params) };
    } catch (error) {
      return { link: null, error: toSep43Error(error) };
    }
  }

  async getLinkedAddresses(): Promise<WithError<{ links: EvmLink[] }>> {
    try {
      return {
        links: await this.snap.getLinkedAddresses(this.accountParams()),
      };
    } catch (error) {
      return { links: [], error: toSep43Error(error) };
    }
  }

  /** Subscribes to account / network changes. */
  onChange(callback: (event: ChangeEvent) => void): () => void {
    this.listeners.add(callback);
    this.startPolling();
    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0) {
        this.stopPolling();
      }
    };
  }

  // --- Internals ------------------------------------------------------------

  private async getProvider(timeoutMs = 500): Promise<EIP1193Provider | null> {
    this.provider ??= await findMetaMask(timeoutMs);
    return this.provider;
  }

  private async requireProvider(): Promise<EIP1193Provider> {
    const provider = await this.getProvider();
    if (!provider) {
      throw { code: -1, message: 'MetaMask is not installed.' };
    }
    return provider;
  }

  private async ensureSnapClient(): Promise<StellarSnapClient> {
    this.snapClient ??= new StellarSnapClient(await this.requireProvider(), this.options.snapId);
    return this.snapClient;
  }

  /**
   * Connects MetaMask's official Stellar support.
   *
   * @param interactive - Whether a connection prompt is acceptable.
   * @returns The address, or null when unavailable (caller falls back to the snap).
   */
  private async tryOfficial(interactive: boolean): Promise<string | null> {
    if (this.officialAddress) {
      return this.officialAddress;
    }
    if (this.officialUnavailable || this.options.mainnet === 'snap') {
      return null;
    }
    try {
      if (!this.official) {
        this.official = await (this.options.createOfficialAdapter ?? defaultOfficialFactory)();
        this.official.on?.('accountsChanged', (address) => {
          if (typeof address === 'string') {
            this.officialAddress = address;
            if (this.currentBackend === 'official') {
              this.currentAddress = address;
              this.emitChange();
            }
          }
        });
      }
      if (!interactive && !(await this.official.isAllowed()).isAllowed) {
        return null;
      }
      const result = await this.official.requestAccess();
      if (result.error) {
        throw result.error;
      }
      this.officialAddress = result.address;
      return result.address;
    } catch (error) {
      if (isUserRejection(error)) {
        throw error;
      }
      // MetaMask without built-in Stellar support: use the snap instead.
      this.officialUnavailable = true;
      return null;
    }
  }

  private async selectBackend(interactive: boolean): Promise<void> {
    if (this.networkInfo?.network === 'mainnet') {
      const address = await this.tryOfficial(interactive);
      if (address) {
        this.currentBackend = 'official';
        this.currentAddress = address;
        return;
      }
    }
    this.currentBackend = 'snap';
    this.currentAddress = (await this.snap.getAddress(this.accountParams())).address;
  }

  private async route(opts: SignOptions): Promise<{ backend: Backend; network: StellarNetwork }> {
    if (!this.networkInfo) {
      throw NOT_CONNECTED;
    }
    const network = opts.networkPassphrase
      ? networkFromPassphrase(opts.networkPassphrase)
      : this.networkInfo.network;
    if (!network) {
      throw { code: -3, message: `Unsupported network passphrase: ${opts.networkPassphrase}` };
    }
    if (network === 'mainnet' && (await this.tryOfficial(true))) {
      return { backend: 'official', network };
    }
    return { backend: 'snap', network };
  }

  private requireOfficial(): OfficialAdapterLike {
    if (!this.official) {
      throw NOT_CONNECTED;
    }
    return this.official;
  }

  private officialOptions(opts: SignOptions): SignOptions {
    return {
      networkPassphrase: opts.networkPassphrase ?? NETWORK_PASSPHRASES.mainnet,
      ...(opts.address ? { address: opts.address } : {}),
    };
  }

  private accountParams(): { accountIndex?: number } {
    return this.options.accountIndex === undefined
      ? {}
      : { accountIndex: this.options.accountIndex };
  }

  private snapParams(network: StellarNetwork, opts: SignOptions) {
    return {
      network,
      ...this.accountParams(),
      ...(opts.address ? { address: opts.address } : {}),
    };
  }

  private fromOfficial<Result extends { error?: unknown }, Empty>(
    result: Result,
    empty: Empty,
  ): WithError<Omit<Result, 'error'>> | WithError<Empty> {
    if (result.error) {
      return { ...empty, error: toSep43Error(result.error, 'official') };
    }
    const { error: _ignored, ...rest } = result;
    return rest;
  }

  private emitChange(): void {
    if (!this.currentAddress || !this.networkInfo) {
      return;
    }
    const event: ChangeEvent = {
      address: this.currentAddress,
      network: this.networkInfo.sep43Name,
      networkPassphrase: this.networkInfo.networkPassphrase,
      backend: this.currentBackend,
    };
    for (const listener of this.listeners) {
      listener(event);
    }
  }

  private startPolling(): void {
    if (this.pollTimer || this.options.pollIntervalMs <= 0) {
      return;
    }
    this.pollTimer = setInterval(async () => {
      if (!this.snapClient || !this.networkInfo) {
        return;
      }
      try {
        const latest = await this.snapClient.getNetwork();
        const networkChanged = latest.network !== this.networkInfo.network;
        // The user can also switch accounts inside the snap.
        const accountChanged =
          !networkChanged &&
          this.currentBackend === 'snap' &&
          (await this.snapClient.getAddress(this.accountParams())).address !== this.currentAddress;
        if (networkChanged || accountChanged) {
          this.networkInfo = latest;
          await this.selectBackend(false);
          this.emitChange();
        }
      } catch {
        // Transient: MetaMask locked, snap busy, ...
      }
    }, this.options.pollIntervalMs);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }
}
