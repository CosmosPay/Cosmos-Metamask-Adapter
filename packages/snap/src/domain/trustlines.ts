import type { Keypair, Transaction } from '@stellar/stellar-sdk/base';
import { Account, Asset, Operation, StrKey, TransactionBuilder } from '@stellar/stellar-sdk/base';

import type { NetworkConfig } from '@/config/networks';
import { localizeNumber, t } from '@/i18n';
import { fetchAccount, fetchBaseFee } from '@/services/horizon';
import { formatStroops, toStroops } from '@/domain/amounts';
import { BASE_RESERVE, spendableStroops } from '@/domain/balances';
import { ValidationError } from '@/domain/errors';

export type TrustlineRequest = {
  code: string;
  issuer: string;
  remove?: boolean;
};

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
    throw new ValidationError(errors);
  }

  const [source, issuerAccount, fee] = await Promise.all([
    fetchAccount(network, keypair.publicKey()),
    fetchAccount(network, issuer),
    fetchBaseFee(network),
  ]);
  if (!source) {
    throw new ValidationError({
      code: t('error.account.inactive', { network: network.name }),
    });
  }
  if (!issuerAccount) {
    throw new ValidationError({
      issuer: t('error.trust.issuerMissing', { network: network.name }),
    });
  }

  const line = source.balances.find((balance) => balance.asset_code === code && balance.asset_issuer === issuer);
  const feeStroops = BigInt(fee);

  if (remove) {
    if (!line) {
      throw new ValidationError({
        code: t('error.trust.notFound', { asset: code }),
      });
    }
    if (toStroops(line.balance) !== 0n || toStroops(line.buying_liabilities ?? '0') !== 0n) {
      throw new ValidationError({
        code: t('error.trust.balance', { asset: code }),
      });
    }
  } else {
    if (line) {
      throw new ValidationError({
        code: t('error.trust.exists', { asset: code }),
      });
    }
    const native = source.balances.find((balance) => balance.asset_type === 'native');
    const available = native ? spendableStroops(source, native) : 0n;
    const needed = BASE_RESERVE + feeStroops;
    if (available < needed) {
      throw new ValidationError({
        code: t('error.trust.reserve', {
          needed: localizeNumber(formatStroops(needed)),
        }),
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
