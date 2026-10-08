import type { NetworkConfig, StellarNetwork } from '@/config/networks';
import type { CosmosClient } from '@/services/cosmosApi';
import { cosmosClient, cosmosServesNetwork } from '@/services/cosmosApi';
import { classicAssetId, XLM_ASSET_ID } from '@/services/prices';
import bundled from '@/services/assets/bundledRegistry.json';

/**
 * Stellar asset as published by the Cosmos Pay asset registry
 * (`GET /v1/assets` on api.cosmospay.lat). Identity is (code, issuer).
 */
export type RegistryAsset = {
  code: string;
  /** null for native XLM. */
  issuer: string | null;
  name: string;
  /** Organization behind the issuer, e.g. "Circle". */
  issuerName: string;
  issuerDomain: string;
  /** The issuer's identity was checked by Cosmos Pay. */
  verified: boolean;
};

export const NATIVE_ASSET: RegistryAsset = {
  code: 'XLM',
  issuer: null,
  name: 'Stellar Lumens',
  issuerName: 'Stellar',
  issuerDomain: 'stellar.org',
  verified: true,
};

/** XLM always reads "Stellar", whatever label a source gives it. */
const normalize = (assets: RegistryAsset[]) =>
  assets.map((asset) => (asset.issuer === null ? { ...NATIVE_ASSET, ...asset, issuerName: 'Stellar' } : asset));

/** Bundled copy (`npm run sync:registry`), for an unreachable gateway. */
export const BUNDLED_REGISTRY_VERSION = bundled.version;

export const BUNDLED_REGISTRY: Record<StellarNetwork, RegistryAsset[]> = {
  mainnet: normalize(bundled.mainnet),
  testnet: normalize(bundled.testnet),
  futurenet: [NATIVE_ASSET],
};

/** Where the registry for a network comes from (Strategy). Null means "not available". */
export type RegistrySource = {
  assets(network: StellarNetwork): Promise<RegistryAsset[] | null>;
};

/**
 * The live registry. Any ledger's key may read any ledger's registry, so the
 * other ledger's key is tried when this one has none. Copies older than the
 * bundled one are ignored.
 *
 * @param client - Cosmos Pay client.
 * @returns The source.
 */
export function liveRegistrySource(client: CosmosClient = cosmosClient): RegistrySource {
  return {
    async assets(network) {
      if (!cosmosServesNetwork(network)) {
        return null;
      }
      try {
        const body = await client.request<{ version?: number; data?: RegistryAsset[] }>(
          (await client.apiKey(network)) ? network : network === 'mainnet' ? 'testnet' : 'mainnet',
          `/v1/assets?network=${network === 'mainnet' ? 'public' : 'testnet'}`,
        );
        return Array.isArray(body.data) && (body.version ?? 0) >= BUNDLED_REGISTRY_VERSION
          ? normalize(body.data)
          : null;
      } catch {
        // Gateway unreachable (CORS, offline…).
        return null;
      }
    },
  };
}

const REGISTRY_TTL_MS = 60 * 60 * 1000;
/** A bundled fallback is retried after a minute rather than held for an hour. */
const FALLBACK_TTL_MS = 60 * 1000;

/**
 * Registry with the live source first, the bundled copy as fallback, and a
 * cache (1 h for live answers, 1 min for fallbacks).
 *
 * @param source - Primary source.
 * @param now - Clock (injected for tests).
 * @returns `getRegistry(network)`.
 */
export function createRegistry(source: RegistrySource = liveRegistrySource(), now: () => number = Date.now) {
  const cache = new Map<StellarNetwork, { until: number; assets: RegistryAsset[] }>();
  return async (network: NetworkConfig): Promise<RegistryAsset[]> => {
    const hit = cache.get(network.id);
    if (hit && now() < hit.until) {
      return hit.assets;
    }
    const live = await source.assets(network.id);
    const assets = live ?? BUNDLED_REGISTRY[network.id];
    cache.set(network.id, { until: now() + (live ? REGISTRY_TTL_MS : FALLBACK_TTL_MS), assets });
    return assets;
  };
}

/** The Cosmos Pay asset registry for a network (verified first). */
export const getRegistry = createRegistry();

/**
 * Registry entry for an asset, if Cosmos Pay knows it.
 *
 * @param registry - Registry for the network.
 * @param code - Asset code.
 * @param issuer - Issuer (null for XLM).
 * @returns The entry.
 */
export const findAsset = (registry: RegistryAsset[], code: string, issuer: string | null) =>
  registry.find((asset) => asset.code === code && asset.issuer === issuer);

/**
 * The mainnet asset a (possibly test-network) asset corresponds to: itself on
 * mainnet, else the verified mainnet asset with the same code and organization
 * (e.g. Circle's testnet USDC → mainnet USDC).
 *
 * @param asset - Registry asset.
 * @returns The mainnet entry, if any.
 */
export const mainnetCounterpart = (asset: Pick<RegistryAsset, 'code' | 'issuer' | 'issuerName'>) =>
  BUNDLED_REGISTRY.mainnet.find((candidate) => candidate.code === asset.code && candidate.issuer === asset.issuer) ??
  BUNDLED_REGISTRY.mainnet.find(
    (candidate) => candidate.code === asset.code && candidate.issuerName === asset.issuerName,
  );

/**
 * CAIP-19 id used to price an asset. Prices only exist on mainnet, so verified
 * test-network copies are estimated with their mainnet counterpart.
 *
 * @param code - Asset code.
 * @param issuer - Issuer (null for XLM).
 * @param network - Network id.
 * @param registry - Registry for the network.
 * @returns The id, or null when there's no market price.
 */
export function pricingAssetId(
  code: string,
  issuer: string | null,
  network: StellarNetwork,
  registry: RegistryAsset[],
): string | null {
  if (issuer === null) {
    return XLM_ASSET_ID;
  }
  if (network === 'mainnet') {
    return classicAssetId(code, issuer);
  }
  const entry = findAsset(registry, code, issuer);
  const mainnet = entry?.verified ? mainnetCounterpart(entry) : undefined;
  return mainnet?.issuer ? classicAssetId(mainnet.code, mainnet.issuer) : null;
}
