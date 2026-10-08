/** CAIP-19 id of native XLM on mainnet (prices only exist for pubnet). */
export const XLM_ASSET_ID = 'stellar:pubnet/slip44:148';

/** CAIP-19 id for a classic Stellar asset, as MetaMask's APIs expect it. */
export const classicAssetId = (code: string, issuer: string) => `stellar:pubnet/asset:${code}-${issuer}`;

export type AssetPrice = {
  currency: string;
  price: number;
  /** 24h price change, in percent. */
  change24h: number | null;
};

/** Prices keyed by CAIP-19 id; an id without a price is simply absent. */
export type PriceMap = Record<string, AssetPrice>;

/**
 * A place prices come from (Strategy). Sources never throw: an unreachable
 * source answers `{}`, so they can be chained and cached freely.
 */
export type PriceSource = {
  readonly name: string;
  prices(assetIds: string[], currency: string): Promise<PriceMap>;
};
