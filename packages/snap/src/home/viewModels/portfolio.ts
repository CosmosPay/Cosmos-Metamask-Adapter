import type { NetworkConfig } from '@/config/networks';
import { assetBalances, assetLabelOf, issuerOf } from '@/domain/balances';
import { hideBalances, localizeNumber, pricingPreferences, t } from '@/i18n';
import type { HorizonAccount, HorizonBalance } from '@/services/horizon';
import { findAsset, getRegistry, pricingAssetId } from '@/services/assets';
import { assetAvatar } from '@/ui/assetAvatar';
import { fetchPrices, XLM_ASSET_ID } from '@/services/prices';
import { balanceText, formatFiat, signedPercent } from '@/ui/format';
import { tokenInfo } from '@/ui/graphics/icons';
import type { Summary, TokenRow } from '@/home/types';
import { assetTitle, issuerLabel } from '@/home/viewModels/assets';

/**
 * Token rows and the headline balance with its 24h performance.
 *
 * @param network - Network config.
 * @param account - Horizon account (null when not activated).
 * @returns Rows and summary.
 */
export async function portfolio(
  network: NetworkConfig,
  account: HorizonAccount | null,
): Promise<{ rows: TokenRow[]; summary: Summary }> {
  const balances = assetBalances(account);
  const registry = await getRegistry(network);
  // USD estimate everywhere: test-network assets use their mainnet price.
  const idOf = (balance: HorizonBalance) =>
    pricingAssetId(assetLabelOf(balance), issuerOf(balance), network.id, registry);
  const ids = [
    ...new Set((balances.length > 0 ? balances.map(idOf) : [XLM_ASSET_ID]).filter((id): id is string => id !== null)),
  ];
  const prices = await fetchPrices(ids);
  const hidden = hideBalances();

  let total = 0;
  let totalDelta = 0;
  let currency: string | null = null;

  const rows = await Promise.all(
    balances.map(async (balance): Promise<TokenRow> => {
      const code = assetLabelOf(balance);
      const issuer = issuerOf(balance);
      const entry = findAsset(registry, code, issuer);
      const priceId = idOf(balance);
      const price = priceId ? prices[priceId] : undefined;
      const amount = `${balanceText(balance.balance)} ${code}`;

      let fiat: string | null = null;
      let fiatValue = 0;
      if (price) {
        const value = Number(balance.balance) * price.price;
        fiatValue = value;
        total += value;
        if (price.change24h !== null) {
          totalDelta += value - value / (1 + price.change24h / 100);
        }
        currency = price.currency;
        fiat = hidden ? `${price.currency.toUpperCase()} ${t('common.hidden')}` : formatFiat(value, price.currency);
      }

      // No 24h data (or no market at all) reads as a flat 0,00 %.
      const change24h = price?.change24h ?? 0;
      // Anything that rounds to 0,00 % is shown flat: no sign, no color.
      const flat = Math.abs(change24h) < 0.005;
      const change = {
        text: flat ? `${localizeNumber('0.00')}%` : signedPercent(change24h),
        tone: flat ? ('flat' as const) : change24h > 0 ? ('up' as const) : ('down' as const),
      };
      const title = assetTitle(code, issuer, entry);
      // Same two-line layout for every row: assets without a market price show 0.
      const { currency: userCurrency, enabled: pricing } = pricingPreferences();
      const value = fiat ?? (pricing ? formatFiat(0, userCurrency) : amount);

      return {
        avatar: await assetAvatar(code, issuer, registry),
        info: tokenInfo(title, issuerLabel(issuer, entry), change),
        title,
        value,
        extra: value === amount ? '' : amount,
        sortValue: fiatValue,
        sortAmount: Number(balance.balance),
      };
    }),
  );

  // Largest holdings first, like MetaMask: by value, then by amount.
  rows.sort((a, b) => b.sortValue - a.sortValue || b.sortAmount - a.sortAmount);

  const native = balances.find((balance) => balance.asset_type === 'native');
  let summary: Summary = {
    headline: `${balanceText(native?.balance ?? '0')} XLM`,
    change: null,
  };

  // Not activated yet: still show the estimate (0) in the user's currency.
  const fallbackCurrency = currency ?? prices[XLM_ASSET_ID]?.currency ?? null;
  if (fallbackCurrency !== null) {
    summary = {
      headline: hidden
        ? `${fallbackCurrency.toUpperCase()} ${t('common.hidden')}`
        : formatFiat(total, fallbackCurrency),
      change:
        hidden || total === 0
          ? null
          : {
              text: `${totalDelta < 0 ? '-' : '+'}${formatFiat(Math.abs(totalDelta), fallbackCurrency)} (${signedPercent((totalDelta / (total - totalDelta)) * 100)})`,
              color: totalDelta < 0 ? 'error' : 'success',
            },
    };
  }

  return { rows, summary };
}
