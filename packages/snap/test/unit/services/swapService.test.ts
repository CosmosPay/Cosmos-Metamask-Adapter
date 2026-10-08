import { Keypair } from '@stellar/stellar-sdk/base';

import { NETWORKS } from '@/config/networks';
import { ValidationError } from '@/domain/errors';
import type { SwapProvider } from '@/domain/swap';
import { fetchAccount } from '@/services/horizon';
import {
  estimateSwap,
  executeSwap,
  quoteSwap,
  swapProviderName,
  swapsAvailable,
  useSwapProviders,
} from '@/services/swap';
import { horizonAccount, quote, USDC, XLM } from '@test/unit/fixtures';

jest.mock('@/services/horizon', () => ({ fetchAccount: jest.fn() }));

const fakeProvider = (overrides: Partial<SwapProvider> = {}): SwapProvider => ({
  id: 'fake',
  name: 'Fake DEX',
  supports: (network) => network.id === 'testnet',
  quote: jest.fn(async () => quote({ provider: 'fake' })),
  execute: jest.fn(async () => ({ hash: 'h', explorerUrl: 'x' })),
  ...overrides,
});

describe('swap service', () => {
  const keypair = Keypair.random();
  let provider: SwapProvider;
  let previous: SwapProvider[];

  beforeEach(() => {
    provider = fakeProvider();
    previous = useSwapProviders([provider]);
    jest.mocked(fetchAccount).mockResolvedValue(horizonAccount(keypair.publicKey(), { xlm: '100', usdc: '0' }));
  });

  afterEach(() => {
    useSwapProviders(previous);
  });

  it('is available only where a provider serves the network', () => {
    expect(swapsAvailable(NETWORKS.testnet)).toBe(true);
    expect(swapsAvailable(NETWORKS.mainnet)).toBe(false);
  });

  it('validates before asking the provider for a price', async () => {
    await expect(quoteSwap(NETWORKS.testnet, keypair, { from: XLM, to: XLM, amount: '1' })).rejects.toBeInstanceOf(
      ValidationError,
    );
    await expect(quoteSwap(NETWORKS.testnet, keypair, { from: XLM, to: USDC, amount: '1000' })).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(provider.quote).not.toHaveBeenCalled();
  });

  it('quotes through the provider once the account can swap', async () => {
    const result = await quoteSwap(NETWORKS.testnet, keypair, { from: XLM, to: USDC, amount: '10' });
    expect(result.provider).toBe('fake');
    expect(swapProviderName(result)).toBe('Fake DEX');
  });

  it('estimates without loading the account', async () => {
    await estimateSwap(NETWORKS.testnet, { from: XLM, to: USDC, amount: '10' });
    expect(fetchAccount).not.toHaveBeenCalled();
  });

  it('refuses where no provider runs', async () => {
    await expect(estimateSwap(NETWORKS.mainnet, { from: XLM, to: USDC, amount: '10' })).rejects.toThrow();
    expect(provider.quote).not.toHaveBeenCalled();
  });

  it('executes with the provider that priced the quote', async () => {
    const other = fakeProvider({ id: 'other', name: 'Other' });
    useSwapProviders([other, provider]);
    await executeSwap(NETWORKS.testnet, keypair, quote({ provider: 'fake' }));
    expect(provider.execute).toHaveBeenCalled();
    expect(other.execute).not.toHaveBeenCalled();
    await expect(executeSwap(NETWORKS.testnet, keypair, quote({ provider: 'gone' }))).rejects.toThrow();
  });
});
