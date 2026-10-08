import { TransactionBuilder } from '@stellar/stellar-sdk/base';
import type { Transaction } from '@stellar/stellar-sdk/base';

import { ValidationError } from '@/domain/errors';
import type { SwapAsset, SwapProvider, SwapQuote, SwapRequest } from '@/domain/swap';
import { assertSwapTransaction, DEFAULT_SLIPPAGE_BPS, isNativeAsset } from '@/domain/swap';
import { t } from '@/i18n';
import type { CosmosClient } from '@/services/cosmosApi';
import { CosmosApiError, cosmosClient, cosmosServesNetwork } from '@/services/cosmosApi';

type ApiQuote = {
  fee: { amount: string; bps: number; wallet: string | null };
  swap: { amount: string };
  source: { amount: string };
  destination: { estimated: string; minimum: string; slippageBps: number };
  path: { code: string; issuer: string | null }[];
};

type ApiSwap = { id: string; xdr: string };

const apiCode = (asset: SwapAsset) => (isNativeAsset(asset) ? 'native' : asset.code);

const fromApi = (code: string, issuer: string | null): SwapAsset =>
  code === 'native' || !issuer ? { code: 'XLM', issuer: null } : { code, issuer };

const assetParams = (request: Pick<SwapRequest, 'from' | 'to'>) => ({
  sourceAssetCode: apiCode(request.from),
  ...(request.from.issuer ? { sourceAssetIssuer: request.from.issuer } : {}),
  destAssetCode: apiCode(request.to),
  ...(request.to.issuer ? { destAssetIssuer: request.to.issuer } : {}),
});

/**
 * Gateway failures become "swaps unavailable"; 4xx business errors (no path,
 * bad amount…) come back with the server's own text on the amount field.
 *
 * @param error - What the client threw.
 * @returns The error to surface.
 */
function toSwapError(error: unknown): Error {
  if (error instanceof CosmosApiError) {
    return error.unavailable ? new Error(t('swap.error.unavailable')) : new ValidationError({ amount: error.message });
  }
  return error as Error;
}

export const COSMOS_PROVIDER_ID = 'cosmos';

/**
 * Swaps through the Cosmos Pay community server (same engine and fee as the
 * Cosmos wallet): quote → build → verify the XDR → sign → submit. There is
 * deliberately no direct-DEX fallback: bypassing the server would bypass the fee.
 *
 * @param client - Cosmos Pay client (injected for tests).
 * @returns The provider.
 */
export function cosmosSwapProvider(client: CosmosClient = cosmosClient): SwapProvider {
  return {
    id: COSMOS_PROVIDER_ID,
    name: 'Cosmos Pay',

    supports: (network) => cosmosServesNetwork(network.id),

    async quote(network, request): Promise<SwapQuote> {
      let quote: ApiQuote;
      try {
        quote = await client.request<ApiQuote>(network.id, '/v1/swaps/quote', {
          ...assetParams(request),
          amount: request.amount,
          slippageBps: DEFAULT_SLIPPAGE_BPS,
        });
      } catch (error) {
        throw toSwapError(error);
      }
      return {
        provider: COSMOS_PROVIDER_ID,
        from: request.from,
        to: request.to,
        sendAmount: quote.source.amount,
        fee: quote.fee,
        swapAmount: quote.swap.amount,
        estimated: quote.destination.estimated,
        minimum: quote.destination.minimum,
        slippageBps: quote.destination.slippageBps,
        path: quote.path.map((hop) => fromApi(hop.code, hop.issuer)),
      };
    },

    async execute(network, keypair, quote) {
      const address = keypair.publicKey();
      try {
        const swap = await client.request<ApiSwap>(network.id, '/v1/swaps', {
          ...assetParams(quote),
          amount: quote.sendAmount,
          slippageBps: quote.slippageBps,
          source: address,
        });
        const tx = TransactionBuilder.fromXDR(swap.xdr, network.passphrase) as Transaction;
        // The key never touches a transaction that isn't the reviewed swap.
        assertSwapTransaction(tx, quote, address);
        tx.sign(keypair);
        const result = await client.request<{ status: string; txHash?: string }>(
          network.id,
          `/v1/swaps/${encodeURIComponent(swap.id)}/submit`,
          { signedXdr: tx.toXDR() },
        );
        if (result.status === 'FAILED') {
          throw new Error(t('swap.error.failed'));
        }
        const hash = result.txHash ?? Buffer.from(tx.hash()).toString('hex');
        return { hash, explorerUrl: `${network.explorerUrl}/tx/${hash}` };
      } catch (error) {
        throw toSwapError(error);
      }
    },
  };
}
