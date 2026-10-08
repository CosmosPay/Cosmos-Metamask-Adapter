import type { NetworkConfig } from '@/config/networks';
import { hideBalances } from '@/i18n';
import { fetchAccount } from '@/services/horizon';
import { fetchPrices, XLM_ASSET_ID } from '@/services/prices';
import { balanceText, formatFiat } from '@/ui/format';
import { getKeypair } from '@/wallet/keyring';
import type { AccountRowData } from '@/home/types';

/**
 * One row per account with its XLM balance (in fiat when prices are on).
 *
 * @param network - Network to read balances from.
 * @param indexes - Account indexes.
 * @returns The rows.
 */
export async function accountRows(network: NetworkConfig, indexes: number[]): Promise<AccountRowData[]> {
  const [prices, addresses] = await Promise.all([
    fetchPrices([XLM_ASSET_ID]),
    Promise.all(indexes.map(async (index) => (await getKeypair(index)).publicKey())),
  ]);
  const price = prices[XLM_ASSET_ID];
  return Promise.all(
    indexes.map(async (index, position) => {
      const address = addresses[position] ?? '';
      const account = await fetchAccount(network, address).catch(() => null);
      const native = account?.balances.find((balance) => balance.asset_type === 'native');
      const amount = native?.balance ?? '0';
      const balance =
        price && !hideBalances()
          ? formatFiat(Number(amount) * price.price, price.currency)
          : `${balanceText(amount)} XLM`;
      return { index, address, balance };
    }),
  );
}
