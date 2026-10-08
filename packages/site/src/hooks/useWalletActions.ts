import { useCallback } from 'react';
import { useWalletClient } from '@/context/WalletContext';
import { formatBalance } from '@/lib/account';
import { fundWithFriendbot } from '@/services/friendbot';
import { sendPayment } from '@/services/payment';
import { signDemoAuthorization } from '@/services/sorobanAuth';
import type { AccountSnapshot, PaymentInput } from '@/types';
import type { WalletSession } from '@/hooks/useWalletSession';

/** Account-level operations. Each returns what the log should show. */
export function useWalletActions({ account, refresh }: Pick<WalletSession, 'account' | 'refresh'>) {
  const wallet = useWalletClient();

  const requireAccount = useCallback((): AccountSnapshot => {
    if (!account) throw new Error('Conecta MetaMask primero.');
    return account;
  }, [account]);

  const refreshBalance = useCallback(async () => formatBalance((await refresh()).balance), [refresh]);

  const fund = useCallback(async () => {
    const { network, address } = requireAccount();
    await fundWithFriendbot(network, address);
    await refresh();
    return 'Cuenta fondeada con XLM de prueba.';
  }, [requireAccount, refresh]);

  const linkEvm = useCallback(async () => {
    const result = await wallet.linkEvmAddress();
    await refresh();
    return result;
  }, [wallet, refresh]);

  const signAuth = useCallback(
    async () => signDemoAuthorization(wallet, requireAccount().address),
    [wallet, requireAccount],
  );

  const pay = useCallback(
    async (input: PaymentInput) => {
      const result = await sendPayment(wallet, requireAccount().network, input);
      await refresh();
      return result;
    },
    [wallet, requireAccount, refresh],
  );

  const signMessage = useCallback((message: string) => wallet.signMessage(message), [wallet]);

  return { refreshBalance, fund, linkEvm, signAuth, pay, signMessage };
}
