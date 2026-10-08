import type { PriceMap, PriceSource } from '@/services/prices';
import {
  cachedPriceSource,
  coinGeckoPriceSource,
  fallbackPriceSource,
  metaMaskPriceSource,
  XLM_ASSET_ID,
} from '@/services/prices';

const USDC_ID = 'stellar:pubnet/asset:USDC-GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';
const price = (value: number): PriceMap[string] => ({ currency: 'usd', price: value, change24h: null });

/** A source with fixed prices that records what it was asked. */
function fixedSource(name: string, prices: PriceMap) {
  const asked: string[][] = [];
  const source: PriceSource = {
    name,
    async prices(ids) {
      asked.push(ids);
      return Object.fromEntries(ids.filter((id) => prices[id]).map((id) => [id, prices[id] as PriceMap[string]]));
    },
  };
  return { source, asked };
}

const response = (body: unknown, ok = true) => ({ ok, json: async () => body }) as Response;

describe('fallbackPriceSource', () => {
  it('asks each next source only for what is still missing', async () => {
    const primary = fixedSource('a', { [USDC_ID]: price(1) });
    const backup = fixedSource('b', { [XLM_ASSET_ID]: price(0.3), [USDC_ID]: price(9) });
    const prices = await fallbackPriceSource(primary.source, backup.source).prices([XLM_ASSET_ID, USDC_ID], 'usd');

    expect(prices).toEqual({ [USDC_ID]: price(1), [XLM_ASSET_ID]: price(0.3) });
    expect(backup.asked).toEqual([[XLM_ASSET_ID]]);
  });

  it('stops once everything is priced', async () => {
    const primary = fixedSource('a', { [XLM_ASSET_ID]: price(0.3) });
    const backup = fixedSource('b', {});
    await fallbackPriceSource(primary.source, backup.source).prices([XLM_ASSET_ID], 'usd');
    expect(backup.asked).toEqual([]);
  });
});

describe('cachedPriceSource', () => {
  it('serves repeated questions from cache until the TTL passes', async () => {
    let now = 0;
    const inner = fixedSource('a', { [XLM_ASSET_ID]: price(0.3) });
    const cached = cachedPriceSource(inner.source, 1000, () => now);

    await cached.prices([XLM_ASSET_ID], 'usd');
    await cached.prices([XLM_ASSET_ID], 'usd');
    expect(inner.asked).toHaveLength(1);

    now = 1000;
    await cached.prices([XLM_ASSET_ID], 'usd');
    expect(inner.asked).toHaveLength(2);
  });

  it('does not cache empty answers (a source may be briefly down)', async () => {
    const inner = fixedSource('a', {});
    const cached = cachedPriceSource(inner.source, 1000, () => 0);
    await cached.prices([XLM_ASSET_ID], 'usd');
    await cached.prices([XLM_ASSET_ID], 'usd');
    expect(inner.asked).toHaveLength(2);
  });

  it('keys the cache by currency', async () => {
    const inner = fixedSource('a', { [XLM_ASSET_ID]: price(0.3) });
    const cached = cachedPriceSource(inner.source, 1000, () => 0);
    await cached.prices([XLM_ASSET_ID], 'usd');
    await cached.prices([XLM_ASSET_ID], 'eur');
    expect(inner.asked).toHaveLength(2);
  });
});

describe('metaMaskPriceSource', () => {
  it('parses spot prices with their 24h change, skipping unpriced ids', async () => {
    const fetchFn = jest.fn(async () =>
      response({ [XLM_ASSET_ID]: { price: 0.3, pricePercentChange1d: -1.5 }, [USDC_ID]: null }),
    );
    expect(await metaMaskPriceSource(fetchFn as typeof fetch).prices([XLM_ASSET_ID, USDC_ID], 'usd')).toEqual({
      [XLM_ASSET_ID]: { currency: 'usd', price: 0.3, change24h: -1.5 },
    });
    expect(String(fetchFn.mock.calls[0])).toContain('vsCurrency=usd');
  });

  it('answers nothing when the API fails', async () => {
    const failing = (async () => {
      throw new TypeError('offline');
    }) as typeof fetch;
    expect(await metaMaskPriceSource(failing).prices([XLM_ASSET_ID], 'usd')).toEqual({});
    expect(
      await metaMaskPriceSource((async () => response({}, false)) as typeof fetch).prices([XLM_ASSET_ID], 'usd'),
    ).toEqual({});
  });
});

describe('coinGeckoPriceSource', () => {
  it('only prices XLM', async () => {
    const fetchFn = jest.fn(async () => response({ stellar: { eur: 0.28, eur_24h_change: 2 } }));
    const source = coinGeckoPriceSource(fetchFn as typeof fetch);
    expect(await source.prices([USDC_ID], 'eur')).toEqual({});
    expect(fetchFn).not.toHaveBeenCalled();
    expect(await source.prices([XLM_ASSET_ID], 'eur')).toEqual({
      [XLM_ASSET_ID]: { currency: 'eur', price: 0.28, change24h: 2 },
    });
  });
});
