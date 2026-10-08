import type { PriceMap, PriceSource } from '@/services/prices/types';
import { XLM_ASSET_ID } from '@/services/prices/types';

type Fetch = typeof fetch;

type MetaMaskSpotPrice = {
  price?: number;
  pricePercentChange1d?: number | null;
};

/**
 * MetaMask's own spot-price API (what the extension shows), for any CAIP-19 id.
 *
 * @param fetchFn - HTTP client (injected for tests).
 * @returns The source.
 */
export function metaMaskPriceSource(fetchFn: Fetch = fetch): PriceSource {
  return {
    name: 'metamask',
    async prices(assetIds, currency) {
      try {
        const response = await fetchFn(
          `https://price.api.cx.metamask.io/v3/spot-prices?assetIds=${assetIds
            .map(encodeURIComponent)
            .join(',')}&vsCurrency=${encodeURIComponent(currency)}&includeMarketData=true`,
        );
        if (!response.ok) {
          return {};
        }
        const body = (await response.json()) as Record<string, MetaMaskSpotPrice | null>;
        const prices: PriceMap = {};
        for (const [id, entry] of Object.entries(body)) {
          if (typeof entry?.price === 'number') {
            prices[id] = { currency, price: entry.price, change24h: entry.pricePercentChange1d ?? null };
          }
        }
        return prices;
      } catch {
        return {};
      }
    },
  };
}

/**
 * CoinGecko, for native XLM only (it has no ids for classic Stellar assets).
 *
 * @param fetchFn - HTTP client (injected for tests).
 * @returns The source.
 */
export function coinGeckoPriceSource(fetchFn: Fetch = fetch): PriceSource {
  return {
    name: 'coingecko',
    async prices(assetIds, currency): Promise<PriceMap> {
      if (!assetIds.includes(XLM_ASSET_ID)) {
        return {};
      }
      try {
        const response = await fetchFn(
          `https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=${encodeURIComponent(currency)}&include_24hr_change=true`,
        );
        const body = (await response.json()) as { stellar?: Record<string, number> };
        const price = body.stellar?.[currency];
        return typeof price === 'number'
          ? { [XLM_ASSET_ID]: { currency, price, change24h: body.stellar?.[`${currency}_24h_change`] ?? null } }
          : {};
      } catch {
        return {};
      }
    },
  };
}

/**
 * Chain of responsibility: each next source is only asked for the ids the
 * previous ones couldn't price.
 *
 * @param sources - In priority order.
 * @returns A source combining them.
 */
export function fallbackPriceSource(...sources: PriceSource[]): PriceSource {
  return {
    name: sources.map((source) => source.name).join('>'),
    async prices(assetIds, currency) {
      const result: PriceMap = {};
      let missing = assetIds;
      for (const source of sources) {
        if (missing.length === 0) {
          break;
        }
        Object.assign(result, await source.prices(missing, currency));
        missing = missing.filter((id) => !result[id]);
      }
      return result;
    },
  };
}

/**
 * Decorator that reuses answers for `ttlMs`, so moving between screens doesn't
 * wait on the network every time. Empty answers aren't cached (a source may be
 * briefly unreachable).
 *
 * @param source - The source to cache.
 * @param ttlMs - How long an answer stays fresh.
 * @param now - Clock (injected for tests).
 * @returns The cached source.
 */
export function cachedPriceSource(source: PriceSource, ttlMs: number, now: () => number = Date.now): PriceSource {
  const cache = new Map<string, { at: number; prices: PriceMap }>();
  return {
    name: `cached(${source.name})`,
    async prices(assetIds, currency) {
      const key = `${currency}|${[...assetIds].sort().join(',')}`;
      const hit = cache.get(key);
      if (hit && now() - hit.at < ttlMs) {
        return hit.prices;
      }
      const prices = await source.prices(assetIds, currency);
      if (Object.keys(prices).length > 0) {
        cache.set(key, { at: now(), prices });
      }
      return prices;
    },
  };
}
