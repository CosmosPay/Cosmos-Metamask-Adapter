import { formatDate, t } from '@/i18n';
import type { HorizonPayment } from '@/services/horizon';
import { balanceText, shorten } from '@/ui/format';
import { activityIcon } from '@/ui/graphics/icons';

export type ActivityItem = ReturnType<typeof describeActivity>;

/** How one Horizon payment reads in the wallet. */
export function describeActivity(payment: HorizonPayment, address: string) {
  const created = payment.type === 'create_account';
  // A swap is a path payment back to ourselves.
  const swap = !created && payment.from === address && payment.to === address;
  const outgoing = !swap && (created ? payment.funder === address : payment.from === address);
  const counterparty =
    (created ? (outgoing ? payment.account : payment.funder) : outgoing ? payment.to : payment.from) ?? '';
  const asset = created || payment.asset_type === 'native' ? 'XLM' : (payment.asset_code ?? '?');
  const amount = balanceText((created ? payment.starting_balance : payment.amount) ?? '0');
  const memo = payment.transaction?.memo_type === 'text' ? payment.transaction.memo : undefined;
  const sold =
    swap && payment.source_amount
      ? `${balanceText(payment.source_amount)} ${payment.source_asset_type === 'native' ? 'XLM' : (payment.source_asset_code ?? '?')}`
      : undefined;
  // A leg of a bigger transaction (e.g. the Cosmos swap commission) is named
  // by the transaction's own message; a plain payment keeps Sent / Received
  // with its memo as detail.
  const leg = (payment.transaction?.operation_count ?? 1) > 1;
  const title = swap
    ? t('activity.swap')
    : created && !outgoing
      ? t('activity.created')
      : leg && memo
        ? memo
        : outgoing
          ? t('activity.sent')
          : t('activity.received');
  const detail = swap ? (sold ? `${sold} →` : '') : !leg && memo ? memo : shorten(counterparty);
  return {
    swap,
    outgoing,
    counterparty,
    memo,
    sold,
    title,
    detail,
    value: `${outgoing ? '-' : '+'}${amount} ${asset}`,
    icon: activityIcon(swap ? 'swap' : outgoing ? 'out' : 'in'),
  };
}
/** Subtitle of an activity row: date, plus the detail when there is one. */
export const activitySubtitle = (payment: HorizonPayment, item: ActivityItem) =>
  item.detail ? `${formatDate(payment.created_at)} · ${item.detail}` : formatDate(payment.created_at);
