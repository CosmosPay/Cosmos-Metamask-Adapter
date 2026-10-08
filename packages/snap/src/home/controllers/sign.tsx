import { TransactionBuilder } from '@stellar/stellar-sdk/base';

import { innerTransaction, summarizeTransaction } from '@/domain/transactions';
import { t } from '@/i18n';
import { submitTransaction } from '@/services/horizon';
import { Loading } from '@/home/components';
import { loadWallet, readString, show } from '@/home/interface';
import type { Routes } from '@/home/router';
import { Failed, Sent } from '@/home/screens/ResultScreens';
import { SignForm, SignReview, Signed } from '@/home/screens/SignScreens';

/**
 * Decodes a pasted transaction and shows what signing it would do.
 *
 * @param id - Interface id.
 * @param xdr - Base64 transaction envelope.
 */
async function reviewSign(id: string, xdr: string) {
  const { keypair, network } = await loadWallet();
  let tx;
  try {
    tx = TransactionBuilder.fromXDR(xdr, network.passphrase);
  } catch {
    await show(id, <SignForm error={t('sign.error.xdr', { network: network.name })} />);
    return;
  }
  await show(id, <SignReview network={network} signer={keypair.publicKey()} {...summarizeTransaction(tx)} />, {
    sign: xdr,
  });
}

/**
 * Signs the reviewed transaction, and optionally submits it.
 *
 * @param id - Interface id.
 * @param xdr - The reviewed envelope.
 * @param submit - Also send it to the network.
 */
async function signXdr(id: string, xdr: string, submit: boolean) {
  const { keypair, network } = await loadWallet();
  if (submit) {
    await show(id, <Loading text={t('loading.sending')} />, { sign: xdr });
  }
  try {
    const tx = TransactionBuilder.fromXDR(xdr, network.passphrase);
    tx.sign(keypair);
    const signed = tx.toXDR();
    if (!submit) {
      await show(id, <Signed xdr={signed} />);
      return;
    }
    const result = await submitTransaction(network, signed);
    await show(
      id,
      <Sent
        title={t('sign.sent.title')}
        amount={t('sign.ops', { n: innerTransaction(tx).operations.length })}
        explorerUrl={`${network.explorerUrl}/tx/${result.hash}`}
        hash={result.hash}
      />,
    );
  } catch (error) {
    await show(id, <Failed message={(error as Error).message} retry="edit-sign" />, { sign: xdr });
  }
}

const signReviewed = (submit: boolean) => async (event: { id: string; context: { sign?: string } }) => {
  if (event.context.sign) {
    await signXdr(event.id, event.context.sign, submit);
  }
};

export const signRoutes: Routes = {
  clicks: {
    'go-sign': async ({ id }) => show(id, <SignForm />),
    'edit-sign': async ({ id }) => show(id, <SignForm />),
    'sign-only': signReviewed(false),
    'sign-submit': signReviewed(true),
  },
  forms: {
    'sign-form': async ({ id, values }) => reviewSign(id, readString(values, 'xdr').trim()),
  },
};
