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
    // Cosmos Pay shared *public* key for GET /v1/assets (not a secret). Without
    // it the snap uses its bundled copy of the asset registry.
    COSMOS_PUBLIC_API_KEY: process.env.COSMOS_PUBLIC_API_KEY ?? '',
  },
};

export default config;
