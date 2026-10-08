import { CosmosApiError, createCosmosClient, ledgerForEnvironment } from '@/services/cosmosApi';

const json = (status: number, body: unknown) =>
  ({ ok: status >= 200 && status < 300, status, json: async () => body }) as Response;

/** A fetch that answers per URL suffix and records every call. */
function fakeFetch(routes: Record<string, () => Response | Promise<Response>>) {
  const calls: { url: string; init?: RequestInit }[] = [];
  const fetchFn = (async (url: string, init?: RequestInit) => {
    calls.push({ url, ...(init ? { init } : {}) });
    const route = Object.entries(routes).find(([suffix]) => url.endsWith(suffix));
    if (!route) {
      throw new TypeError('Failed to fetch');
    }
    return route[1]();
  }) as typeof fetch;
  return { fetchFn, calls };
}

const noBuildKeys = () => '';

describe('ledgerForEnvironment', () => {
  it('maps the gateway environments to ledgers', () => {
    expect(ledgerForEnvironment('dev')).toBe('testnet');
    expect(ledgerForEnvironment('prod')).toBe('mainnet');
    expect(ledgerForEnvironment('staging')).toBeNull();
  });
});

describe('createCosmosClient', () => {
  it('uses the shared public key only on its own ledger, fetching it once', async () => {
    const { fetchFn, calls } = fakeFetch({ '/v1/public-key': () => json(200, { env: 'dev', apiKey: 'K' }) });
    const client = createCosmosClient({ fetch: fetchFn, configuredKey: noBuildKeys });

    expect(await client.apiKey('testnet')).toBe('K');
    expect(await client.apiKey('mainnet')).toBe('');
    expect(await client.apiKey('futurenet')).toBe('');
    expect(calls).toHaveLength(1);
  });

  it('prefers a build-time key', async () => {
    const { fetchFn, calls } = fakeFetch({});
    const client = createCosmosClient({ fetch: fetchFn, configuredKey: (network) => `${network}-key` });
    expect(await client.apiKey('mainnet')).toBe('mainnet-key');
    expect(calls).toHaveLength(0);
  });

  it('retries the public key after a failure', async () => {
    let up = false;
    const { fetchFn } = fakeFetch({
      '/v1/public-key': () => (up ? json(200, { env: 'dev', apiKey: 'K' }) : json(503, {})),
    });
    const client = createCosmosClient({ fetch: fetchFn, configuredKey: noBuildKeys });
    expect(await client.apiKey('testnet')).toBe('');
    up = true;
    expect(await client.apiKey('testnet')).toBe('K');
  });

  it('sends the key, JSON bodies and parses results', async () => {
    const { fetchFn, calls } = fakeFetch({ '/v1/swaps/quote': () => json(200, { ok: 1 }) });
    const client = createCosmosClient({ fetch: fetchFn, configuredKey: () => 'K', baseUrl: 'https://api' });

    expect(await client.request('testnet', '/v1/swaps/quote', { amount: '1' })).toEqual({ ok: 1 });
    expect(calls[0]).toEqual({
      url: 'https://api/v1/swaps/quote',
      init: {
        method: 'POST',
        headers: { apikey: 'K', 'Content-Type': 'application/json' },
        body: '{"amount":"1"}',
      },
    });
  });

  it.each([
    ['no key', () => createCosmosClient({ fetch: fakeFetch({}).fetchFn, configuredKey: noBuildKeys }), 0, true],
    [
      'unreachable (CORS/offline)',
      () => createCosmosClient({ fetch: fakeFetch({}).fetchFn, configuredKey: () => 'K' }),
      0,
      true,
    ],
    [
      'a 401',
      () => createCosmosClient({ fetch: fakeFetch({ '/x': () => json(401, {}) }).fetchFn, configuredKey: () => 'K' }),
      401,
      true,
    ],
    [
      'a business error',
      () =>
        createCosmosClient({
          fetch: fakeFetch({ '/x': () => json(422, { code: 'no_path', message: ['No', 'path'] }) }).fetchFn,
          configuredKey: () => 'K',
        }),
      422,
      false,
    ],
  ])('classifies %s', async (_label, make, status, unavailable) => {
    const error = await make()
      .request('testnet', '/x')
      .catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(CosmosApiError);
    expect(error).toMatchObject({ status, unavailable });
  });

  it('joins validation messages from the server', async () => {
    const client = createCosmosClient({
      fetch: fakeFetch({ '/x': () => json(400, { message: ['amount must be positive', 'bad issuer'] }) }).fetchFn,
      configuredKey: () => 'K',
    });
    await expect(client.request('testnet', '/x')).rejects.toThrow('amount must be positive bad issuer');
  });
});
