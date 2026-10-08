import type { Keypair } from '@stellar/stellar-sdk/base';

import type { NetworkConfig } from '@/config/networks';
import type { SwapProvider, SwapQuote, SwapRequest, SwapResult } from '@/domain/swap';
import { assertAccountCanSwap, assertSwapRequest } from '@/domain/swap';
import { t } from '@/i18n';
import { fetchAccount } from '@/services/horizon';
import { cosmosSwapProvider } from '@/services/swap/cosmosSwapProvider';

export { COSMOS_PROVIDER_ID, cosmosSwapProvider } from '@/services/swap/cosmosSwapProvider';

/**
 * Swap application service: validates, then delegates to the provider that
 * serves the network. Providers are registered in priority order.
 */
let providers: SwapProvider[] = [cosmosSwapProvider()];

/**
 * Replaces the registered providers (extension and test injection point).
 *
 * @param next - Providers in priority order.
 * @returns The previous list.
 */
export function useSwapProviders(next: SwapProvider[]): SwapProvider[] {
  const previous = providers;
  providers = next;
  return previous;
}

const providerFor = (network: NetworkConfig) => providers.find((provider) => provider.supports(network));

const providerById = (id: string) => providers.find((provider) => provider.id === id);

const unavailable = () => new Error(t('swap.error.unavailable'));

/** Whether any provider swaps on this network (drives the Swap tile). */
export const swapsAvailable = (network: NetworkConfig) => providerFor(network) !== undefined;

/** Display name of the provider behind a quote. */
export const swapProviderName = (quote: SwapQuote) => providerById(quote.provider)?.name ?? quote.provider;

/**
 * Prices a swap for review, after checking the account can make it.
 *
 * @param network - Network config.
 * @param keypair - The account swapping.
 * @param request - Assets and gross amount.
 * @returns The quote.
 */
export async function quoteSwap(network: NetworkConfig, keypair: Keypair, request: SwapRequest): Promise<SwapQuote> {
  const provider = providerFor(network);
  if (!provider) {
    throw unavailable();
  }
  assertSwapRequest(request);
  assertAccountCanSwap(await fetchAccount(network, keypair.publicKey()), request, network.name);
  return provider.quote(network, request);
}

/**
 * Live estimate while the amount is typed: the same quote, without the
 * account checks that only matter at review time.
 *
 * @param network - Network config.
 * @param request - Assets and gross amount.
 * @returns The quote.
 */
export async function estimateSwap(network: NetworkConfig, request: SwapRequest): Promise<SwapQuote> {
  const provider = providerFor(network);
  if (!provider) {
    throw unavailable();
  }
  assertSwapRequest(request);
  return provider.quote(network, request);
}

/**
 * Executes a reviewed quote with the provider that priced it.
 *
 * @param network - Network config.
 * @param keypair - The account swapping.
 * @param quote - The reviewed quote.
 * @returns Hash and explorer link.
 */
export async function executeSwap(network: NetworkConfig, keypair: Keypair, quote: SwapQuote): Promise<SwapResult> {
  const provider = providerById(quote.provider);
  if (!provider?.supports(network)) {
    throw unavailable();
  }
  return provider.execute(network, keypair, quote);
}
