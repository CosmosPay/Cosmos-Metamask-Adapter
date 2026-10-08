import type { NetworkConfig } from '@/config/networks';
import { formatStroops, isPositiveAmount, normalizeAmount, toStroops } from '@/domain/amounts';
import { assetKey, spendableStroops } from '@/domain/balances';
import { ValidationError } from '@/domain/errors';
import type { SwapAsset, SwapQuote } from '@/domain/swap';
import { estimateSwap, executeSwap, quoteSwap } from '@/services/swap';
import { localizeNumber, t } from '@/i18n';
import { amountText, bpsPercent } from '@/ui/format';
import { Loading } from '@/home/components';
import { formValues, loadWallet, readString, show } from '@/home/interface';
import type { Routes } from '@/home/router';
import { Failed, Sent } from '@/home/screens/ResultScreens';
import { SwapReview } from '@/home/screens/SwapReviewScreen';
import { Swap } from '@/home/screens/SwapScreen';
import type { FieldErrors, SwapEstimate, SwapForm } from '@/home/types';
import { EMPTY_SWAP_FORM } from '@/home/types';
import { assetOptions } from '@/home/viewModels/assets';
import { showMain } from '@/home/controllers/main';

/** Pause in typing before the swap is re-priced. */
const TYPING_DEBOUNCE_MS = 350;

const swapAssetOf = (key: string): SwapAsset => {
  if (key === 'native') {
    return { code: 'XLM', issuer: null };
  }
  const [code = '', issuer = ''] = key.split(':');
  return { code, issuer };
};

/** `0,5 XLM (0,50%)`: the Cosmos fee of a quote, if it charges one. */
export const swapFeeText = (quote: SwapQuote) =>
  toStroops(quote.fee.amount) > 0n
    ? `${amountText(quote.fee.amount, quote.from.code)} (${bpsPercent(quote.fee.bps)})`
    : undefined;

const sleep = async (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

/**
 * The "you receive" line for the amount typed so far, from the Cosmos Pay quote.
 *
 * @param network - Network config.
 * @param swap - Current form.
 * @returns The estimate, or undefined while there is nothing to price.
 */
async function swapEstimate(network: NetworkConfig, swap: SwapForm): Promise<SwapEstimate | undefined> {
  const amount = normalizeAmount(swap.amount);
  if (!swap.to || !isPositiveAmount(amount)) {
    return undefined;
  }
  try {
    const quote = await estimateSwap(network, { from: swapAssetOf(swap.from), to: swapAssetOf(swap.to), amount });
    return { receive: `≈ ${amountText(quote.estimated, quote.to.code)}`, fee: swapFeeText(quote) };
  } catch (error) {
    const message = error instanceof ValidationError ? Object.values(error.fields)[0] : (error as Error).message;
    return { receive: message ?? t('swap.error.noPath'), error: true };
  }
}

/**
 * Shows the swap form.
 *
 * @param id - Interface id.
 * @param swap - Form state.
 * @param errors - Field errors from a failed review.
 * @param live - Set while typing: keeps the input untouched and uses this estimate.
 * @param live.estimate - Estimate for the typed amount.
 */
export async function openSwap(
  id: string,
  swap: SwapForm,
  errors?: FieldErrors,
  live?: { estimate: SwapEstimate | undefined },
) {
  const { network, account } = await loadWallet();
  if (!account) {
    await showMain(id);
    return;
  }
  const options = await assetOptions(network, account);
  const from = options.find((option) => option.key === swap.from) ?? options[0];
  if (!from) {
    await showMain(id);
    return;
  }
  const candidates = options.filter((option) => option.key !== from.key);
  const to = candidates.find((option) => option.key === swap.to) ?? candidates[0] ?? null;
  const fromBalance = account.balances.find((balance) => assetKey(balance) === from.key);
  const available = fromBalance ? localizeNumber(formatStroops(spendableStroops(account, fromBalance))) : '0';
  const next: SwapForm = { from: from.key, to: to?.key ?? null, amount: swap.amount };
  const estimate = live ? live.estimate : errors ? undefined : await swapEstimate(network, next);
  await show(
    id,
    <Swap
      from={from}
      to={to}
      amount={live ? undefined : swap.amount}
      available={available}
      estimate={estimate}
      errors={errors}
    />,
    { swap: next },
  );
}

/**
 * Re-prices the swap as the amount is typed. Waits for a pause in typing and
 * drops any result the user has already typed past, so only the latest amount
 * ever renders; the input itself is never overwritten.
 *
 * @param id - Interface id.
 * @param swap - Form as kept in context.
 * @param typed - Amount just typed.
 */
export async function liveSwapEstimate(id: string, swap: SwapForm, typed: string) {
  const current = async () => readString(await formValues(id, 'swap-form'), 'amount', typed);
  await sleep(TYPING_DEBOUNCE_MS);
  if ((await current()) !== typed) {
    return;
  }
  const { network } = await loadWallet();
  const estimate = await swapEstimate(network, { ...swap, amount: typed });
  if ((await current()) !== typed) {
    return;
  }
  await openSwap(id, { ...swap, amount: typed }, undefined, { estimate });
}

async function reviewSwap(id: string, swap: SwapForm) {
  if (!swap.to) {
    await openSwap(id, swap);
    return;
  }
  await show(id, <Loading text={t('loading.quote')} />, { swap });
  const { keypair, network } = await loadWallet();
  try {
    const quote = await quoteSwap(network, keypair, {
      from: swapAssetOf(swap.from),
      to: swapAssetOf(swap.to),
      amount: normalizeAmount(swap.amount),
    });
    await show(id, <SwapReview quote={quote} />, { swap, quote });
  } catch (error) {
    if (error instanceof ValidationError) {
      await openSwap(id, swap, error.fields);
      return;
    }
    await show(id, <Failed message={(error as Error).message} retry="edit-swap" />, { swap });
  }
}

async function confirmSwap(id: string, swap: SwapForm | undefined, quote: SwapQuote) {
  await show(id, <Loading text={t('loading.swap')} />, { swap, quote });
  const { keypair, network } = await loadWallet();
  try {
    const result = await executeSwap(network, keypair, quote);
    await show(
      id,
      <Sent
        title={t('swap.done.title')}
        amount={`${amountText(quote.sendAmount, quote.from.code)} → ≈ ${amountText(quote.estimated, quote.to.code)}`}
        explorerUrl={result.explorerUrl}
        hash={result.hash}
      />,
    );
  } catch (error) {
    await show(id, <Failed message={(error as Error).message} retry="edit-swap" />, { swap });
  }
}

export const swapRoutes: Routes = {
  clicks: {
    'go-swap': async ({ id }) => openSwap(id, EMPTY_SWAP_FORM),
    'edit-swap': async ({ id, context }) => openSwap(id, context.swap ?? EMPTY_SWAP_FORM),
    'confirm-swap': async ({ id, context }) => {
      if (context.quote) {
        await confirmSwap(id, context.swap, context.quote);
      }
    },
  },
  forms: {
    'swap-form': async ({ id, values, context }) =>
      reviewSwap(id, { ...(context.swap ?? EMPTY_SWAP_FORM), amount: readString(values, 'amount') }),
  },
};
