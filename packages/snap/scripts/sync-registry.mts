/**
 * Refreshes the bundled copy of the Cosmos Pay asset registry from the live API
 * (`GET /v1/assets`), using the shared public key. Run before a release:
 *
 *   npm run sync:registry -w packages/snap
 *
 * The snap prefers the live registry at runtime; this copy only covers an
 * unreachable gateway.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const API = 'https://api.cosmospay.lat/cosmos-api';
const OUT = resolve(import.meta.dirname, '../src/services/assets/bundledRegistry.json');

type Asset = {
  code: string;
  issuer: string | null;
  name: string;
  issuerName: string;
  issuerDomain: string;
  verified: boolean;
};

async function json<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`${url} → HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

const { apiKey } = await json<{ apiKey: string }>(`${API}/v1/public-key`);
const pick = ({ code, issuer, name, issuerName, issuerDomain, verified }: Asset) => ({
  code,
  issuer,
  name,
  issuerName,
  issuerDomain,
  verified,
});

const [pub, test] = await Promise.all(
  ['public', 'testnet'].map((network) =>
    json<{ version: number; data: Asset[] }>(`${API}/v1/assets?network=${network}`, { apikey: apiKey }),
  ),
);
if (!pub || !test || pub.version !== test.version) {
  throw new Error('Registry versions differ between networks.');
}

const registry = {
  version: pub.version,
  mainnet: pub.data.map(pick),
  testnet: test.data.map(pick),
};
writeFileSync(OUT, `${JSON.stringify(registry, null, 2)}\n`);
console.log(`registry v${registry.version}: ${registry.mainnet.length} mainnet, ${registry.testnet.length} testnet`);
