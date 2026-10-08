import { normalizeAmount } from '@/domain/amounts';
import { ValidationError } from '@/domain/errors';
import type { PaymentRequest } from '@/domain/payments';
import { preparePayment, sendPayment } from '@/domain/payments';
import { t } from '@/i18n';
import { amountText } from '@/ui/format';
import { Loading } from '@/home/components';
import { loadWallet, readString, show } from '@/home/interface';
import type { Routes } from '@/home/router';
import { Failed, Sent } from '@/home/screens/ResultScreens';
import { Review } from '@/home/screens/SendReviewScreen';
import { Send } from '@/home/screens/SendScreen';
import type { FieldErrors, SendForm } from '@/home/types';
import { EMPTY_SEND_FORM } from '@/home/types';
import { assetOptions } from '@/home/viewModels/assets';
import { showMain } from '@/home/controllers/main';

function toRequest(form: SendForm): PaymentRequest {
  const [code, issuer] = form.asset === 'native' ? [] : form.asset.split(':');
  return {
    destination: form.destination,
    amount: normalizeAmount(form.amount),
    memo: form.memo,
    ...(code && issuer ? { assetCode: code, assetIssuer: issuer } : {}),
  };
}

/**
 * Shows the send form, with the chosen asset (or the first one).
 *
 * @param id - Interface id.
 * @param form - Values to show.
 * @param errors - Field errors from a failed review.
 */
export async function openSend(id: string, form: SendForm, errors?: FieldErrors) {
  const { network, account } = await loadWallet();
  if (!account) {
    await showMain(id);
    return;
  }
  const options = await assetOptions(network, account);
  const option = options.find((candidate) => candidate.key === form.asset) ?? options[0];
  if (!option) {
    await showMain(id);
    return;
  }
  const next = { ...form, asset: option.key };
  await show(id, <Send network={network} account={account} option={option} form={next} errors={errors} />, {
    form: next,
  });
}

async function review(id: string, form: SendForm) {
  await show(id, <Loading text={t('loading.review')} />, { form });
  const { keypair, network } = await loadWallet();
  try {
    const prepared = await preparePayment(network, keypair, toRequest(form));
    await show(
      id,
      <Review
        network={network}
        from={keypair.publicKey()}
        form={form}
        assetLabel={prepared.assetLabel}
        feeXlm={prepared.feeXlm}
        createsAccount={prepared.createsAccount}
      />,
      { form },
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      await openSend(id, form, error.fields);
      return;
    }
    await show(id, <Failed message={(error as Error).message} retry="edit-send" />, { form });
  }
}

async function confirmSend(id: string, form: SendForm) {
  await show(id, <Loading text={t('loading.sending')} />, { form });
  const { keypair, network } = await loadWallet();
  try {
    // Rebuild with a fresh sequence number right before signing.
    const prepared = await preparePayment(network, keypair, toRequest(form));
    const result = await sendPayment(network, keypair, prepared);
    await show(
      id,
      <Sent
        amount={amountText(normalizeAmount(form.amount), prepared.assetLabel)}
        explorerUrl={result.explorerUrl}
        hash={result.hash}
      />,
    );
  } catch (error) {
    await show(id, <Failed message={(error as Error).message} retry="edit-send" />, { form });
  }
}

export const sendRoutes: Routes = {
  clicks: {
    'go-send': async ({ id }) => openSend(id, EMPTY_SEND_FORM),
    'edit-send': async ({ id, context }) => openSend(id, context.form ?? EMPTY_SEND_FORM),
    'confirm-send': async ({ id, context }) => confirmSend(id, context.form ?? EMPTY_SEND_FORM),
  },
  forms: {
    'send-form': async ({ id, values, context }) =>
      // The asset comes from the picker (kept in context), not from a form field.
      review(id, {
        destination: readString(values, 'destination'),
        amount: readString(values, 'amount'),
        memo: readString(values, 'memo'),
        asset: (context.form ?? EMPTY_SEND_FORM).asset,
      }),
  },
};
