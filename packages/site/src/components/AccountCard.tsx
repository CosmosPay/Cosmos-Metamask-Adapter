import { useAction } from '@/hooks/useAction';
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
  // The selector stays enabled while a switch is in flight.
  const switchNetwork = useAction('Red cambiada', onSwitchNetwork);

  return (
    <section className="card">
      <div className="row">
        <h2>Tu cuenta</h2>
        <NetworkSelect value={selectedNetwork} onChange={(network) => void switchNetwork.run(network)} />
      </div>
      <AccountDetails account={account} />
      <div className="row">
        <ActionButton variant="secondary" label="Actualizado" action={onRefresh}>
          Actualizar saldo
        </ActionButton>
        {account && canUseFriendbot(account) && (
          <ActionButton variant="secondary" label="Friendbot" action={onFund}>
            Fondear con Friendbot
          </ActionButton>
        )}
        <ActionButton variant="secondary" label="Cuentas vinculadas" action={onLink}>
          Vincular mi cuenta EVM
        </ActionButton>
      </div>
    </section>
  );
}
