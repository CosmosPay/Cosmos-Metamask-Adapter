import type { Json } from '@metamask/snaps-sdk';
import { InvalidParamsError, UserRejectedRequestError } from '@metamask/snaps-sdk';
import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { Struct } from '@metamask/superstruct';
import { assert } from '@metamask/superstruct';
import type { Keypair } from '@stellar/stellar-sdk/base';

import type { NetworkConfig } from '@/config/networks';
import { NETWORKS, networkFromPassphrase } from '@/config/networks';
import { getKeypair } from '@/wallet/keyring';
import { getState } from '@/wallet/state';
import type { CommonParams } from '@/rpc/schemas';

/** A dApp request as seen by one method handler. */
export type RpcRequest = { origin: string; params: unknown };

export type RpcMethodHandler = (request: RpcRequest) => Promise<Json>;

/** Method name → handler. Adding a method means adding an entry, not editing a switch. */
export type RpcMethodRegistry = Record<string, RpcMethodHandler>;

/**
 * Validates request params, mapping failures to a JSON-RPC invalid params error.
 *
 * @param params - The raw params.
 * @param struct - The schema.
 * @returns The typed params.
 */
export function validate<Type, Schema>(params: unknown, struct: Struct<Type, Schema>): Type {
  try {
    assert(params ?? {}, struct);
    return (params ?? {}) as Type;
  } catch (error) {
    throw new InvalidParamsError((error as Error).message);
  }
}

/**
 * Picks the network for a request: explicit param, else the user's selection.
 *
 * @param params - Request params.
 * @returns The network config.
 */
export async function resolveNetwork(params: CommonParams): Promise<NetworkConfig> {
  if (params.networkPassphrase !== undefined) {
    const network = networkFromPassphrase(params.networkPassphrase);
    if (!network) {
      throw new InvalidParamsError(`Unsupported network passphrase: ${params.networkPassphrase}`);
    }
    if (params.network && params.network !== network.id) {
      throw new InvalidParamsError('network and networkPassphrase do not match.');
    }
    return network;
  }
  if (params.network) {
    return NETWORKS[params.network];
  }
  return NETWORKS[(await getState()).network];
}

/**
 * Derives the signing keypair, checking it matches `address` when given.
 *
 * @param params - Request params.
 * @returns The keypair.
 */
export async function resolveKeypair(params: CommonParams): Promise<Keypair> {
  const { accounts, selectedAccount } = await getState();
  const index = params.accountIndex ?? selectedAccount;
  if (!accounts.includes(index)) {
    throw new InvalidParamsError(`Account #${index} is not in this wallet.`);
  }
  const keypair = await getKeypair(index);
  if (params.address && params.address !== keypair.publicKey()) {
    throw new InvalidParamsError(`Address ${params.address} is not account #${index} of this wallet.`);
  }
  return keypair;
}

/**
 * Shows a confirmation dialog and throws if the user rejects it.
 *
 * @param content - The dialog content.
 */
export async function confirm(content: JSXElement): Promise<void> {
  const approved = await snap.request({
    method: 'snap_dialog',
    params: { type: 'confirmation', content },
  });
  if (!approved) {
    throw new UserRejectedRequestError();
  }
}

/** Public description of a network, as returned to dApps. */
export const networkInfo = (network: NetworkConfig) => ({
  network: network.id,
  name: network.name,
  sep43Name: network.sep43Name,
  chainId: network.chainId,
  networkPassphrase: network.passphrase,
  horizonUrl: network.horizonUrl,
  rpcUrl: network.rpcUrl,
});
