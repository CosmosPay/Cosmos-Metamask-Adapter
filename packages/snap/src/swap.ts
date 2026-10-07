import type { Keypair, Transaction } from '@stellar/stellar-sdk/base';
import { Asset, TransactionBuilder } from '@stellar/stellar-sdk/base';

import { CosmosApiError, cosmosRequest, cosmosServesNetwork } from './cosmosApi';
import { fetchAccount } from './horizon';
import { t } from './i18n';
import type { NetworkConfig } from './networks';
import { formatStroops, PaymentValidationError, spendableStroops, toStroops } from './payments';

/** XLM is `{ code: 'XLM', issuer: null }`. */
export type SwapAsset = { code: string; issuer: string | null };

/** A quote from the Cosmos Pay community server. */
export type SwapQuote = {
  from: SwapAsset;
  to: SwapAsset;
  /** Gross amount the user sends. */
  sendAmount: string;
  fee: { amount: string; bps: number; wallet: string | null };
  /** Net amount routed through the DEX / AMMs. */
  swapAmount: string;
  estimated: string;
  minimum: string;
  slippageBps: number;
  path: SwapAsset[];
};

export const DEFAULT_SLIPPAGE_BPS = 50;

const isNative = (asset: SwapAsset) => asset.issuer === null;
const toAsset = (asset: SwapAsset) =>
  isNative(asset) ? Asset.native() : new Asset(asset.code, asset.issuer as string);
const sameAsset = (a: SwapAsset, b: SwapAsset) => a.code === b.code && a.issuer === b.issuer;
const apiCode = (asset: SwapAsset) => (isNative(asset) ? 'native' : asset.code);
const fromApi = (code: string, issuer: string | null): SwapAsset =>
  code === 'native' || !issuer ? { code: 'XLM', issuer: null } : { code, issuer };

type ApiQuote = {
  fee: { amount: string; bps: number; wallet: string | null };
  swap: { amount: string };
  source: { amount: string };
  destination: { estimated: string; minimum: string; slippageBps: number };
  path: { code: string; issuer: string | null }[];
};

type ApiSwap = { id: string; xdr: string };

/** Swaps exist where the Cosmos Pay community server runs (not futurenet). */
export const cosmosSwapsEnabled = (network: NetworkConfig) => cosmosServesNetwork(network.id);

/**
 * Turns a gateway failure into a message the user can act on. 4xx business
 * errors (no path, bad amount…) come back with the server's own text.
 *
 * @param error - What `cosmosRequest` threw.
 * @returns The error to show.
 */
function swapError(error: unknown): Error {
  if (error instanceof CosmosApiError) {
    if (error.status === 0 || error.status === 401 || error.status === 403 || error.status >= 500) {
      return new Error(t('swap.error.unavailable'));
    }
    return new PaymentValidationError({ amount: error.message });
  }
  return error as Error;
}

/**
 * Prices a swap through the Cosmos Pay community server
 * (`POST /v1/swaps/quote`) — the same engine as the Cosmos wallet, with its
 * platform fee. There is deliberately no direct-DEX fallback: a swap that
 * bypasses the server would bypass the fee too.
 *
 * @param network - Network config.
 * @param keypair - The account swapping.
 * @param request - Assets and gross amount.
 * @param request.from - Asset sold.
 * @param request.to - Asset bought.
 * @param request.amount - Gross amount of `from`.
 * @returns The quote.
 */
export async function quoteSwap(
  network: NetworkConfig,
  keypair: Keypair,
  request: { from: SwapAsset; to: SwapAsset; amount: string },
): Promise<SwapQuote> {
  const { from, to, amount } = request;
  if (!cosmosSwapsEnabled(network)) {
    throw new Error(t('swap.error.unavailable'));
  }
  if (sameAsset(from, to)) {
    throw new PaymentValidationError({ to: t('swap.error.same') });
  }
  if (!/^\d+(\.\d{1,7})?$/u.test(amount) || toStroops(amount) <= 0n) {
    throw new PaymentValidationError({ amount: t('error.amount.invalid') });
  }

  const source = await fetchAccount(network, keypair.publicKey());
  if (!source) {
    throw new PaymentValidationError({
      amount: t('error.account.inactive', { network: network.name }),
    });
  }
  const line = source.balances.find((balance) =>
    isNative(from)
      ? balance.asset_type === 'native'
      : balance.asset_code === from.code && balance.asset_issuer === from.issuer,
  );
  const available = line ? spendableStroops(source, line) : 0n;
  if (toStroops(amount) > available) {
    throw new PaymentValidationError({
      amount: t('error.balance.insufficient', {
        available: formatStroops(available),
        asset: from.code,
      }),
    });
  }
  if (
    !isNative(to) &&
    !source.balances.some((balance) => balance.asset_code === to.code && balance.asset_issuer === to.issuer)
  ) {
    throw new PaymentValidationError({
      to: t('swap.error.trustline', { asset: to.code }),
    });
  }

  return requestQuote(network, from, to, amount);
}

/**
 * Live estimate while the amount is being typed: the same Cosmos Pay quote,
 * without the account checks that only matter at review time.
 *
 * @param network - Network config.
 * @param request - Assets and gross amount.
 * @param request.from - Asset sold.
 * @param request.to - Asset bought.
 * @param request.amount - Gross amount of `from`.
 * @returns The quote.
 */
export async function estimateSwap(
  network: NetworkConfig,
  request: { from: SwapAsset; to: SwapAsset; amount: string },
): Promise<SwapQuote> {
  if (!cosmosSwapsEnabled(network)) {
    throw new Error(t('swap.error.unavailable'));
  }
  if (sameAsset(request.from, request.to)) {
    throw new PaymentValidationError({ to: t('swap.error.same') });
  }
  return requestQuote(network, request.from, request.to, request.amount);
}

/**
 * `POST /v1/swaps/quote`, mapped to a {@link SwapQuote}.
 *
 * @param network - Network config.
 * @param from - Asset sold.
 * @param to - Asset bought.
 * @param amount - Gross amount of `from`.
 * @returns The quote.
 */
async function requestQuote(
  network: NetworkConfig,
  from: SwapAsset,
  to: SwapAsset,
  amount: string,
): Promise<SwapQuote> {
  let quote: ApiQuote;
  try {
    quote = await cosmosRequest<ApiQuote>(network.id, '/v1/swaps/quote', {
      sourceAssetCode: apiCode(from),
      ...(from.issuer ? { sourceAssetIssuer: from.issuer } : {}),
      destAssetCode: apiCode(to),
      ...(to.issuer ? { destAssetIssuer: to.issuer } : {}),
      amount,
      slippageBps: DEFAULT_SLIPPAGE_BPS,
    });
  } catch (error) {
    throw swapError(error);
  }
  return {
    from,
    to,
    sendAmount: quote.source.amount,
    fee: quote.fee,
    swapAmount: quote.swap.amount,
    estimated: quote.destination.estimated,
    minimum: quote.destination.minimum,
    slippageBps: quote.destination.slippageBps,
    path: quote.path.map((hop) => fromApi(hop.code, hop.issuer)),
  };
}

/**
 * Refuses a server-built transaction unless it is exactly the swap the user
 * reviewed: our account pays, an optional fee payment to the quoted wallet,
 * then one strict-send path payment back to us with at least the quoted minimum.
 *
 * @param tx - Decoded transaction.
 * @param quote - The reviewed quote.
 * @param address - Our address.
 */
export function assertSwapTransaction(tx: Transaction, quote: SwapQuote, address: string): void {
  const fail = (reason: string) => {
    throw new Error(`${t('swap.error.mismatch')} (${reason})`);
  };
  if (tx.source !== address) fail('source');
  const ops = tx.operations;
  const swapOp = ops[ops.length - 1];
  const feeOps = ops.slice(0, -1);
  if (!swapOp || feeOps.length > 1) fail('operations');

  for (const op of ops) {
    if (op.source && op.source !== address) fail('operation source');
  }

  if (feeOps.length === 1) {
    const feeOp = feeOps[0];
    if (feeOp?.type !== 'payment') fail('fee operation');
    if (feeOp?.type === 'payment') {
      if (!quote.fee.wallet || feeOp.destination !== quote.fee.wallet) fail('fee wallet');
      if (toStroops(feeOp.amount) > toStroops(quote.fee.amount)) fail('fee amount');
      if (!feeOp.asset.equals(toAsset(quote.from))) fail('fee asset');
    }
  }

  if (swapOp?.type !== 'pathPaymentStrictSend') fail('swap operation');
  if (swapOp?.type === 'pathPaymentStrictSend') {
    if (swapOp.destination !== address) fail('destination');
    if (!swapOp.sendAsset.equals(toAsset(quote.from))) fail('send asset');
    if (!swapOp.destAsset.equals(toAsset(quote.to))) fail('receive asset');
    if (toStroops(swapOp.sendAmount) > toStroops(quote.swapAmount)) fail('send amount');
    if (toStroops(swapOp.destMin) < toStroops(quote.minimum)) fail('minimum received');
  }
}

/**
 * Executes a quote through the community server: build → verify → sign →
 * submit. The server-built XDR is checked against the reviewed quote before
 * the key ever touches it.
 *
 * @param network - Network config.
 * @param keypair - The account swapping.
 * @param quote - The reviewed quote.
 * @returns Hash and explorer link.
 */
export async function executeSwap(
  network: NetworkConfig,
  keypair: Keypair,
  quote: SwapQuote,
): Promise<{ hash: string; explorerUrl: string }> {
  const address = keypair.publicKey();
  try {
    const swap = await cosmosRequest<ApiSwap>(network.id, '/v1/swaps', {
      sourceAssetCode: apiCode(quote.from),
      ...(quote.from.issuer ? { sourceAssetIssuer: quote.from.issuer } : {}),
      destAssetCode: apiCode(quote.to),
      ...(quote.to.issuer ? { destAssetIssuer: quote.to.issuer } : {}),
      amount: quote.sendAmount,
      slippageBps: quote.slippageBps,
      source: address,
    });
    const tx = TransactionBuilder.fromXDR(swap.xdr, network.passphrase) as Transaction;
    assertSwapTransaction(tx, quote, address);
    tx.sign(keypair);
    const result = await cosmosRequest<{ status: string; txHash?: string }>(
      network.id,
      `/v1/swaps/${encodeURIComponent(swap.id)}/submit`,
      { signedXdr: tx.toXDR() },
    );
    const hash = result.txHash ?? Buffer.from(tx.hash()).toString('hex');
    if (result.status === 'FAILED') {
      throw new Error(t('swap.error.failed'));
    }
    return { hash, explorerUrl: `${network.explorerUrl}/tx/${hash}` };
  } catch (error) {
    throw swapError(error);
  }
}
