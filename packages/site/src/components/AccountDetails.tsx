import { useI18n } from '@/i18n';
import { backendLabel, EMPTY_VALUE, formatBalance, formatLinkedAddresses } from '@/lib/account';
import type { AccountSnapshot } from '@/types';

/** Address, signer, balance and linked EVM account; placeholders until loaded. */
export function AccountDetails({ account }: { account: AccountSnapshot | null }) {
  const { t } = useI18n();
  return (
    <dl>
      <dt>{t('account.address')}</dt>
      <dd>
        <code>{account?.address}</code>
      </dd>
      <dt>{t('account.signer')}</dt>
      <dd>{account && backendLabel(account.backend, t)}</dd>
      <dt>{t('account.balance')}</dt>
      <dd>{account ? formatBalance(account.balance, t) : EMPTY_VALUE}</dd>
      <dt>{t('account.evm')}</dt>
      <dd>{account ? formatLinkedAddresses(account.linkedEvmAddresses) : EMPTY_VALUE}</dd>
    </dl>
  );
}
