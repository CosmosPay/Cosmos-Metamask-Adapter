import { AppError } from '@/lib/errors';
import type { PaymentInput, StellarNetwork, StellarWallet } from '@/types';

/** Sends XLM through the snap; on mainnet the official MetaMask UI handles payments. */
export async function sendPayment(
  wallet: Pick<StellarWallet, 'backend' | 'snap'>,
  network: StellarNetwork,
  input: PaymentInput,
) {
  if (wallet.backend === 'official') {
    throw new AppError('error.mainnetPayment');
  }
  const memo = input.memo.trim();
  return wallet.snap.sendPayment({
    network,
    destination: input.destination.trim(),
    amount: input.amount.trim(),
    ...(memo ? { memo } : {}),
  });
}
