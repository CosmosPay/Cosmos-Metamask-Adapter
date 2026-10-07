export type StellarNetwork = 'mainnet' | 'testnet' | 'futurenet';

export type EIP1193Provider = {
  request(args: { method: string; params?: unknown }): Promise<unknown>;
};

/** SEP-43 error. https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0043.md */
export type Sep43Error = {
  /** -1 wallet error, -2 external service, -3 invalid request, -4 user rejected. */
  code: -1 | -2 | -3 | -4;
  message: string;
  ext?: string[];
};

export type WithError<Result> = Result & { error?: Sep43Error };

export type SignOptions = {
  networkPassphrase?: string;
  address?: string;
};

export type NetworkInfo = {
  network: StellarNetwork;
  name: string;
  /** SEP-43 / Freighter network name: PUBLIC, TESTNET, FUTURENET. */
  sep43Name: string;
  chainId: string;
  networkPassphrase: string;
  horizonUrl: string;
  rpcUrl: string | null;
};

export type EvmLink = {
  evmAddress: string;
  stellarAddress: string;
  message: string;
  evmSignature: string;
  stellarSignature: string;
  linkedAt: number;
};

export type Backend = 'official' | 'snap';

export type ChangeEvent = {
  address: string;
  network: string;
  networkPassphrase: string;
  backend: Backend;
};

export const NETWORK_PASSPHRASES: Record<StellarNetwork, string> = {
  mainnet: 'Public Global Stellar Network ; September 2015',
  testnet: 'Test SDF Network ; September 2015',
  futurenet: 'Test SDF Future Network ; October 2022',
};

/**
 * Maps a passphrase to our network id.
 *
 * @param passphrase - Network passphrase.
 * @returns The network id, if supported.
 */
export function networkFromPassphrase(passphrase: string): StellarNetwork | undefined {
  return (Object.keys(NETWORK_PASSPHRASES) as StellarNetwork[]).find(
    (network) => NETWORK_PASSPHRASES[network] === passphrase,
  );
}
