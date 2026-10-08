import type { SnapConfig } from '@metamask/snaps-cli';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Build settings from packages/snap/.env (see .env.example), if there's one; real env vars win.
const envFile = resolve(__dirname, '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

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
