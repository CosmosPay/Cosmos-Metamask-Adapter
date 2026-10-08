import { t } from '@/i18n';
import type { NetworkConfig } from '@/config/networks';

export type HorizonBalance = {
  balance: string;
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
  selling_liabilities?: string;
  buying_liabilities?: string;
};

export type HorizonAccount = {
  id: string;
  sequence: string;
  subentry_count?: number;
  num_sponsoring?: number;
  num_sponsored?: number;
  home_domain?: string;
  balances: HorizonBalance[];
};

/**
 * Loads an account from Horizon.
 *
 * @param network - Network config.
 * @param address - G... address.
 * @returns The account, or `null` if it is not funded yet.
 */
export async function fetchAccount(network: NetworkConfig, address: string): Promise<HorizonAccount | null> {
  const response = await fetch(`${network.horizonUrl}/accounts/${address}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Horizon error ${response.status} loading account.`);
  }
  return (await response.json()) as HorizonAccount;
}

/**
 * Fetches the recommended base fee (in stroops) from Horizon.
 *
 * @param network - Network config.
 * @returns The base fee as a string.
 */
export async function fetchBaseFee(network: NetworkConfig): Promise<string> {
  try {
    const response = await fetch(`${network.horizonUrl}/fee_stats`);
    const stats = (await response.json()) as {
      fee_charged?: { p50?: string };
    };
    return stats.fee_charged?.p50 ?? '100';
  } catch {
    return '100';
  }
}

/**
 * Submits a signed transaction envelope to Horizon.
 *
 * @param network - Network config.
 * @param xdr - Base64 transaction envelope.
 * @returns The transaction hash.
 */
export async function submitTransaction(
  network: NetworkConfig,
  xdr: string,
): Promise<{ hash: string; ledger: number }> {
  const response = await fetch(`${network.horizonUrl}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `tx=${encodeURIComponent(xdr)}`,
  });
  const result = (await response.json()) as {
    hash?: string;
    ledger?: number;
    title?: string;
    extras?: { result_codes?: unknown };
  };
  if (!response.ok || !result.hash) {
    const codes = result.extras?.result_codes ? ` ${JSON.stringify(result.extras.result_codes)}` : '';
    throw new Error(`Transaction failed: ${result.title ?? response.status}${codes}`);
  }
  return { hash: result.hash, ledger: result.ledger ?? 0 };
}

/**
 * Asks Friendbot (test networks only) to create and fund an account.
 *
 * @param network - Network config.
 * @param address - G... address.
 */
export async function requestFriendbot(network: NetworkConfig, address: string): Promise<void> {
  if (!network.friendbotUrl) {
    throw new Error(t('error.friendbot.mainnet'));
  }
  const response = await fetch(`${network.friendbotUrl}?addr=${encodeURIComponent(address)}`);
  if (!response.ok) {
    throw new Error(
      response.status === 400
        ? t('error.friendbot.alreadyFunded')
        : t('error.friendbot.status', { status: response.status }),
    );
  }
}

export type HorizonPayment = {
  id: string;
  type: string;
  created_at: string;
  transaction_hash: string;
  from?: string;
  to?: string;
  amount?: string;
  asset_type?: string;
  asset_code?: string;
  funder?: string;
  account?: string;
  starting_balance?: string;
  /** Path payments: what was sold. */
  source_amount?: string;
  source_asset_type?: string;
  source_asset_code?: string;
  /** Joined with `join=transactions`. */
  transaction?: { memo_type?: string; memo?: string; operation_count?: number; fee_charged?: string };
};

/**
 * One payment operation by id, with its transaction (for the detail screen).
 *
 * @param network - Network config.
 * @param id - Operation id.
 * @returns The record, or null when Horizon doesn't know it.
 */
export async function fetchOperation(network: NetworkConfig, id: string): Promise<HorizonPayment | null> {
  const response = await fetch(`${network.horizonUrl}/operations/${encodeURIComponent(id)}?join=transactions`);
  if (!response.ok) {
    return null;
  }
  return (await response.json()) as HorizonPayment;
}

/**
 * Latest payments (incl. account creation) touching an account.
 *
 * @param network - Network config.
 * @param address - G... address.
 * @param limit - How many records.
 * @returns Newest first; empty for unfunded accounts.
 */
export async function fetchPayments(network: NetworkConfig, address: string, limit = 10): Promise<HorizonPayment[]> {
  const response = await fetch(
    `${network.horizonUrl}/accounts/${address}/payments?order=desc&limit=${limit}&join=transactions`,
  );
  if (response.status === 404) {
    return [];
  }
  if (!response.ok) {
    throw new Error(`Horizon error ${response.status} loading payments.`);
  }
  const page = (await response.json()) as {
    _embedded?: { records?: HorizonPayment[] };
  };
  return page._embedded?.records ?? [];
}
