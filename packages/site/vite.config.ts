import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig, type HtmlTagDescriptor, loadEnv, type Plugin } from 'vite';
import { DEFAULT_LANGUAGE, LANGUAGES } from './src/i18n/languages.ts';

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
 * Runs before first paint. Sets the theme (no flash): the saved choice, else
 * the OS scheme; see src/lib/theme.ts. The language is the URL's, but a
 * language the visitor once picked takes pages in the default language to
 * their translation; see src/i18n/index.ts. Only an explicit choice does, so
 * crawlers and first visits stay on the URL they asked for. Same storage keys
 * as those modules.
 */
const BOOT_SCRIPT = `(function () {
  var root = document.documentElement;
  var languages = ${JSON.stringify(LANGUAGES.filter((code) => code !== DEFAULT_LANGUAGE))};
  var theme = null;
  var lang = null;
  try {
    theme = localStorage.getItem('theme');
    lang = localStorage.getItem('lang');
  } catch (e) {}
  var path = location.pathname;
  var prefixed = languages.indexOf(path.split('/')[1]) >= 0;
  if (!prefixed && languages.indexOf(lang) >= 0) {
    location.replace('/' + lang + path + location.search + location.hash);
  }
  if (theme !== 'light' && theme !== 'dark') {
    theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  root.dataset.theme = theme;
})();`;

/** Search console ownership tags, emitted only when their env vars are set at build time. */
const VERIFICATIONS: Record<string, string> = {
  VITE_GOOGLE_SITE_VERIFICATION: 'google-site-verification',
  VITE_BING_SITE_VERIFICATION: 'msvalidate.01',
  VITE_YANDEX_VERIFICATION: 'yandex-verification',
  VITE_BAIDU_SITE_VERIFICATION: 'baidu-site-verification',
  VITE_NAVER_SITE_VERIFICATION: 'naver-site-verification',
  VITE_SEZNAM_VERIFICATION: 'seznam-wmt',
};

/**
 * What every page's head shares, around index.html's bare shell: the boot
 * script, icons, the manifest and browser colors. Each page's own tags
 * (title, description, canonical, social cards, schema.org) come from
 * src/seo/head.ts, prerendered and kept in sync by the app.
 */
function siteHead(env: Record<string, string>): Plugin {
  // Appended to the head, so <meta charset> stays first.
  const meta = (name: string, content: string, media?: string): HtmlTagDescriptor => ({
    tag: 'meta',
    attrs: media ? { name, content, media } : { name, content },
    injectTo: 'head',
  });
  const link = (attrs: Record<string, string>): HtmlTagDescriptor => ({ tag: 'link', attrs, injectTo: 'head' });
  return {
    name: 'site-head',
    transformIndexHtml: () => [
      // Still before anything paints.
      { tag: 'script', children: BOOT_SCRIPT, injectTo: 'head' },
      meta('color-scheme', 'light dark'),
      meta('theme-color', '#ffffff', '(prefers-color-scheme: light)'),
      meta('theme-color', '#0c0c10', '(prefers-color-scheme: dark)'),
      meta('application-name', 'Stellar Snap'),
      meta('apple-mobile-web-app-title', 'Stellar Snap'),
      // Stellar addresses and amounts aren't phone numbers.
      meta('format-detection', 'telephone=no'),
      link({ rel: 'icon', href: '/favicon.ico', sizes: '32x32' }),
      link({ rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }),
      link({ rel: 'manifest', href: '/manifest.webmanifest' }),
      ...Object.entries(VERIFICATIONS)
        .filter(([variable]) => env[variable])
        .map(([variable, name]) => meta(name, env[variable] ?? '')),
    ],
  };
}

/**
 * The site's public origin for canonical URLs, the sitemap and social cards
 * (`SITE_URL` in src/config.ts): `VITE_SITE_URL` when set, else the
 * production address the host announces at build time, so a deploy is right
 * without configuration. Undefined leaves config.ts's fallback, which the
 * prerender warns about.
 */
function siteUrl(env: Record<string, string>): string | undefined {
  const fromHost = (variable: string) => {
    const value = process.env[variable];
    return value ? (value.startsWith('http') ? value : `https://${value}`) : undefined;
  };
  return (
    env.VITE_SITE_URL ||
    fromHost('VERCEL_PROJECT_PRODUCTION_URL') ||
    // Netlify: the site's main address (DEPLOY_PRIME_URL would be a preview's).
    fromHost('URL') ||
    fromHost('CF_PAGES_URL') ||
    fromHost('RENDER_EXTERNAL_URL')
  );
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, here, 'VITE_');
  const site = siteUrl(env);
  return {
    plugins: [packageAlias(), siteHead(env), react()],
    define: site ? { 'import.meta.env.VITE_SITE_URL': JSON.stringify(site) } : {},
    resolve: {
      alias: {
        // Use the adapter sources directly so `npm start` needs no prebuild.
        '@cosmosapp/stellar-metamask-adapter': resolve(ADAPTER_SRC, 'index.ts'),
        // The hero previews the snap's home with the snap's own art and strings.
        '@snap': SNAP_ROOT,
      },
    },
  };
});
