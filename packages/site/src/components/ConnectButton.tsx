import { ActionButton } from '@/components/ActionButton';
import { useI18n } from '@/i18n';
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
  const { t } = useI18n();
  return (
    <ActionButton ink label={t('connect.done')} action={onConnect} className={className}>
      {connected && account ? shortAddress(account.address) : t('connect.button')}
    </ActionButton>
  );
}
