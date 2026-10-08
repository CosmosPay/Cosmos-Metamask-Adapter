import { boolean, enums, integer, object, optional, refine, size, string } from '@metamask/superstruct';
import { StrKey } from '@stellar/stellar-sdk/base';

import type { StellarNetwork } from '@/config/networks';
import { NETWORK_IDS } from '@/config/networks';
import { isPositiveAmount } from '@/domain/amounts';

/** Request param schemas for every RPC method. */

const MAX_INDEX = 2 ** 31 - 1;

const Network = enums(NETWORK_IDS);
const AccountIndex = size(integer(), 0, MAX_INDEX);
const StellarAddress = refine(
  string(),
  'StellarAddress',
  (value) => StrKey.isValidEd25519PublicKey(value) || 'Expected a G... Stellar address',
);
const EvmAddress = refine(
  string(),
  'EvmAddress',
  (value) => /^0x[0-9a-fA-F]{40}$/u.test(value) || 'Expected a 0x EVM address',
);
const Amount = refine(
  string(),
  'Amount',
  (value) => isPositiveAmount(value) || 'Expected a positive amount with up to 7 decimals',
);

/**
 * Fields shared by every method. `network` and `networkPassphrase` (SEP-43
 * style) are interchangeable; `address` lets SEP-43 callers assert which
 * account they expect to sign.
 */
const common = {
  network: optional(Network),
  networkPassphrase: optional(string()),
  accountIndex: optional(AccountIndex),
  address: optional(StellarAddress),
};

export type CommonParams = {
  network?: StellarNetwork | undefined;
  networkPassphrase?: string | undefined;
  accountIndex?: number | undefined;
  address?: string | undefined;
};

export const BaseParams = object(common);

export const SwitchNetworkParams = object({ network: Network });

export const SignTransactionParams = object({
  ...common,
  xdr: size(string(), 1, 200_000),
  submit: optional(boolean()),
});

export const SignAuthEntryParams = object({
  ...common,
  authEntry: size(string(), 1, 100_000),
});

export const SignMessageParams = object({
  ...common,
  message: size(string(), 1, 10_000),
});

export const SendPaymentParams = object({
  ...common,
  destination: StellarAddress,
  amount: Amount,
  assetCode: optional(size(string(), 1, 12)),
  assetIssuer: optional(StellarAddress),
  memo: optional(size(string(), 1, 28)),
});

export const LinkMessageParams = object({ ...common, evmAddress: EvmAddress });

export const LinkParams = object({
  ...common,
  evmAddress: EvmAddress,
  evmSignature: refine(
    string(),
    'Signature',
    (value) => /^(0x)?[0-9a-fA-F]{130}$/u.test(value) || 'Expected a 65-byte hex signature',
  ),
});
