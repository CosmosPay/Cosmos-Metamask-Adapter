import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const here = dirname(fileURLToPath(import.meta.url));
const SITE_SRC = resolve(here, 'src');
const ADAPTER_SRC = resolve(here, '../adapter/src');
const SNAP_ROOT = resolve(here, '../snap');
const SNAP_SRC = resolve(SNAP_ROOT, 'src');

/**
 * `@/…` means "this package's src": the site's own files resolve to
 * `site/src`, the adapter sources (used directly, see below) to `adapter/src`
 * and the snap's UI art (see `@snap`) to `snap/src`.
 */
function packageAlias(): Plugin {
  return {
    name: 'package-alias',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!source.startsWith('@/')) {
        return null;
      }
      const owner = importer && [ADAPTER_SRC, SNAP_SRC].find((src) => resolve(importer).startsWith(src));
      const root = owner ?? SITE_SRC;
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
      // The hero previews the snap's home with the snap's own art and strings.
      '@snap': SNAP_ROOT,
    },
  },
});
