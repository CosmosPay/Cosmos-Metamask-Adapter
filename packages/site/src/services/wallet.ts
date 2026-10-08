import { HybridStellarAdapter } from '@cosmosapp/stellar-metamask-adapter';
import { SNAP_ID } from '@/config';
import type { StellarWallet } from '@/types';

/** The only place that knows about the concrete adapter. */
export function createWallet(): StellarWallet {
  return new HybridStellarAdapter({ snapId: SNAP_ID });
}
