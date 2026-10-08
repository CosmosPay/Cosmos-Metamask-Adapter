import { NETWORKS } from '@/config/networks';
import type { RegistryAsset, RegistrySource } from '@/services/assets';
import {
  BUNDLED_REGISTRY,
  BUNDLED_REGISTRY_VERSION,
  createRegistry,
  findAsset,
  liveRegistrySource,
  mainnetCounterpart,
  pricingAssetId,
} from '@/services/assets';
import type { CosmosClient } from '@/services/cosmosApi';
import { classicAssetId, XLM_ASSET_ID } from '@/services/prices';
import { USDC_ISSUER } from '@test/unit/fixtures';

const MAINNET_USDC = 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

describe('bundled registry', () => {
  it.each(['mainnet', 'testnet'] as const)('%s lists XLM first and has unique (code, issuer) pairs', (network) => {
    const assets = BUNDLED_REGISTRY[network];
    expect(assets[0]).toMatchObject({ code: 'XLM', issuer: null, issuerName: 'Stellar' });
    const keys = assets.map((asset) => `${asset.code}:${asset.issuer}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('only ships well-formed issuers', () => {
    for (const asset of [...BUNDLED_REGISTRY.mainnet, ...BUNDLED_REGISTRY.testnet].filter((entry) => entry.issuer)) {
      expect(asset.issuer).toMatch(/^G[A-Z2-7]{55}$/u);
    }
  });

  it('has a version the live registry must match or beat', () => {
    expect(BUNDLED_REGISTRY_VERSION).toBeGreaterThanOrEqual(2);
  });
});

describe('createRegistry', () => {
  const live: RegistryAsset[] = [
    { code: 'XLM', issuer: null, name: 'Stellar Lumens', issuerName: 'Stellar', issuerDomain: '', verified: true },
  ];

  it('prefers the live source and caches it for an hour', async () => {
    let now = 0;
    const source: RegistrySource = { assets: jest.fn(async () => live) };
    const getRegistry = createRegistry(source, () => now);

    expect(await getRegistry(NETWORKS.testnet)).toBe(live);
    now = 59 * 60 * 1000;
    await getRegistry(NETWORKS.testnet);
    expect(source.assets).toHaveBeenCalledTimes(1);
  });

  it('falls back to the bundled copy and retries a minute later', async () => {
    let now = 0;
    const source: RegistrySource = { assets: jest.fn(async () => null) };
    const getRegistry = createRegistry(source, () => now);

    expect(await getRegistry(NETWORKS.testnet)).toBe(BUNDLED_REGISTRY.testnet);
    now = 61 * 1000;
    await getRegistry(NETWORKS.testnet);
    expect(source.assets).toHaveBeenCalledTimes(2);
  });
});

describe('liveRegistrySource', () => {
  const client = (body: unknown, keys: Record<string, string> = { testnet: 'K' }) => {
    const calls: { network: string; path: string }[] = [];
    const fake: CosmosClient = {
      apiKey: async (network) => keys[network] ?? '',
      async request<Result>(network: string, path: string) {
        calls.push({ network, path });
        return body as Result;
      },
    };
    return { fake, calls };
  };

  it('reads mainnet with the testnet key when that is the only one', async () => {
    const { fake, calls } = client({ version: BUNDLED_REGISTRY_VERSION, data: [] });
    expect(await liveRegistrySource(fake).assets('mainnet')).toEqual([]);
    expect(calls).toEqual([{ network: 'testnet', path: '/v1/assets?network=public' }]);
  });

  it('ignores registries older than the bundled one', async () => {
    const { fake } = client({ version: BUNDLED_REGISTRY_VERSION - 1, data: [] });
    expect(await liveRegistrySource(fake).assets('testnet')).toBeNull();
  });

  it('labels XLM as Stellar whatever the server calls it', async () => {
    const { fake } = client({
      version: BUNDLED_REGISTRY_VERSION,
      data: [
        { code: 'XLM', issuer: null, name: 'Lumens', issuerName: 'Stellar network', issuerDomain: '', verified: true },
      ],
    });
    expect((await liveRegistrySource(fake).assets('testnet'))?.[0]?.issuerName).toBe('Stellar');
  });

  it('has nothing for futurenet', async () => {
    expect(await liveRegistrySource(client({}).fake).assets('futurenet')).toBeNull();
  });
});

describe('pricing', () => {
  const testnet = BUNDLED_REGISTRY.testnet;

  it('prices XLM on every network and classic assets directly on mainnet', () => {
    expect(pricingAssetId('XLM', null, 'futurenet', [])).toBe(XLM_ASSET_ID);
    expect(pricingAssetId('ABC', USDC_ISSUER, 'mainnet', [])).toBe(classicAssetId('ABC', USDC_ISSUER));
  });

  it("estimates Circle's testnet USDC with mainnet USDC", () => {
    expect(findAsset(testnet, 'USDC', USDC_ISSUER)?.issuerName).toBe('Circle');
    expect(pricingAssetId('USDC', USDC_ISSUER, 'testnet', testnet)).toBe(classicAssetId('USDC', MAINNET_USDC));
    expect(mainnetCounterpart({ code: 'USDC', issuer: USDC_ISSUER, issuerName: 'Circle' })?.issuer).toBe(MAINNET_USDC);
  });

  it('gives unknown test assets no price', () => {
    expect(pricingAssetId('FAKE', USDC_ISSUER, 'testnet', testnet)).toBeNull();
  });
});
