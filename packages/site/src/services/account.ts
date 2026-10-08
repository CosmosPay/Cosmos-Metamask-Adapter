import { networkFromSep43Name } from '@/lib/network';
import type { AccountSnapshot, Balance, StellarNetwork, StellarWallet } from '@/types';

/** Native XLM balance; only the snap backend can report it. */
export async function loadBalance(
  wallet: Pick<StellarWallet, 'backend' | 'snap'>,
  network: StellarNetwork,
): Promise<Balance> {
  if (wallet.backend !== 'snap') return { kind: 'unknown' };
  const { funded, balances } = await wallet.snap.getBalance({ network });
  if (!funded) return { kind: 'unfunded' };
  const native = balances.find((balance) => balance.asset_type === 'native');
  return { kind: 'funded', xlm: native?.balance ?? '0' };
}

/** Reads address, network, signer, balance and linked EVM accounts from the wallet. */
export async function loadAccountSnapshot(wallet: StellarWallet): Promise<AccountSnapshot> {
  const { address } = await wallet.getAddress();
  const details = await wallet.getNetworkDetails();
  const network = networkFromSep43Name(details.network);
  if (!network) {
    throw new Error(details.error?.message ?? `Red desconocida: ${details.network}`);
  }
  const balance = await loadBalance(wallet, network);
  const { links } = await wallet.getLinkedAddresses();
  return {
    address,
    network,
    backend: wallet.backend,
    balance,
    linkedEvmAddresses: links.map((link) => link.evmAddress),
  };
}
