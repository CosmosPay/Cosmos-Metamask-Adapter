import { Networks } from '@stellar/stellar-sdk/base';

export type StellarNetwork = 'mainnet' | 'testnet' | 'futurenet';

export type NetworkConfig = {
  id: StellarNetwork;
  /** CAIP-2 chain ID. */
  chainId: string;
  name: string;
  /** SEP-43 / Freighter style network name. */
  sep43Name: string;
  passphrase: string;
  horizonUrl: string;
  /** Soroban RPC. SDF does not host a public mainnet RPC, so dApps bring their own. */
  rpcUrl: string | null;
  explorerUrl: string;
  /** Faucet for test networks. */
  friendbotUrl: string | null;
};

export const NETWORKS: Record<StellarNetwork, NetworkConfig> = {
  mainnet: {
    id: 'mainnet',
    chainId: 'stellar:pubnet',
    name: 'Stellar Mainnet',
    sep43Name: 'PUBLIC',
    passphrase: Networks.PUBLIC,
    horizonUrl: 'https://horizon.stellar.org',
    rpcUrl: null,
    explorerUrl: 'https://stellar.expert/explorer/public',
    friendbotUrl: null,
  },
  testnet: {
    id: 'testnet',
    chainId: 'stellar:testnet',
    name: 'Stellar Testnet',
    sep43Name: 'TESTNET',
    passphrase: Networks.TESTNET,
    horizonUrl: 'https://horizon-testnet.stellar.org',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    explorerUrl: 'https://stellar.expert/explorer/testnet',
    friendbotUrl: 'https://friendbot.stellar.org',
  },
  futurenet: {
    id: 'futurenet',
    chainId: 'stellar:futurenet',
    name: 'Stellar Futurenet',
    sep43Name: 'FUTURENET',
    passphrase: Networks.FUTURENET,
    horizonUrl: 'https://horizon-futurenet.stellar.org',
    rpcUrl: 'https://rpc-futurenet.stellar.org',
    explorerUrl: 'https://stellar.expert/explorer/futurenet',
    friendbotUrl: 'https://friendbot-futurenet.stellar.org',
  },
};

export const NETWORK_IDS = Object.keys(NETWORKS) as StellarNetwork[];

export const DEFAULT_NETWORK: StellarNetwork = 'testnet';

/**
 * Finds the network for a passphrase.
 *
 * @param passphrase - Network passphrase.
 * @returns The network, or undefined if unsupported.
 */
export function networkFromPassphrase(passphrase: string): NetworkConfig | undefined {
  return Object.values(NETWORKS).find((network) => network.passphrase === passphrase);
}
