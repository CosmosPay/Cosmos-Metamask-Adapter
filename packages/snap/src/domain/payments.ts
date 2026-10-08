import type { Keypair, Transaction } from '@stellar/stellar-sdk/base';
import { Account, Asset, Memo, Operation, StrKey, TransactionBuilder } from '@stellar/stellar-sdk/base';

import type { NetworkConfig } from '@/config/networks';
import { localizeNumber, t } from '@/i18n';
import { fetchAccount, fetchBaseFee } from '@/services/horizon';
import { formatStroops, isPositiveAmount, STROOPS_PER_XLM, toStroops } from '@/domain/amounts';
import { spendableStroops } from '@/domain/balances';
import { ValidationError } from '@/domain/errors';
import { signAndSubmit } from '@/domain/transactions';

export type PaymentRequest = {
  destination: string;
  amount: string;
  assetCode?: string | undefined;
  assetIssuer?: string | undefined;
  memo?: string | undefined;
};

export type PreparedPayment = {
  tx: Transaction;
  asset: Asset;
  assetLabel: string;
  createsAccount: boolean;
  /** Network fee in XLM. */
  feeXlm: string;
};

/**
 * Validates a payment and builds the unsigned transaction.
 *
 * @param network - Network config.
 * @param keypair - Sender.
 * @param request - Payment details.
 * @returns The prepared payment.
 */
export async function preparePayment(
  network: NetworkConfig,
  keypair: Keypair,
  request: PaymentRequest,
): Promise<PreparedPayment> {
  const destination = request.destination.trim();
  const amount = request.amount.trim();
  const memo = request.memo?.trim() || undefined;

  const errors: Partial<Record<keyof PaymentRequest, string>> = {};
  if (!StrKey.isValidEd25519PublicKey(destination)) {
    errors.destination = t('error.destination.invalid');
  } else if (destination === keypair.publicKey()) {
    errors.destination = t('error.destination.self');
  }
  if (!isPositiveAmount(amount)) {
    errors.amount = t('error.amount.invalid');
  }
  if (memo && new TextEncoder().encode(memo).length > 28) {
    errors.memo = t('error.memo.tooLong');
  }
  if ((request.assetCode === undefined) !== (request.assetIssuer === undefined)) {
    errors.assetCode = t('error.asset.invalid');
  }
  if (Object.keys(errors).length > 0) {
    throw new ValidationError(errors);
  }

  const asset =
    request.assetCode && request.assetIssuer ? new Asset(request.assetCode, request.assetIssuer) : Asset.native();
  const assetLabel = asset.isNative() ? 'XLM' : asset.getCode();

  const [source, target, fee] = await Promise.all([
    fetchAccount(network, keypair.publicKey()),
    fetchAccount(network, destination),
    fetchBaseFee(network),
  ]);
  if (!source) {
    throw new ValidationError({
      amount: t('error.account.inactive', { network: network.name }),
    });
  }

  const line = source.balances.find((balance) =>
    asset.isNative()
      ? balance.asset_type === 'native'
      : balance.asset_code === asset.getCode() && balance.asset_issuer === asset.getIssuer(),
  );
  const feeStroops = BigInt(fee);
  const needed = toStroops(amount) + (asset.isNative() ? feeStroops : 0n);
  const available = line ? spendableStroops(source, line) : 0n;
  if (needed > available) {
    throw new ValidationError({
      amount: t('error.balance.insufficient', {
        available: localizeNumber(formatStroops(available)),
        asset: assetLabel,
      }),
    });
  }

  const createsAccount = target === null;
  if (createsAccount && !asset.isNative()) {
    throw new ValidationError({
      destination: t('error.destination.needsXlm'),
    });
  }
  if (createsAccount && toStroops(amount) < STROOPS_PER_XLM) {
    throw new ValidationError({
      amount: t('error.destination.minimum'),
    });
  }
  if (
    target &&
    !asset.isNative() &&
    !target.balances.some(
      (balance) => balance.asset_code === asset.getCode() && balance.asset_issuer === asset.getIssuer(),
    )
  ) {
    throw new ValidationError({
      destination: t('error.destination.noTrustline', { asset: assetLabel }),
    });
  }

  const builder = new TransactionBuilder(new Account(source.id, source.sequence), {
    fee,
    networkPassphrase: network.passphrase,
  })
    .addOperation(
      createsAccount
        ? Operation.createAccount({ destination, startingBalance: amount })
        : Operation.payment({ destination, asset, amount }),
    )
    .setTimeout(180);
  if (memo) {
    builder.addMemo(Memo.text(memo));
  }

  return {
    tx: builder.build(),
    asset,
    assetLabel,
    createsAccount,
    feeXlm: formatStroops(feeStroops),
  };
}

/**
 * Signs and submits a prepared payment.
 *
 * @param network - Network config.
 * @param keypair - Sender.
 * @param payment - The prepared payment.
 * @returns Hash, ledger and explorer link.
 */
export async function sendPayment(network: NetworkConfig, keypair: Keypair, payment: PreparedPayment) {
  return signAndSubmit(network, keypair, payment.tx);
}
