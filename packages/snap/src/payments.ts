import type { Keypair, Transaction } from '@stellar/stellar-sdk/base';
import { Account, Asset, Memo, Operation, StrKey, TransactionBuilder } from '@stellar/stellar-sdk/base';

import type { HorizonAccount, HorizonBalance } from './horizon';
import { fetchAccount, fetchBaseFee, submitTransaction } from './horizon';
import type { NetworkConfig } from './networks';
import { localizeNumber, t } from './i18n';

const STROOPS_PER_XLM = 10_000_000n;
const BASE_RESERVE = 5_000_000n; // 0.5 XLM
const AMOUNT_PATTERN = /^\d+(\.\d{1,7})?$/u;

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

/** Field-level validation errors, keyed by request field. */
export class PaymentValidationError extends Error {
  readonly fields: Record<string, string>;

  constructor(fields: Record<string, string>) {
    super(Object.values(fields).join(' '));
    this.name = 'PaymentValidationError';
    this.fields = fields;
  }
}

export const toStroops = (amount: string): bigint => {
  const [whole = '0', fraction = ''] = amount.split('.');
  return BigInt(whole) * STROOPS_PER_XLM + BigInt(fraction.padEnd(7, '0'));
};

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

export const assetKey = (balance: HorizonBalance) =>
  balance.asset_type === 'native' ? 'native' : `${balance.asset_code}:${balance.asset_issuer}`;

export const assetLabelOf = (balance: HorizonBalance) =>
  balance.asset_type === 'native' ? 'XLM' : balance.asset_code ?? '?';

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
    2n +
    BigInt(account.subentry_count ?? 0) +
    BigInt(account.num_sponsoring ?? 0) -
    BigInt(account.num_sponsored ?? 0);
  const spendable = total - entries * BASE_RESERVE;
  return spendable > 0n ? spendable : 0n;
}

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
  if (!AMOUNT_PATTERN.test(amount) || toStroops(amount) <= 0n) {
    errors.amount = t('error.amount.invalid');
  }
  if (memo && new TextEncoder().encode(memo).length > 28) {
    errors.memo = t('error.memo.tooLong');
  }
  if ((request.assetCode === undefined) !== (request.assetIssuer === undefined)) {
    errors.assetCode = t('error.asset.invalid');
  }
  if (Object.keys(errors).length > 0) {
    throw new PaymentValidationError(errors);
  }

  const asset =
    request.assetCode && request.assetIssuer
      ? new Asset(request.assetCode, request.assetIssuer)
      : Asset.native();
  const assetLabel = asset.isNative() ? 'XLM' : asset.getCode();

  const [source, target, fee] = await Promise.all([
    fetchAccount(network, keypair.publicKey()),
    fetchAccount(network, destination),
    fetchBaseFee(network),
  ]);
  if (!source) {
    throw new PaymentValidationError({
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
    throw new PaymentValidationError({
      amount: t('error.balance.insufficient', {
        available: localizeNumber(formatStroops(available)),
        asset: assetLabel,
      }),
    });
  }

  const createsAccount = target === null;
  if (createsAccount && !asset.isNative()) {
    throw new PaymentValidationError({
      destination: t('error.destination.needsXlm'),
    });
  }
  if (createsAccount && toStroops(amount) < STROOPS_PER_XLM) {
    throw new PaymentValidationError({
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
    throw new PaymentValidationError({
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
 * Signs and submits a transaction built by this module.
 *
 * @param network - Network config.
 * @param keypair - Signer.
 * @param tx - The transaction.
 * @returns Hash, ledger and explorer link.
 */
export async function signAndSubmit(network: NetworkConfig, keypair: Keypair, tx: Transaction) {
  tx.sign(keypair);
  const result = await submitTransaction(network, tx.toXDR());
  return { ...result, explorerUrl: `${network.explorerUrl}/tx/${result.hash}` };
}

/**
 * Signs and submits a prepared payment.
 *
 * @param network - Network config.
 * @param keypair - Sender.
 * @param payment - The prepared payment.
 * @returns Hash, ledger and explorer link.
 */
export async function sendPayment(
  network: NetworkConfig,
  keypair: Keypair,
  payment: PreparedPayment,
) {
  return signAndSubmit(network, keypair, payment.tx);
}

export type TrustlineRequest = { code: string; issuer: string; remove?: boolean };

export type PreparedTrustline = {
  tx: Transaction;
  code: string;
  issuer: string;
  /** Issuer's home domain from its account, if set. */
  domain: string | null;
  remove: boolean;
  feeXlm: string;
};

const ASSET_CODE = /^[a-zA-Z0-9]{1,12}$/u;

/**
 * Validates and builds a changeTrust transaction (add or remove a trustline).
 *
 * @param network - Network config.
 * @param keypair - Account owner.
 * @param request - Asset and whether to remove it.
 * @returns The prepared trustline change.
 */
export async function prepareTrustline(
  network: NetworkConfig,
  keypair: Keypair,
  request: TrustlineRequest,
): Promise<PreparedTrustline> {
  const code = request.code.trim();
  const issuer = request.issuer.trim();
  const remove = Boolean(request.remove);

  const errors: Record<string, string> = {};
  if (!ASSET_CODE.test(code)) {
    errors.code = t('error.trust.code');
  }
  if (!StrKey.isValidEd25519PublicKey(issuer) || issuer === keypair.publicKey()) {
    errors.issuer = t('error.trust.issuer');
  }
  if (Object.keys(errors).length > 0) {
    throw new PaymentValidationError(errors);
  }

  const [source, issuerAccount, fee] = await Promise.all([
    fetchAccount(network, keypair.publicKey()),
    fetchAccount(network, issuer),
    fetchBaseFee(network),
  ]);
  if (!source) {
    throw new PaymentValidationError({ code: t('error.account.inactive', { network: network.name }) });
  }
  if (!issuerAccount) {
    throw new PaymentValidationError({ issuer: t('error.trust.issuerMissing', { network: network.name }) });
  }

  const line = source.balances.find(
    (balance) => balance.asset_code === code && balance.asset_issuer === issuer,
  );
  const feeStroops = BigInt(fee);

  if (remove) {
    if (!line) {
      throw new PaymentValidationError({ code: t('error.trust.notFound', { asset: code }) });
    }
    if (toStroops(line.balance) !== 0n || toStroops(line.buying_liabilities ?? '0') !== 0n) {
      throw new PaymentValidationError({ code: t('error.trust.balance', { asset: code }) });
    }
  } else {
    if (line) {
      throw new PaymentValidationError({ code: t('error.trust.exists', { asset: code }) });
    }
    const native = source.balances.find((balance) => balance.asset_type === 'native');
    const available = native ? spendableStroops(source, native) : 0n;
    const needed = BASE_RESERVE + feeStroops;
    if (available < needed) {
      throw new PaymentValidationError({
        code: t('error.trust.reserve', { needed: localizeNumber(formatStroops(needed)) }),
      });
    }
  }

  const tx = new TransactionBuilder(new Account(source.id, source.sequence), {
    fee,
    networkPassphrase: network.passphrase,
  })
    .addOperation(
      Operation.changeTrust({
        asset: new Asset(code, issuer),
        ...(remove ? { limit: '0' } : {}),
      }),
    )
    .setTimeout(180)
    .build();

  return {
    tx,
    code,
    issuer,
    domain: issuerAccount.home_domain ?? null,
    remove,
    feeXlm: formatStroops(feeStroops),
  };
}
