import type { StellarNetwork } from '@/types';

const SEP43_NETWORKS: Record<string, StellarNetwork> = {
  PUBLIC: 'mainnet',
  TESTNET: 'testnet',
  FUTURENET: 'futurenet',
};

/** Maps a SEP-43 network name (PUBLIC, TESTNET, FUTURENET) to our network id. */
export function networkFromSep43Name(name: string): StellarNetwork | undefined {
  return SEP43_NETWORKS[name];
}

export const NETWORK_OPTIONS: { value: StellarNetwork; label: string }[] = [
  { value: 'testnet', label: 'Testnet' },
  { value: 'futurenet', label: 'Futurenet' },
  { value: 'mainnet', label: 'Mainnet' },
];

export function networkLabel(network: StellarNetwork): string {
  return NETWORK_OPTIONS.find((option) => option.value === network)?.label ?? network;
}
