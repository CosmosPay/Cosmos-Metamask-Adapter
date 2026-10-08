import { useAction } from '@/hooks/useAction';
import { useI18n } from '@/i18n';
import { canUseFriendbot } from '@/lib/account';
import type { AccountSnapshot, StellarNetwork } from '@/types';
import { AccountDetails } from '@/components/AccountDetails';
import { ActionButton } from '@/components/ActionButton';
import { NetworkSelect } from '@/components/NetworkSelect';

type AccountCardProps = {
  account: AccountSnapshot | null;
  selectedNetwork: StellarNetwork;
  onSwitchNetwork: (network: StellarNetwork) => Promise<unknown>;
  onRefresh: () => Promise<unknown>;
  onFund: () => Promise<unknown>;
  onLink: () => Promise<unknown>;
};

/** The connected account; connecting itself happens in the header. */
export function AccountCard({
  account,
  selectedNetwork,
  onSwitchNetwork,
  onRefresh,
  onFund,
  onLink,
}: AccountCardProps) {
  const { t } = useI18n();
  // The selector stays enabled while a switch is in flight.
  const switchNetwork = useAction(t('account.switched'), onSwitchNetwork);

  return (
    <section className="card">
      <div className="row">
        <h2>{t('account.title')}</h2>
        <NetworkSelect value={selectedNetwork} onChange={(network) => void switchNetwork.run(network)} />
      </div>
      <AccountDetails account={account} />
      <div className="row">
        <ActionButton variant="secondary" label={t('account.refreshed')} action={onRefresh}>
          {t('account.refresh')}
        </ActionButton>
        {account && canUseFriendbot(account) && (
          <ActionButton variant="secondary" label={t('account.friendbot')} action={onFund}>
            {t('account.fund')}
          </ActionButton>
        )}
        <ActionButton variant="secondary" label={t('account.linked')} action={onLink}>
          {t('account.link')}
        </ActionButton>
      </div>
    </section>
  );
}
