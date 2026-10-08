import { createContext, useContext, type ReactNode } from 'react';
import type { StellarWallet } from '@/types';

const WalletContext = createContext<StellarWallet | null>(null);

export function WalletProvider({ wallet, children }: { wallet: StellarWallet; children: ReactNode }) {
  return <WalletContext value={wallet}>{children}</WalletContext>;
}

/** The injected wallet adapter. */
export function useWalletClient(): StellarWallet {
  const wallet = useContext(WalletContext);
  if (!wallet) throw new Error('useWalletClient must be used inside <WalletProvider>');
  return wallet;
}
