import type { StellarNetwork } from '@/config/networks';

/** Cosmos Pay community server, behind the api.cosmospay.lat gateway. */
export const COSMOS_API = 'https://api.cosmospay.lat/cosmos-api';

export class CosmosApiError extends Error {
  readonly status: number;

  readonly code: string | undefined;

  constructor(status: number, code: string | undefined, message: string) {
    super(message);
    this.name = 'CosmosApiError';
    this.status = status;
    this.code = code;
  }

  /** The gateway itself failed (unreachable, CORS, auth, 5xx), not the request. */
  get unavailable(): boolean {
    return this.status === 0 || this.status === 401 || this.status === 403 || this.status >= 500;
  }
}

export type CosmosClient = {
  /** The key for a network's ledger, or '' when there is none. */
  apiKey(networkId: StellarNetwork): Promise<string>;
  /** Calls the server with that key: GET without body, POST with one. */
  request<Result>(networkId: StellarNetwork, path: string, body?: unknown): Promise<Result>;
};

type SharedKey = { env: string; apiKey: string };

/**
 * The ledger an API key is scoped to: the gateway maps the key's environment
 * `dev` → testnet and `prod` → public.
 *
 * @param env - The key's environment.
 * @returns The snap network, or null for anything else.
 */
export const ledgerForEnvironment = (env: string): StellarNetwork | null =>
  env === 'prod' ? 'mainnet' : env === 'dev' ? 'testnet' : null;

/** Whether the community server runs on a network at all (not futurenet). */
export const cosmosServesNetwork = (networkId: StellarNetwork) => networkId !== 'futurenet';

/**
 * Build-time keys (`COSMOS_API_KEY_TESTNET=… mm-snap build`). Unset variables
 * aren't substituted and `process` doesn't exist inside a snap — hence the guard.
 *
 * @param networkId - Snap network id.
 * @returns The key, or ''.
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

/**
 * Creates a Cosmos Pay client.
 *
 * A key is only ever used on its own ledger — the wrong one would quote on the
 * other chain. Without a build-time key, the shared public key from
 * `GET /v1/public-key` is fetched once and reused.
 *
 * @param options - Dependencies.
 * @param options.fetch - HTTP client.
 * @param options.baseUrl - Server base URL.
 * @param options.configuredKey - Build-time key lookup.
 * @returns The client.
 */
export function createCosmosClient({
  fetch: fetchFn = fetch,
  baseUrl = COSMOS_API,
  configuredKey = buildTimeKey,
}: {
  fetch?: typeof fetch;
  baseUrl?: string;
  configuredKey?: (networkId: StellarNetwork) => string;
} = {}): CosmosClient {
  let shared: Promise<SharedKey | null> | undefined;

  const apiKey = async (networkId: StellarNetwork) => {
    const configured = configuredKey(networkId);
    if (configured || !cosmosServesNetwork(networkId)) {
      return configured;
    }
    shared ??= fetchFn(`${baseUrl}/v1/public-key`)
      .then(async (response) => (response.ok ? ((await response.json()) as SharedKey) : null))
      .catch(() => null);
    const key = await shared;
    if (!key) {
      shared = undefined; // retry on the next call
      return '';
    }
    return ledgerForEnvironment(key.env) === networkId ? key.apiKey : '';
  };

  const request = async <Result>(networkId: StellarNetwork, path: string, body?: unknown): Promise<Result> => {
    const key = await apiKey(networkId);
    if (!key) {
      throw new CosmosApiError(0, 'not_configured', `Cosmos Pay API key not configured for ${networkId}`);
    }
    let response: Response;
    try {
      response = await fetchFn(`${baseUrl}${path}`, {
        method: body === undefined ? 'GET' : 'POST',
        headers: { apikey: key, ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
    } catch {
      // CORS rejection or offline: fetch gives no status.
      throw new CosmosApiError(0, 'unreachable', 'Cosmos Pay API unreachable');
    }
    const payload = (await response.json().catch(() => ({}))) as { code?: string; message?: string | string[] };
    if (!response.ok) {
      const message = Array.isArray(payload.message) ? payload.message.join(' ') : payload.message;
      throw new CosmosApiError(response.status, payload.code, message ?? `HTTP ${response.status}`);
    }
    return payload as Result;
  };

  return { apiKey, request };
}

/** The client the snap uses. */
export const cosmosClient = createCosmosClient();

export const cosmosApiKey = (networkId: StellarNetwork) => cosmosClient.apiKey(networkId);
