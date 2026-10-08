import { useAction } from '@/hooks/useAction';
import { canUseFriendbot } from '@/lib/account';
import type { AccountSnapshot, StellarNetwork } from '@/types';
import { AccountDetails } from '@/components/AccountDetails';
import { ActionButton } from '@/components/ActionButton';
import { NetworkSelect } from '@/components/NetworkSelect';

type AccountCardProps = {
  connected: boolean;
  account: AccountSnapshot | null;
  selectedNetwork: StellarNetwork;
  onConnect: () => Promise<unknown>;
  onSwitchNetwork: (network: StellarNetwork) => Promise<unknown>;
  onRefresh: () => Promise<unknown>;
  onFund: () => Promise<unknown>;
  onLink: () => Promise<unknown>;
};

export function AccountCard({
  connected,
  account,
  selectedNetwork,
  onConnect,
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
        <ActionButton label="Conectado" action={onConnect}>
          {connected ? 'Conectado' : 'Conectar MetaMask'}
        </ActionButton>
        <NetworkSelect
          value={selectedNetwork}
          disabled={!connected}
          onChange={(network) => void switchNetwork.run(network)}
        />
      </div>
      {connected && (
        <>
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
        </>
      )}
    </section>
  );
}
