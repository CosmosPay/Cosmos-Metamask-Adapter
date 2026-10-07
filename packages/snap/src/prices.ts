import { pricingPreferences } from './i18n';

/** CAIP-19 id of native XLM on mainnet (prices only exist for pubnet). */
export const XLM_ASSET_ID = 'stellar:pubnet/slip44:148';

export type AssetPrice = {
  currency: string;
  price: number;
  /** 24h price change, in percent. */
  change24h: number | null;
};

export type PriceMap = Record<string, AssetPrice>;

/** CAIP-19 id for a classic Stellar asset, as MetaMask's APIs expect it. */
export const classicAssetId = (code: string, issuer: string) =>
  `stellar:pubnet/asset:${code}-${issuer}`;

type MetaMaskSpotPrice = { price?: number; pricePercentChange1d?: number | null };

/**
 * Prices from MetaMask's own price API (what the extension uses), falling back
 * to CoinGecko for XLM. Honors MetaMask's "use external pricing data" setting.
 *
 * @param assetIds - CAIP-19 ids (mainnet).
 * @returns Prices keyed by asset id; missing ids have no price.
 */
export async function fetchPrices(assetIds: string[]): Promise<PriceMap> {
  const { currency, enabled } = pricingPreferences();
  if (!enabled || assetIds.length === 0) {
    return {};
  }

  try {
    const response = await fetch(
      `https://price.api.cx.metamask.io/v3/spot-prices?assetIds=${assetIds
        .map(encodeURIComponent)
        .join(',')}&vsCurrency=${encodeURIComponent(currency)}&includeMarketData=true`,
    );
    if (response.ok) {
      const body = (await response.json()) as Record<string, MetaMaskSpotPrice | null>;
      const prices: PriceMap = {};
      for (const [id, entry] of Object.entries(body)) {
        if (typeof entry?.price === 'number') {
          prices[id] = {
            currency,
            price: entry.price,
            change24h: entry.pricePercentChange1d ?? null,
          };
        }
      }
      if (prices[XLM_ASSET_ID] || !assetIds.includes(XLM_ASSET_ID)) {
        return prices;
      }
    }
  } catch {
    // Fall through to CoinGecko.
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=${encodeURIComponent(currency)}&include_24hr_change=true`,
    );
    const body = (await response.json()) as { stellar?: Record<string, number> };
    const price = body.stellar?.[currency];
    return typeof price === 'number'
      ? {
          [XLM_ASSET_ID]: {
            currency,
            price,
            change24h: body.stellar?.[`${currency}_24h_change`] ?? null,
          },
        }
      : {};
  } catch {
    return {};
  }
}
