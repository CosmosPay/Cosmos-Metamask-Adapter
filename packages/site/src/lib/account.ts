import type { AccountSnapshot, Backend, Balance } from '@/types';

export const EMPTY_VALUE = '—';

export function formatBalance(balance: Balance): string {
  switch (balance.kind) {
    case 'funded':
      return `${balance.xlm} XLM`;
    case 'unfunded':
      return 'Cuenta sin fondos';
    case 'unknown':
      return EMPTY_VALUE;
  }
}

export function backendLabel(backend: Backend): string {
  return backend === 'official' ? 'MetaMask (soporte oficial de Stellar)' : 'Stellar Snap';
}

export function formatLinkedAddresses(addresses: string[]): string {
  return addresses.join(', ') || EMPTY_VALUE;
}

/** Friendbot only exists on test networks and only makes sense for unfunded accounts. */
export function canUseFriendbot(account: AccountSnapshot): boolean {
  return account.network !== 'mainnet' && account.balance.kind === 'unfunded';
}

/** `GABC…WXYZ`: enough to recognise an account in tight spots like the nav. */
export function shortAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 4)}…${address.slice(-4)}` : address;
}
