import type { StellarNetwork } from '@/config/networks';
import { formatAmount } from '@/domain/amounts';
import { hideBalances, localizeNumber, t } from '@/i18n';

/**
 * Shortens an address or hash to its first and last 6 characters.
 *
 * @param value - Address or hash.
 * @param ellipsis - Separator (dialogs use plain dots).
 * @returns The short form; short values are returned as is.
 */
export const shorten = (value: string, ellipsis = '…') =>
  value.length > 16 ? `${value.slice(0, 6)}${ellipsis}${value.slice(-6)}` : value;

export const networkLabel = (id: StellarNetwork) => t(`network.${id}`);

/** Localized amount, or a mask when the user hides balances in MetaMask. */
export const balanceText = (amount: string) =>
  hideBalances() ? t('common.hidden') : localizeNumber(formatAmount(amount));

/** `USD 1,234.50`, localized. */
export const formatFiat = (amount: number, currency: string) => {
  const fixed = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/gu, ',');
  return `${currency.toUpperCase()} ${localizeNumber(fixed)}`;
};

/** `+1,25%` / `-0,50%`. */
export const signedPercent = (value: number) =>
  `${value < 0 ? '-' : '+'}${localizeNumber(Math.abs(value).toFixed(2))}%`;

/** Basis points as a localized percentage (`50` → `0,50%`). */
export const bpsPercent = (bps: number) => `${localizeNumber((bps / 100).toFixed(2))}%`;

/** Localized `<amount> <code>`. */
export const amountText = (amount: string, code: string) => `${localizeNumber(formatAmount(amount))} ${code}`;
