import { AppError } from '@/lib/errors';
import type { StellarNetwork } from '@/types';

function friendbotUrl(network: StellarNetwork, address: string): string {
  return network === 'futurenet'
    ? `https://friendbot-futurenet.stellar.org/?addr=${address}`
    : `https://friendbot.stellar.org/?addr=${address}`;
}

/** Funds `address` with test XLM. */
export async function fundWithFriendbot(network: StellarNetwork, address: string): Promise<void> {
  const response = await fetch(friendbotUrl(network, address));
  if (!response.ok) throw new AppError('error.friendbot', { status: response.status });
}
