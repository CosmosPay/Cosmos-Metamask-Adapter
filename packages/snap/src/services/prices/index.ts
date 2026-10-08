import { pricingPreferences } from '@/i18n';
import {
  cachedPriceSource,
  coinGeckoPriceSource,
  fallbackPriceSource,
  metaMaskPriceSource,
} from '@/services/prices/sources';
import type { PriceMap, PriceSource } from '@/services/prices/types';

export type { AssetPrice, PriceMap, PriceSource } from '@/services/prices/types';
export { classicAssetId, XLM_ASSET_ID } from '@/services/prices/types';
export {
  cachedPriceSource,
  coinGeckoPriceSource,
  fallbackPriceSource,
  metaMaskPriceSource,
} from '@/services/prices/sources';

const PRICE_TTL_MS = 60_000;

/** MetaMask first (what the extension shows), CoinGecko for XLM if it fails. */
let source: PriceSource = cachedPriceSource(
  fallbackPriceSource(metaMaskPriceSource(), coinGeckoPriceSource()),
  PRICE_TTL_MS,
);

/**
 * Replaces the price source (dependency injection point for tests or a new
 * provider).
 *
 * @param next - The source to use.
 * @returns The previous source.
 */
export function usePriceSource(next: PriceSource): PriceSource {
  const previous = source;
  source = next;
  return previous;
}

/**
 * Prices in the user's currency, honoring MetaMask's "use external pricing
 * data" setting.
 *
 * @param assetIds - CAIP-19 ids (mainnet).
 * @returns Prices keyed by asset id; missing ids have no price.
 */
export async function fetchPrices(assetIds: string[]): Promise<PriceMap> {
  const { currency, enabled } = pricingPreferences();
  if (!enabled || assetIds.length === 0) {
    return {};
  }
  return source.prices(assetIds, currency);
}
