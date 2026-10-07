import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      // Use the adapter sources directly so `npm start` needs no prebuild.
      '@cosmospay/stellar-metamask-adapter': fileURLToPath(
        new URL('../adapter/src/index.ts', import.meta.url),
      ),
    },
  },
});
