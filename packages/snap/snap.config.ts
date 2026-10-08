import type { SnapConfig } from '@metamask/snaps-cli';
import { resolve } from 'path';

const config: SnapConfig = {
  input: resolve(__dirname, 'src/index.ts'),
  server: {
    port: 8080,
  },
  polyfills: {
    buffer: true,
  },
  environment: {
    // Optional Cosmos Pay keys, one per ledger (the gateway scopes a key to its
    // environment: dev → testnet, prod → public). Without them the snap uses the
    // shared public key from GET /v1/public-key at runtime.
    COSMOS_API_KEY_TESTNET: process.env.COSMOS_API_KEY_TESTNET ?? '',
    COSMOS_API_KEY_MAINNET: process.env.COSMOS_API_KEY_MAINNET ?? '',
  },
  // Same aliases as tsconfig.json `paths`.
  customizeWebpackConfig: (webpackConfig) => ({
    ...webpackConfig,
    resolve: {
      ...webpackConfig.resolve,
      alias: {
        ...(webpackConfig.resolve?.alias as Record<string, string> | undefined),
        '@': resolve(__dirname, 'src'),
        '@locales': resolve(__dirname, 'locales'),
      },
    },
  }),
};

export default config;
