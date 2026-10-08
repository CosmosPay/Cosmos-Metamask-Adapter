import {
  createFreighterApi,
  HybridStellarAdapter,
  MetaMaskStellarModule,
  NETWORK_PASSPHRASES,
  StellarWalletError,
  toSep43Error,
} from '@/index';
import type { EIP1193Provider, OfficialAdapterLike, StellarNetwork } from '@/index';

const SNAP_ADDRESS = 'GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6';
const OFFICIAL_ADDRESS = 'GBAW5XGWORWVFE2XTJYDTLDHXTY2Q2MO73HYCGB3XMFMQ562Q2W2GJQX';
const EVM = '0x1111111111111111111111111111111111111111';

const NETWORK_INFO = {
  mainnet: { sep43Name: 'PUBLIC', rpcUrl: null },
  testnet: { sep43Name: 'TESTNET', rpcUrl: 'https://soroban-testnet.stellar.org' },
  futurenet: { sep43Name: 'FUTURENET', rpcUrl: 'https://rpc-futurenet.stellar.org' },
} as const;

/** In-memory MetaMask + Stellar Snap. */
function fakeMetaMask(initialNetwork: StellarNetwork = 'testnet') {
  const calls: { method: string; params?: any }[] = [];
  let network = initialNetwork;
  let installed = false;

  const info = () => ({
    network,
    name: network,
    sep43Name: NETWORK_INFO[network].sep43Name,
    chainId: `stellar:${network === 'mainnet' ? 'pubnet' : network}`,
    networkPassphrase: NETWORK_PASSPHRASES[network],
    horizonUrl: `https://horizon-${network}.example`,
    rpcUrl: NETWORK_INFO[network].rpcUrl,
  });

  const snapMethods: Record<string, (params: any) => unknown> = {
    stellar_getAddress: () => ({ address: SNAP_ADDRESS }),
    stellar_getNetwork: () => info(),
    stellar_switchNetwork: ({ network: next }) => {
      network = next;
      return info();
    },
    stellar_signTransaction: ({ xdr }) => ({ signedTxXdr: `snap-signed:${xdr}`, signerAddress: SNAP_ADDRESS }),
    stellar_signAuthEntry: () => ({ signedAuthEntry: 'snap-sig', signerAddress: SNAP_ADDRESS }),
    stellar_signMessage: () => ({ signedMessage: 'snap-msg', signerAddress: SNAP_ADDRESS }),
    stellar_getLinkMessage: ({ evmAddress }) => ({ message: `link ${evmAddress}` }),
    stellar_linkEvmAddress: ({ evmAddress, evmSignature }) => ({
      evmAddress,
      stellarAddress: SNAP_ADDRESS,
      message: `link ${evmAddress}`,
      evmSignature,
      stellarSignature: 'x',
      linkedAt: 1,
    }),
  };

  const provider: EIP1193Provider = {
    async request({ method, params }) {
      calls.push({ method, params });
      switch (method) {
        case 'wallet_requestSnaps':
          installed = true;
          return {};
        case 'wallet_getSnaps':
          return installed ? { 'npm:@cosmosapp/stellar-snap': {} } : {};
        case 'wallet_invokeSnap': {
          const { request } = params as { request: { method: string; params: unknown } };
          return snapMethods[request.method]!(request.params);
        }
        case 'eth_requestAccounts':
          return [EVM];
        case 'personal_sign':
          return `0x${'ab'.repeat(65)}`;
        default:
          throw new Error(`unexpected ${method}`);
      }
    },
  };

  const snapCalls = () =>
    calls
      .filter((call) => call.method === 'wallet_invokeSnap')
      .map((call) => call.params.request as { method: string; params: any });

  return { provider, calls, snapCalls };
}

type OfficialBehavior = 'ok' | 'unsupported' | 'rejected';

function fakeOfficial(behavior: OfficialBehavior = 'ok') {
  const calls: string[] = [];
  const official: OfficialAdapterLike = {
    async requestAccess() {
      calls.push('requestAccess');
      if (behavior === 'unsupported') {
        return { address: '', error: { code: -1, message: 'Unknown scope stellar:pubnet' } };
      }
      if (behavior === 'rejected') {
        return { address: '', error: { code: 4001, message: 'User rejected the request.' } };
      }
      return { address: OFFICIAL_ADDRESS };
    },
    async isAllowed() {
      return { isAllowed: behavior === 'ok' };
    },
    async signTransaction(xdr, opts) {
      calls.push(`signTransaction:${opts?.networkPassphrase}`);
      return { signedTxXdr: `official-signed:${xdr}`, signerAddress: OFFICIAL_ADDRESS };
    },
    async signAuthEntry() {
      calls.push('signAuthEntry');
      return { signedAuthEntry: 'official-sig', signerAddress: OFFICIAL_ADDRESS };
    },
    async signMessage() {
      calls.push('signMessage');
      return { signedMessage: null, signerAddress: '', error: { code: -4, message: 'Unknown network' } };
    },
    async disconnect() {
      calls.push('disconnect');
      return {};
    },
  };
  return { official, calls };
}

function setup(network: StellarNetwork = 'testnet', behavior: OfficialBehavior = 'ok') {
  const metamask = fakeMetaMask(network);
  const { official, calls: officialCalls } = fakeOfficial(behavior);
  const adapter = new HybridStellarAdapter({
    provider: metamask.provider,
    createOfficialAdapter: async () => official,
    pollIntervalMs: 0,
  });
  return { adapter, metamask, officialCalls };
}

describe('HybridStellarAdapter routing', () => {
  it('uses the snap on testnet and never touches the official adapter', async () => {
    const { adapter, metamask, officialCalls } = setup('testnet');

    expect(await adapter.requestAccess()).toEqual({ address: SNAP_ADDRESS });
    expect(adapter.backend).toBe('snap');
    expect(await adapter.getNetwork()).toEqual({
      network: 'TESTNET',
      networkPassphrase: NETWORK_PASSPHRASES.testnet,
    });

    const signed = await adapter.signTransaction('AAAA');
    expect(signed).toEqual({ signedTxXdr: 'snap-signed:AAAA', signerAddress: SNAP_ADDRESS });
    // No accountIndex: the snap signs with the account the user selected.
    expect(metamask.snapCalls().at(-1)?.params).toEqual({
      network: 'testnet',
      xdr: 'AAAA',
    });
    expect(officialCalls).toEqual([]);
  });

  it('uses MetaMask official Stellar support on mainnet', async () => {
    const { adapter, officialCalls } = setup('mainnet');

    expect(await adapter.requestAccess()).toEqual({ address: OFFICIAL_ADDRESS });
    expect(adapter.backend).toBe('official');

    const signed = await adapter.signTransaction('BBBB');
    expect(signed.signedTxXdr).toBe('official-signed:BBBB');
    expect(officialCalls).toEqual(['requestAccess', `signTransaction:${NETWORK_PASSPHRASES.mainnet}`]);
  });

  it('falls back to the snap when MetaMask has no built-in Stellar support', async () => {
    const { adapter } = setup('mainnet', 'unsupported');
    expect(await adapter.requestAccess()).toEqual({ address: SNAP_ADDRESS });
    expect(adapter.backend).toBe('snap');
    expect((await adapter.signAuthEntry('preimage')).signedAuthEntry).toBe('snap-sig');
  });

  it('does not fall back when the user rejects the official connection', async () => {
    const { adapter, metamask } = setup('mainnet', 'rejected');
    const result = await adapter.requestAccess();
    expect(result.address).toBe('');
    expect(result.error?.code).toBe(-4);
    expect(!metamask.snapCalls().some((call) => call.method === 'stellar_getAddress')).toBeTruthy();
  });

  it('routes by networkPassphrase per call', async () => {
    const { adapter, metamask, officialCalls } = setup('testnet');
    await adapter.requestAccess();

    const signed = await adapter.signAuthEntry('preimage', {
      networkPassphrase: NETWORK_PASSPHRASES.mainnet,
    });
    expect(signed.signedAuthEntry).toBe('official-sig');
    expect(officialCalls.includes('signAuthEntry')).toBeTruthy();

    await adapter.signAuthEntry('preimage', { networkPassphrase: NETWORK_PASSPHRASES.futurenet });
    expect(metamask.snapCalls().at(-1)?.params.network).toBe('futurenet');

    const unknown = await adapter.signTransaction('X', { networkPassphrase: 'nope' });
    expect(unknown.error?.code).toBe(-3);
  });

  it('maps the official "unsupported network" -4 to SEP-43 invalid request (-3)', async () => {
    const { adapter } = setup('mainnet');
    await adapter.requestAccess();
    const result = await adapter.signMessage('hola');
    expect(result.error?.code).toBe(-3);
  });

  it('switches backend and notifies listeners when the network changes', async () => {
    const { adapter } = setup('testnet');
    await adapter.requestAccess();
    const events: unknown[] = [];
    const unsubscribe = adapter.onChange((event) => events.push(event));

    await adapter.switchNetwork('mainnet');
    expect(adapter.backend).toBe('official');
    expect(events.at(-1)).toEqual({
      address: OFFICIAL_ADDRESS,
      network: 'PUBLIC',
      networkPassphrase: NETWORK_PASSPHRASES.mainnet,
      backend: 'official',
    });

    await adapter.switchNetwork('futurenet');
    expect(adapter.backend).toBe('snap');
    unsubscribe();
  });

  it('links the EVM account with personal_sign over the snap message', async () => {
    const { adapter, metamask } = setup('testnet');
    await adapter.requestAccess();
    const { link, error } = await adapter.linkEvmAddress();
    expect(error).toBe(undefined);
    expect(link?.evmAddress).toBe(EVM);

    const personalSign = metamask.calls.find((call) => call.method === 'personal_sign');
    const expectedHex = `0x${Buffer.from(`link ${EVM}`).toString('hex')}`;
    expect(personalSign?.params).toEqual([expectedHex, EVM]);
  });

  it('returns NOT_CONNECTED errors instead of throwing', async () => {
    const { adapter } = setup();
    expect((await adapter.getAddress()).error?.code).toBe(-3);
    expect((await adapter.signTransaction('X')).error?.code).toBe(-3);
  });
});

describe('MetaMaskStellarModule (Stellar Wallets Kit)', () => {
  it('connects on getAddress and throws coded errors', async () => {
    const metamask = fakeMetaMask('mainnet');
    const { official } = fakeOfficial('ok');
    const module = new MetaMaskStellarModule({
      provider: metamask.provider,
      createOfficialAdapter: async () => official,
      pollIntervalMs: 0,
    });

    expect(await module.getAddress()).toEqual({ address: OFFICIAL_ADDRESS });
    expect(await module.getNetwork()).toEqual({
      network: 'PUBLIC',
      networkPassphrase: NETWORK_PASSPHRASES.mainnet,
    });
    const error = await module.signMessage('hola').catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(StellarWalletError);
    expect(error).toMatchObject({ code: -3 });
  });
});

describe('createFreighterApi', () => {
  it('mirrors Freighter v6 shapes', async () => {
    const metamask = fakeMetaMask('testnet');
    const api = createFreighterApi({ provider: metamask.provider, pollIntervalMs: 0 });

    expect(await api.getAddress()).toEqual({ address: '' });
    expect(await api.requestAccess()).toEqual({ address: SNAP_ADDRESS });
    expect(await api.getNetworkDetails()).toEqual({
      network: 'TESTNET',
      networkUrl: 'https://horizon-testnet.example',
      networkPassphrase: NETWORK_PASSPHRASES.testnet,
      sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
    });
    expect(await api.signMessage('hi')).toEqual({
      signedMessage: 'snap-msg',
      signerAddress: SNAP_ADDRESS,
    });
    expect((await api.addToken({ contractId: 'C' })).error?.code).toBe(-3);
    expect(typeof new api.WatchWalletChanges(1000).watch).toBe('function');
  });
});

describe('toSep43Error', () => {
  it('maps common MetaMask errors', () => {
    expect(toSep43Error({ code: 4001, message: 'no' }).code).toBe(-4);
    expect(toSep43Error({ code: -32602, message: 'bad' }).code).toBe(-3);
    expect(toSep43Error(new Error('Horizon error 500 loading account.')).code).toBe(-2);
    expect(toSep43Error(new Error('boom')).code).toBe(-1);
  });
});
