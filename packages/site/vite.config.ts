import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const here = dirname(fileURLToPath(import.meta.url));
const SITE_SRC = resolve(here, 'src');
const ADAPTER_SRC = resolve(here, '../adapter/src');

/**
 * `@/…` means "this package's src": the site's own files resolve to
 * `site/src`, the adapter sources (used directly, see below) to `adapter/src`.
 */
function packageAlias(): Plugin {
  return {
    name: 'package-alias',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!source.startsWith('@/')) {
        return null;
      }
      const root = importer && resolve(importer).startsWith(ADAPTER_SRC) ? ADAPTER_SRC : SITE_SRC;
      return this.resolve(resolve(root, source.slice(2)), importer, { ...options, skipSelf: true });
    },
  };
}

export default defineConfig({
  plugins: [packageAlias(), react()],
  resolve: {
    alias: {
      // Use the adapter sources directly so `npm start` needs no prebuild.
      '@cosmospay/stellar-metamask-adapter': resolve(ADAPTER_SRC, 'index.ts'),
    },
  },
});
