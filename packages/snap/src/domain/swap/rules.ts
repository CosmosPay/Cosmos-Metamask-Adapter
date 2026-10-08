import type { Transaction } from '@stellar/stellar-sdk/base';
import { Asset } from '@stellar/stellar-sdk/base';

import { formatStroops, isPositiveAmount, toStroops } from '@/domain/amounts';
import { spendableStroops } from '@/domain/balances';
import { ValidationError } from '@/domain/errors';
import type { SwapAsset, SwapQuote, SwapRequest } from '@/domain/swap/types';
import { t } from '@/i18n';
import type { HorizonAccount } from '@/services/horizon';

/** Pure swap rules: no network access, so every case is unit-tested. */

export const isNativeAsset = (asset: SwapAsset) => asset.issuer === null;

export const toStellarAsset = (asset: SwapAsset) =>
  isNativeAsset(asset) ? Asset.native() : new Asset(asset.code, asset.issuer as string);

export const sameAsset = (a: SwapAsset, b: SwapAsset) => a.code === b.code && a.issuer === b.issuer;

/**
 * What can be checked before asking anyone for a price.
 *
 * @param request - The swap.
 * @throws {ValidationError} For the same asset on both sides or a bad amount.
 */
export function assertSwapRequest(request: SwapRequest): void {
  if (sameAsset(request.from, request.to)) {
    throw new ValidationError({ to: t('swap.error.same') });
  }
  if (!isPositiveAmount(request.amount)) {
    throw new ValidationError({ amount: t('error.amount.invalid') });
  }
}

/**
 * Checks the account can make the swap: activated, enough spendable balance of
 * what it sells, and a trustline for what it buys.
 *
 * @param account - Horizon account (null when not activated).
 * @param request - The swap.
 * @param networkName - For the "not activated" message.
 * @throws {ValidationError} With the field to blame.
 */
export function assertAccountCanSwap(account: HorizonAccount | null, request: SwapRequest, networkName: string): void {
  const { from, to, amount } = request;
  if (!account) {
    throw new ValidationError({ amount: t('error.account.inactive', { network: networkName }) });
  }
  const line = account.balances.find((balance) =>
    isNativeAsset(from)
      ? balance.asset_type === 'native'
      : balance.asset_code === from.code && balance.asset_issuer === from.issuer,
  );
  const available = line ? spendableStroops(account, line) : 0n;
  if (toStroops(amount) > available) {
    throw new ValidationError({
      amount: t('error.balance.insufficient', { available: formatStroops(available), asset: from.code }),
    });
  }
  if (
    !isNativeAsset(to) &&
    !account.balances.some((balance) => balance.asset_code === to.code && balance.asset_issuer === to.issuer)
  ) {
    throw new ValidationError({ to: t('swap.error.trustline', { asset: to.code }) });
  }
}

export class SwapMismatchError extends Error {
  readonly reason: string;

  constructor(reason: string) {
    super(`${t('swap.error.mismatch')} (${reason})`);
    this.name = 'SwapMismatchError';
    this.reason = reason;
  }
}

/**
 * Refuses a server-built transaction unless it is exactly the swap the user
 * reviewed: our account pays, at most one fee payment to the quoted wallet (no
 * more than the quoted fee), then one strict-send path payment back to us with
 * at least the quoted minimum.
 *
 * @param tx - Decoded transaction.
 * @param quote - The reviewed quote.
 * @param address - Our address.
 * @throws {SwapMismatchError} Naming the first thing that differs.
 */
export function assertSwapTransaction(tx: Transaction, quote: SwapQuote, address: string): void {
  const fail = (reason: string): never => {
    throw new SwapMismatchError(reason);
  };
  if (tx.source !== address) fail('source');
  const ops = tx.operations;
  const swapOp = ops[ops.length - 1];
  const feeOps = ops.slice(0, -1);
  if (!swapOp || feeOps.length > 1) fail('operations');

  for (const op of ops) {
    if (op.source && op.source !== address) fail('operation source');
  }

  const feeOp = feeOps[0];
  if (feeOp) {
    if (feeOp.type !== 'payment') {
      fail('fee operation');
    } else {
      if (!quote.fee.wallet || feeOp.destination !== quote.fee.wallet) fail('fee wallet');
      if (toStroops(feeOp.amount) > toStroops(quote.fee.amount)) fail('fee amount');
      if (!feeOp.asset.equals(toStellarAsset(quote.from))) fail('fee asset');
    }
  }

  if (swapOp?.type !== 'pathPaymentStrictSend') {
    fail('swap operation');
  } else {
    if (swapOp.destination !== address) fail('destination');
    if (!swapOp.sendAsset.equals(toStellarAsset(quote.from))) fail('send asset');
    if (!swapOp.destAsset.equals(toStellarAsset(quote.to))) fail('receive asset');
    if (toStroops(swapOp.sendAmount) > toStroops(quote.swapAmount)) fail('send amount');
    if (toStroops(swapOp.destMin) < toStroops(quote.minimum)) fail('minimum received');
  }
}
