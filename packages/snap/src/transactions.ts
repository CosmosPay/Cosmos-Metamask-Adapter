import type { Asset, FeeBumpTransaction, OperationRecord, Transaction } from '@stellar/stellar-sdk/base';

import { t } from './i18n';
import { describeHostFunction } from './soroban';
import type { OperationSummary } from './ui';

const formatAsset = (asset: Asset) =>
  asset.isNative() ? 'XLM' : `${asset.getCode()} (${(asset.getIssuer() ?? '').slice(0, 6)}...)`;

/**
 * Turns a decoded operation into labelled rows the user can review.
 *
 * @param op - The operation.
 * @returns A human readable summary.
 */
export function describeOperation(op: OperationRecord): OperationSummary {
  const details: [string, string][] = [];
  if (op.source) {
    details.push([t('field.opSource'), op.source]);
  }

  switch (op.type) {
    case 'createAccount':
      details.push([t('field.destination'), op.destination], [t('field.startingBalance'), `${op.startingBalance} XLM`]);
      return { type: t('op.createAccount'), details };
    case 'payment':
      details.push(
        [t('field.destination'), op.destination],
        [t('field.amount'), `${op.amount} ${formatAsset(op.asset)}`],
      );
      return { type: t('op.payment'), details };
    case 'pathPaymentStrictSend':
      details.push(
        [t('field.destination'), op.destination],
        [t('field.sends'), `${op.sendAmount} ${formatAsset(op.sendAsset)}`],
        [t('field.receivesMin'), `${op.destMin} ${formatAsset(op.destAsset)}`],
      );
      return { type: t('op.pathPayment'), details };
    case 'pathPaymentStrictReceive':
      details.push(
        [t('field.destination'), op.destination],
        [t('field.sendsMax'), `${op.sendMax} ${formatAsset(op.sendAsset)}`],
        [t('field.receives'), `${op.destAmount} ${formatAsset(op.destAsset)}`],
      );
      return { type: t('op.pathPayment'), details };
    case 'changeTrust':
      details.push(
        [t('field.asset'), 'code' in op.line ? formatAsset(op.line as Asset) : t('op.liquidityPool')],
        [t('field.limit'), op.limit],
      );
      return {
        type: Number(op.limit) === 0 ? t('op.removeTrustline') : t('op.addTrustline'),
        details,
      };
    case 'manageSellOffer':
    case 'manageBuyOffer':
      details.push(
        [t('field.selling'), formatAsset(op.selling)],
        [t('field.buying'), formatAsset(op.buying)],
        [t('field.amount'), op.type === 'manageSellOffer' ? op.amount : op.buyAmount],
        [t('field.price'), op.price],
      );
      return { type: t('op.dexOffer'), details };
    case 'setOptions':
      if (op.signer) {
        details.push([t('field.signer'), JSON.stringify(op.signer)]);
      }
      if (op.masterWeight !== undefined) {
        details.push([t('field.masterWeight'), String(op.masterWeight)]);
      }
      if (op.homeDomain !== undefined) {
        details.push([t('field.homeDomain'), op.homeDomain]);
      }
      return { type: t('op.setOptions'), details };
    case 'accountMerge':
      details.push([t('field.destination'), op.destination]);
      return { type: t('op.accountMerge'), details };
    case 'invokeHostFunction': {
      const described = describeHostFunction(op.func);
      const auth = op.auth ?? [];
      return {
        type: described.type,
        details: [
          ...details,
          ...described.details,
          ...(auth.length > 0 ? [[t('field.authCount'), String(auth.length)] as [string, string]] : []),
        ],
      };
    }
    case 'extendFootprintTtl':
      details.push([t('field.extendTo'), String(op.extendTo)]);
      return { type: t('op.extendTtl'), details };
    case 'restoreFootprint':
      return { type: t('op.restore'), details };
    default:
      return { type: op.type, details };
  }
}

/**
 * Returns the transaction whose operations the user is approving.
 *
 * @param tx - A transaction or fee bump transaction.
 * @returns The inner transaction.
 */
export function innerTransaction(tx: Transaction | FeeBumpTransaction): Transaction {
  return 'innerTransaction' in tx ? tx.innerTransaction : tx;
}
