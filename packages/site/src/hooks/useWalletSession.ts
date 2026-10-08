import { useCallback, useEffect, useState } from 'react';
import { useWalletClient } from '@/context/WalletContext';
import { loadAccountSnapshot } from '@/services/account';
import type { AccountSnapshot, StellarNetwork } from '@/types';

export type WalletSession = {
  connected: boolean;
  /** Latest snapshot; null until the first load after connecting. */
  account: AccountSnapshot | null;
  /** Network shown in the selector (optimistic while switching). */
  selectedNetwork: StellarNetwork;
  connect: () => Promise<unknown>;
  refresh: () => Promise<AccountSnapshot>;
  switchNetwork: (network: StellarNetwork) => Promise<unknown>;
};

/** Connection state and the account snapshot, kept fresh on wallet changes. */
export function useWalletSession(): WalletSession {
  const wallet = useWalletClient();
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState<AccountSnapshot | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<StellarNetwork>('testnet');

  const refresh = useCallback(async () => {
    const snapshot = await loadAccountSnapshot(wallet);
    setAccount(snapshot);
    setSelectedNetwork(snapshot.network);
    return snapshot;
  }, [wallet]);

  const connect = useCallback(async (): Promise<unknown> => {
    const result = await wallet.requestAccess();
    if (result.error) return result;
    setConnected(true);
    await refresh();
    return { address: result.address, backend: wallet.backend };
  }, [wallet, refresh]);

  const switchNetwork = useCallback(
    async (network: StellarNetwork) => {
      setSelectedNetwork(network);
      const result = await wallet.switchNetwork(network);
      await refresh();
      return result;
    },
    [wallet, refresh],
  );

  useEffect(() => {
    if (!connected) return;
    return wallet.onChange(() => {
      refresh().catch((error: unknown) => console.error(error));
    });
  }, [connected, wallet, refresh]);

  return { connected, account, selectedNetwork, connect, refresh, switchNetwork };
}
