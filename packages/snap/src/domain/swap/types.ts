import type { Keypair } from '@stellar/stellar-sdk/base';

import type { NetworkConfig } from '@/config/networks';

/** XLM is `{ code: 'XLM', issuer: null }`. */
export type SwapAsset = { code: string; issuer: string | null };

export type SwapRequest = { from: SwapAsset; to: SwapAsset; amount: string };

/** A priced swap, as the user reviews it. */
export type SwapQuote = {
  /** Id of the {@link SwapProvider} that priced it (and must execute it). */
  provider: string;
  from: SwapAsset;
  to: SwapAsset;
  /** Gross amount the user sends. */
  sendAmount: string;
  fee: { amount: string; bps: number; wallet: string | null };
  /** Net amount routed through the DEX / AMMs. */
  swapAmount: string;
  estimated: string;
  minimum: string;
  slippageBps: number;
  path: SwapAsset[];
};

export type SwapResult = { hash: string; explorerUrl: string };

/**
 * Something that can price and execute swaps (Strategy). The Cosmos Pay
 * community server is the only one today; another venue is a new
 * implementation registered in `services/swap`, with no change to the UI.
 */
export type SwapProvider = {
  readonly id: string;
  /** Display name in the review screen. */
  readonly name: string;
  supports(network: NetworkConfig): boolean;
  quote(network: NetworkConfig, request: SwapRequest): Promise<SwapQuote>;
  execute(network: NetworkConfig, keypair: Keypair, quote: SwapQuote): Promise<SwapResult>;
};

export const DEFAULT_SLIPPAGE_BPS = 50;
