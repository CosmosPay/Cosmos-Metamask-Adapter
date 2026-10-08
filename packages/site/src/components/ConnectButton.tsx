import { ActionButton } from '@/components/ActionButton';
import { shortAddress } from '@/lib/account';
import type { AccountSnapshot } from '@/types';

type ConnectButtonProps = {
  connected: boolean;
  account: AccountSnapshot | null;
  onConnect: () => Promise<unknown>;
  className?: string;
};

/** Connects MetaMask; once connected it shows the account instead. */
export function ConnectButton({ connected, account, onConnect, className }: ConnectButtonProps) {
  return (
    <ActionButton label="Conectado" action={onConnect} className={className}>
      {connected && account ? shortAddress(account.address) : 'Conectar MetaMask'}
    </ActionButton>
  );
}
