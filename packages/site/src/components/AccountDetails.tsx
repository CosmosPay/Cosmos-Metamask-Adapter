import { backendLabel, EMPTY_VALUE, formatBalance, formatLinkedAddresses } from '@/lib/account';
import type { AccountSnapshot } from '@/types';

/** Address, signer, balance and linked EVM account; placeholders until loaded. */
export function AccountDetails({ account }: { account: AccountSnapshot | null }) {
  return (
    <dl>
      <dt>Dirección</dt>
      <dd>
        <code>{account?.address}</code>
      </dd>
      <dt>Firmante</dt>
      <dd>{account && backendLabel(account.backend)}</dd>
      <dt>Saldo</dt>
      <dd>{account ? formatBalance(account.balance) : EMPTY_VALUE}</dd>
      <dt>EVM vinculada</dt>
      <dd>{account ? formatLinkedAddresses(account.linkedEvmAddresses) : EMPTY_VALUE}</dd>
    </dl>
  );
}
