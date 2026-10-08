/**
 * Prerenders every page into static HTML after `vite build` (run by
 * `npm run build`): search engines, AI crawlers, link previews and readers
 * without JavaScript get each page's full text and head, and the browser
 * hydrates it. Also writes the sitemap, robots.txt and llms.txt.
 *
 * It builds src/entry-server.tsx for Node with the same Vite config, renders
 * each page into dist/index.html (the client build's shell) and writes it to
 * its own path: /en/privacy/ → dist/en/privacy/index.html.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';

type Server = {
  SITE_URL: string;
  SITE_URL_IS_FALLBACK: boolean;
  PAGES: { path: string; file: string }[];
  render(path: string): { html: string; head: string; lang: string };
  sitemapXml(): string;
  robotsTxt(): string;
  llmsTxt(): string;
  llmsFullTxt(): string;
};

const ROOT = resolve(import.meta.dirname, '..');
const DIST = resolve(ROOT, 'dist');
const SERVER_OUT = resolve(ROOT, 'node_modules/.cache/prerender');

// Settings Vite doesn't read (INDEXNOW_KEY) come from .env too; real env vars win.
const ENV_FILE = resolve(ROOT, '.env');
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

// React's production build, as in the browser bundle.
process.env.NODE_ENV = 'production';

await build({
  root: ROOT,
  logLevel: 'warn',
  build: { ssr: 'src/entry-server.tsx', outDir: SERVER_OUT, emptyOutDir: true, copyPublicDir: false },
});
const server = (await import(pathToFileURL(resolve(SERVER_OUT, 'entry-server.js')).href)) as Server;

if (server.SITE_URL_IS_FALLBACK) {
  console.warn(
    `⚠ No VITE_SITE_URL and no host address: canonical URLs, hreflang, the sitemap and social cards point at ${server.SITE_URL}.`,
  );
}

const shell = readFileSync(resolve(DIST, 'index.html'), 'utf8');

/** Replaces the one occurrence of `pattern` in the shell, failing loudly if index.html stops matching. */
function fill(html: string, pattern: RegExp | string, replacement: string): string {
  const matches = typeof pattern === 'string' ? html.split(pattern).length - 1 : (html.match(pattern) ?? []).length;
  if (matches !== 1) throw new Error(`index.html: expected one ${pattern}, found ${matches}`);
  return html.replace(pattern, () => replacement);
}

function write(file: string, content: string): void {
  const target = resolve(DIST, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}

for (const page of server.PAGES) {
  const { html, head, lang } = server.render(page.path);
  let document = fill(shell, /<html lang="[^"]*">/u, `<html lang="${lang}">`);
  // No font preloads: Safari doesn't match them to the CSS fonts and downloads each twice.
  document = fill(document, /<title>[^<]*<\/title>/u, head);
  document = fill(document, '<div id="root"></div>', `<div id="root" data-path="${page.path}">${html}</div>`);
  // React writes some attributes by their prop name (hrefLang, dateTime); HTML doesn't mind, but SEO tools and validators look for the lowercase names.
  write(
    page.file,
    document.replace(/ (hrefLang|dateTime)="/gu, (_match, name: string) => ` ${name.toLowerCase()}="`),
  );
}

write('sitemap.xml', server.sitemapXml());
write('robots.txt', server.robotsTxt());
write('llms.txt', server.llmsTxt());
write('llms-full.txt', server.llmsFullTxt());

/**
 * IndexNow (Bing, Yandex, Naver, Seznam…): the key file that proves the site
 * is ours. After deploying, scripts/indexnow.mts announces the pages.
 */
const indexNowKey = process.env.INDEXNOW_KEY?.trim();
if (indexNowKey) {
  if (!/^[a-zA-Z0-9-]{8,128}$/u.test(indexNowKey)) throw new Error('INDEXNOW_KEY: 8 to 128 letters, digits or dashes.');
  write(`${indexNowKey}.txt`, indexNowKey);
}

rmSync(SERVER_OUT, { recursive: true, force: true });
console.log(
  `prerendered ${server.PAGES.length} pages, sitemap.xml, robots.txt, llms.txt and llms-full.txt${indexNowKey ? ' and the IndexNow key' : ''}`,
);
