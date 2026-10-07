import type { SnapConfig } from '@metamask/snaps-cli';
import { resolve } from 'path';

const config: SnapConfig = {
  input: resolve(__dirname, 'src/index.tsx'),
  server: {
    port: 8080,
  },
  polyfills: {
    buffer: true,
  },
  environment: {
    // Cosmos Pay keys, one per ledger (the gateway scopes a key to its
    // environment: dev → testnet, prod → public). They power swaps (with the
    // Cosmos fee) and the live asset registry. Without a network's key, swaps
    // are off on it and the bundled registry is used.
    COSMOS_API_KEY_TESTNET: process.env.COSMOS_API_KEY_TESTNET ?? '',
    COSMOS_API_KEY_MAINNET: process.env.COSMOS_API_KEY_MAINNET ?? '',
  },
};

export default config;
