import { Keypair, Networks, TransactionBuilder } from '@stellar/stellar-sdk/base';

import { NETWORKS } from '@/config/networks';
import { ValidationError } from '@/domain/errors';
import type { CosmosClient } from '@/services/cosmosApi';
import { CosmosApiError } from '@/services/cosmosApi';
import { cosmosSwapProvider } from '@/services/swap';
import { FEE_WALLET, quote, swapTransaction, USDC, USDC_ISSUER, XLM } from '@test/unit/fixtures';

type Call = { network: string; path: string; body: unknown };

/** A Cosmos client answering from a table of path → handler, recording calls. */
function fakeClient(routes: Record<string, (body: unknown) => unknown>) {
  const calls: Call[] = [];
  const client: CosmosClient = {
    apiKey: async () => 'key',
    async request<Result>(network: string, path: string, body?: unknown) {
      calls.push({ network, path, body });
      const route = Object.entries(routes).find(([prefix]) => path.startsWith(prefix));
      if (!route) {
        throw new Error(`unexpected ${path}`);
      }
      return route[1](body) as Result;
    },
  };
  return { client, calls };
}

const API_QUOTE = {
  fee: { amount: '0.15', bps: 150, wallet: FEE_WALLET },
  swap: { amount: '9.85' },
  source: { amount: '10' },
  destination: { estimated: '9.28', minimum: '9.23', slippageBps: 50 },
  path: [{ code: 'native', issuer: null }],
};

const testnet = NETWORKS.testnet;

describe('cosmosSwapProvider', () => {
  it('does not serve futurenet', () => {
    expect(cosmosSwapProvider(fakeClient({}).client).supports(NETWORKS.futurenet)).toBe(false);
    expect(cosmosSwapProvider(fakeClient({}).client).supports(testnet)).toBe(true);
  });

  it('maps the server quote, sending native as `native`', async () => {
    const { client, calls } = fakeClient({ '/v1/swaps/quote': () => API_QUOTE });
    const result = await cosmosSwapProvider(client).quote(testnet, { from: XLM, to: USDC, amount: '10' });

    expect(calls).toEqual([
      {
        network: 'testnet',
        path: '/v1/swaps/quote',
        body: {
          sourceAssetCode: 'native',
          destAssetCode: 'USDC',
          destAssetIssuer: USDC_ISSUER,
          amount: '10',
          slippageBps: 50,
        },
      },
    ]);
    expect(result).toEqual({ ...quote(), path: [XLM] });
  });

  it('turns gateway failures into "unavailable" and business errors into field errors', async () => {
    const unreachable = fakeClient({
      '/v1/swaps/quote': () => {
        throw new CosmosApiError(0, 'unreachable', 'offline');
      },
    });
    await expect(
      cosmosSwapProvider(unreachable.client).quote(testnet, { from: XLM, to: USDC, amount: '1' }),
    ).rejects.not.toBeInstanceOf(ValidationError);

    const noPath = fakeClient({
      '/v1/swaps/quote': () => {
        throw new CosmosApiError(422, 'no_path', 'No path found');
      },
    });
    await expect(
      cosmosSwapProvider(noPath.client).quote(testnet, { from: XLM, to: USDC, amount: '1' }),
    ).rejects.toMatchObject({ fields: { amount: 'No path found' } });
  });

  it('verifies, signs and submits the server-built transaction', async () => {
    const keypair = Keypair.random();
    const tx = swapTransaction(keypair.publicKey());
    let submitted = '';
    const { client, calls } = fakeClient({
      '/v1/swaps/abc/submit': (body) => {
        submitted = (body as { signedXdr: string }).signedXdr;
        return { status: 'SUCCESS', txHash: 'ff'.repeat(32) };
      },
      '/v1/swaps': () => ({ id: 'abc', xdr: tx.toXDR() }),
    });

    const result = await cosmosSwapProvider(client).execute(testnet, keypair, quote());

    expect(calls.map((call) => call.path)).toEqual(['/v1/swaps', '/v1/swaps/abc/submit']);
    expect(calls[0]?.body).toMatchObject({ source: keypair.publicKey(), amount: '10', slippageBps: 50 });
    const signed = TransactionBuilder.fromXDR(submitted, Networks.TESTNET);
    expect(keypair.verify(signed.hash(), signed.signatures[0]!.signature)).toBe(true);
    expect(result.explorerUrl).toBe(`${testnet.explorerUrl}/tx/${'ff'.repeat(32)}`);
  });

  it('never signs or submits a transaction that differs from the quote', async () => {
    const keypair = Keypair.random();
    const rogue = swapTransaction(keypair.publicKey(), { feeAmount: '5' });
    const { client, calls } = fakeClient({ '/v1/swaps': () => ({ id: 'abc', xdr: rogue.toXDR() }) });

    await expect(cosmosSwapProvider(client).execute(testnet, keypair, quote())).rejects.toThrow('fee amount');
    expect(calls.map((call) => call.path)).toEqual(['/v1/swaps']);
  });

  it('reports a swap that failed on the network', async () => {
    const keypair = Keypair.random();
    const tx = swapTransaction(keypair.publicKey());
    const { client } = fakeClient({
      '/v1/swaps/abc/submit': () => ({ status: 'FAILED' }),
      '/v1/swaps': () => ({ id: 'abc', xdr: tx.toXDR() }),
    });
    await expect(cosmosSwapProvider(client).execute(testnet, keypair, quote())).rejects.toThrow();
  });
});
