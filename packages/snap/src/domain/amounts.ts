export const STROOPS_PER_XLM = 10_000_000n;

/** A positive decimal with at most Stellar's 7 decimals. */
export const AMOUNT_PATTERN = /^\d+(\.\d{1,7})?$/u;

export const toStroops = (amount: string): bigint => {
  const [whole = '0', fraction = ''] = amount.split('.');
  return BigInt(whole) * STROOPS_PER_XLM + BigInt(fraction.padEnd(7, '0'));
};

/** Whether `amount` is a well-formed amount greater than zero. */
export const isPositiveAmount = (amount: string) => AMOUNT_PATTERN.test(amount) && toStroops(amount) > 0n;

/**
 * Formats a stroop amount as a human readable number (1,234.5).
 *
 * @param stroops - Amount in stroops.
 * @returns The formatted amount.
 */
export function formatStroops(stroops: bigint): string {
  const negative = stroops < 0n;
  const value = negative ? -stroops : stroops;
  const whole = (value / STROOPS_PER_XLM).toString().replace(/\B(?=(\d{3})+(?!\d))/gu, ',');
  const fraction = (value % STROOPS_PER_XLM).toString().padStart(7, '0').replace(/0+$/u, '');
  return `${negative ? '-' : ''}${whole}${fraction ? `.${fraction}` : ''}`;
}

export const formatAmount = (amount: string) => formatStroops(toStroops(amount));

/** Accepts `1,5` and `1.234,5` as typed in comma-decimal languages. */
export const normalizeAmount = (amount: string) => {
  const value = amount.trim();
  return value.includes(',') ? value.replace(/\./gu, '').replace(',', '.') : value;
};
