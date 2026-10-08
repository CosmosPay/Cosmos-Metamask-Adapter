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

/**
 * Sets theme and language before first paint (no flash): the saved choice,
 * else the OS scheme and the browser's languages. Injected at the top of
 * index.html's <head>, which stays a bare shell for React. See
 * src/lib/theme.ts and src/i18n/index.ts (same storage keys and languages).
 */
const BOOT_SCRIPT = `(function () {
  var root = document.documentElement;
  var supported = ['en', 'es', 'pt', 'fr', 'de'];
  var theme = null;
  var lang = null;
  try {
    theme = localStorage.getItem('theme');
    lang = localStorage.getItem('lang');
  } catch (e) {}
  if (theme !== 'light' && theme !== 'dark') {
    theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (supported.indexOf(lang) < 0) {
    lang = 'es';
    var preferred = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < preferred.length; i++) {
      var code = String(preferred[i]).slice(0, 2).toLowerCase();
      if (supported.indexOf(code) >= 0) {
        lang = code;
        break;
      }
    }
  }
  root.dataset.theme = theme;
  root.lang = lang;
})();`;

function bootScript(): Plugin {
  return {
    name: 'boot-script',
    transformIndexHtml: () => [{ tag: 'script', children: BOOT_SCRIPT, injectTo: 'head-prepend' }],
  };
}

export default defineConfig({
  plugins: [packageAlias(), bootScript(), react()],
  resolve: {
    alias: {
      // Use the adapter sources directly so `npm start` needs no prebuild.
      '@cosmospay/stellar-metamask-adapter': resolve(ADAPTER_SRC, 'index.ts'),
      // The hero previews the snap's home with the snap's own art and strings.
      '@snap': SNAP_ROOT,
    },
  },
});
