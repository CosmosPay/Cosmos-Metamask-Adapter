/**
 * Tells the IndexNow search engines (Bing, Yandex, Naver, Seznam…) that every
 * page in the sitemap is new or changed, so they crawl it now rather than on
 * their own schedule. Run it after deploying a build made with INDEXNOW_KEY:
 *
 *   npm run indexnow -w packages/site
 *
 * It reads dist/sitemap.xml, so it announces exactly the pages that build has.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const ENV_FILE = resolve(ROOT, '.env');
if (existsSync(ENV_FILE)) process.loadEnvFile(ENV_FILE);

const key = process.env.INDEXNOW_KEY?.trim();
if (!key) throw new Error('Set INDEXNOW_KEY (packages/site/.env) to the key the build published.');

const sitemap = readFileSync(resolve(ROOT, 'dist/sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => match[1] ?? '');
if (urls.length === 0) throw new Error('dist/sitemap.xml lists no pages: run the build first.');
const { host, origin } = new URL(urls[0] ?? '');
const keyLocation = `${origin}/${key}.txt`;

// The engines check this file before trusting the list; catch a missing deploy here.
const published = await fetch(keyLocation).then((response) => (response.ok ? response.text() : ''));
if (published.trim() !== key) throw new Error(`${keyLocation} doesn't serve the key yet: deploy the build first.`);

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation, urlList: urls }),
});
console.log(`IndexNow answered ${response.status} ${response.statusText} for ${urls.length} pages of ${host}.`);
if (!response.ok) process.exitCode = 1;
