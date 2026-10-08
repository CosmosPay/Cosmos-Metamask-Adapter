import type { HorizonAccount, HorizonBalance } from '@/services/horizon';
import { toStroops } from '@/domain/amounts';

/** Reserve locked per ledger entry (0.5 XLM). */
export const BASE_RESERVE = 5_000_000n;

/** `native` or `CODE:ISSUER`, the key used across forms and pickers. */
export const assetKey = (balance: HorizonBalance) =>
  balance.asset_type === 'native' ? 'native' : `${balance.asset_code}:${balance.asset_issuer}`;

export const assetLabelOf = (balance: HorizonBalance) =>
  balance.asset_type === 'native' ? 'XLM' : (balance.asset_code ?? '?');

/** Issuer of a balance line, null for XLM. */
export const issuerOf = (balance: HorizonBalance) =>
  balance.asset_type === 'native' ? null : (balance.asset_issuer ?? null);

/** Balance lines that are assets (liquidity pool shares are not spendable or priced). */
export const assetBalances = (account: HorizonAccount | null) =>
  account?.balances.filter((balance) => balance.asset_type !== 'liquidity_pool_shares') ?? [];

/**
 * Amount the account can actually spend, after the minimum balance reserve
 * and open offers.
 *
 * @param account - Horizon account.
 * @param balance - The balance line.
 * @returns Spendable amount in stroops.
 */
export function spendableStroops(account: HorizonAccount, balance: HorizonBalance): bigint {
  const total = toStroops(balance.balance) - toStroops(balance.selling_liabilities ?? '0');
  if (balance.asset_type !== 'native') {
    return total;
  }
  const entries =
    2n + BigInt(account.subentry_count ?? 0) + BigInt(account.num_sponsoring ?? 0) - BigInt(account.num_sponsored ?? 0);
  const spendable = total - entries * BASE_RESERVE;
  return spendable > 0n ? spendable : 0n;
}
