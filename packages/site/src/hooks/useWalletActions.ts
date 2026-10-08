import { useCallback } from 'react';
import { useWalletClient } from '@/context/WalletContext';
import { useI18n } from '@/i18n';
import { formatBalance } from '@/lib/account';
import { AppError } from '@/lib/errors';
import { fundWithFriendbot } from '@/services/friendbot';
import { sendPayment } from '@/services/payment';
import type { AccountSnapshot, PaymentInput } from '@/types';
import type { WalletSession } from '@/hooks/useWalletSession';

/** Account-level operations. Each returns what the log should show, in the user's language. */
export function useWalletActions({ account, refresh }: Pick<WalletSession, 'account' | 'refresh'>) {
  const wallet = useWalletClient();
  const { t } = useI18n();

  const requireAccount = useCallback((): AccountSnapshot => {
    if (!account) throw new AppError('error.connectFirst');
    return account;
  }, [account]);

  const refreshBalance = useCallback(async () => formatBalance((await refresh()).balance, t), [refresh, t]);

  const fund = useCallback(async () => {
    const { network, address } = requireAccount();
    await fundWithFriendbot(network, address);
    await refresh();
    return t('account.funded');
  }, [requireAccount, refresh, t]);

  const linkEvm = useCallback(async () => {
    const result = await wallet.linkEvmAddress();
    await refresh();
    return result;
  }, [wallet, refresh]);

  const signAuth = useCallback(async () => {
    const address = requireAccount().address;
    // The Stellar SDK is most of the site's code and only this demo needs it: load it on first use.
    const { signDemoAuthorization } = await import('@/services/sorobanAuth');
    return signDemoAuthorization(wallet, address);
  }, [wallet, requireAccount]);

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
