import type { StellarNetwork } from './networks';

/** Cosmos Pay community server, behind the api.cosmospay.lat gateway. */
export const COSMOS_API = 'https://api.cosmospay.lat/cosmos-api';

/**
 * Optional build-time key for a network (`COSMOS_API_KEY_TESTNET=…`). When a
 * variable isn't set the bundler leaves `process.env` untouched, and `process`
 * doesn't exist inside a snap — hence the guard.
 *
 * @param networkId - Snap network id.
 * @returns The key, or an empty string.
 */
function buildTimeKey(networkId: StellarNetwork): string {
  try {
    if (networkId === 'testnet') {
      return process.env.COSMOS_API_KEY_TESTNET ?? '';
    }
    if (networkId === 'mainnet') {
      return process.env.COSMOS_API_KEY_MAINNET ?? '';
    }
  } catch {
    // Not substituted at build time.
  }
  return '';
}

let publicKey: Promise<{ env: string; apiKey: string } | null> | undefined;

/**
 * The Cosmos Pay key for a network. The gateway scopes every call to the key's
 * environment (`dev` → testnet, `prod` → public), so a key is only used on its
 * own ledger — the wrong one would quote on the other chain. Falls back to the
 * shared public key from `GET /v1/public-key` (fetched once per session).
 * Futurenet isn't served by the community server.
 *
 * @param networkId - Snap network id.
 * @returns The key, or an empty string when this network has none.
 */
export async function cosmosApiKey(networkId: StellarNetwork): Promise<string> {
  const configured = buildTimeKey(networkId);
  if (configured || networkId === 'futurenet') {
    return configured;
  }
  publicKey ??= fetch(`${COSMOS_API}/v1/public-key`)
    .then(async (response) => (response.ok ? ((await response.json()) as { env: string; apiKey: string }) : null))
    .catch(() => null);
  const shared = await publicKey;
  if (!shared) {
    publicKey = undefined; // retry on the next call
    return '';
  }
  const ledger = shared.env === 'prod' ? 'mainnet' : shared.env === 'dev' ? 'testnet' : null;
  return ledger === networkId ? shared.apiKey : '';
}

/**
 * Whether the community server serves swaps on this network at all.
 *
 * @param networkId - Snap network id.
 * @returns False on futurenet.
 */
export const cosmosServesNetwork = (networkId: StellarNetwork) => networkId !== 'futurenet';

export class CosmosApiError extends Error {
  readonly status: number;

  readonly code: string | undefined;

  constructor(status: number, code: string | undefined, message: string) {
    super(message);
    this.name = 'CosmosApiError';
    this.status = status;
    this.code = code;
  }
}

/**
 * Calls the community server with the public key.
 *
 * @param networkId - Network the call is scoped to (picks the key).
 * @param path - Path under /cosmos-api (e.g. `/v1/swaps/quote`).
 * @param body - JSON body (POST) or undefined (GET).
 * @returns The parsed response.
 */
export async function cosmosRequest<Result>(networkId: StellarNetwork, path: string, body?: unknown): Promise<Result> {
  const key = await cosmosApiKey(networkId);
  if (!key) {
    throw new CosmosApiError(0, 'not_configured', `Cosmos Pay API key not configured for ${networkId}`);
  }
  let response: Response;
  try {
    response = await fetch(`${COSMOS_API}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      headers: {
        apikey: key,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    // CORS rejection or offline: fetch gives no status.
    throw new CosmosApiError(0, 'unreachable', 'Cosmos Pay API unreachable');
  }
  const payload = (await response.json().catch(() => ({}))) as {
    code?: string;
    message?: string | string[];
  };
  if (!response.ok) {
    const message = Array.isArray(payload.message) ? payload.message.join(' ') : payload.message;
    throw new CosmosApiError(response.status, payload.code, message ?? `HTTP ${response.status}`);
  }
  return payload as Result;
}
