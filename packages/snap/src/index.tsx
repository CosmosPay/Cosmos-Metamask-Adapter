import type { Json, OnHomePageHandler, OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { InvalidParamsError, MethodNotFoundError, UserRejectedRequestError } from '@metamask/snaps-sdk';
import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import type { Struct } from '@metamask/superstruct';
import { assert, boolean, enums, integer, object, optional, refine, size, string } from '@metamask/superstruct';
import { Address, hash, StrKey, TransactionBuilder, xdr } from '@stellar/stellar-sdk/base';

import { buildLinkMessage, recoverPersonalSignAddress } from './evm';
import { fetchAccount, submitTransaction } from './horizon';
import { createHome } from './home';
import { loadPreferences, t } from './i18n';
import { getKeypair } from './keys';
import type { NetworkConfig, StellarNetwork } from './networks';
import { NETWORK_IDS, NETWORKS, networkFromPassphrase } from './networks';
import { PaymentValidationError, preparePayment, sendPayment } from './payments';
import { describeInvocation } from './soroban';
import { getState, updateState } from './state';
import { describeOperation, innerTransaction } from './transactions';
import {
  ConfirmAuthEntry,
  ConfirmLink,
  ConfirmMessage,
  ConfirmPayment,
  ConfirmSwitchNetwork,
  ConfirmTransaction,
} from './ui';

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
  (value) =>
    (/^\d+(\.\d{1,7})?$/u.test(value) && Number(value) > 0) || 'Expected a positive amount with up to 7 decimals',
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

const BaseParams = object(common);

const SwitchNetworkParams = object({ network: Network });

const SignTransactionParams = object({
  ...common,
  xdr: size(string(), 1, 200_000),
  submit: optional(boolean()),
});

const SignAuthEntryParams = object({
  ...common,
  authEntry: size(string(), 1, 100_000),
});

const SignMessageParams = object({
  ...common,
  message: size(string(), 1, 10_000),
});

const SendPaymentParams = object({
  ...common,
  destination: StellarAddress,
  amount: Amount,
  assetCode: optional(size(string(), 1, 12)),
  assetIssuer: optional(StellarAddress),
  memo: optional(size(string(), 1, 28)),
});

const LinkMessageParams = object({ ...common, evmAddress: EvmAddress });

const LinkParams = object({
  ...common,
  evmAddress: EvmAddress,
  evmSignature: refine(
    string(),
    'Signature',
    (value) => /^(0x)?[0-9a-fA-F]{130}$/u.test(value) || 'Expected a 65-byte hex signature',
  ),
});

type CommonParams = {
  network?: StellarNetwork | undefined;
  networkPassphrase?: string | undefined;
  accountIndex?: number | undefined;
  address?: string | undefined;
};

/**
 * Validates request params, mapping failures to a JSON-RPC invalid params error.
 *
 * @param params - The raw params.
 * @param struct - The schema.
 * @returns The typed params.
 */
function validate<Type, Schema>(params: unknown, struct: Struct<Type, Schema>): Type {
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
async function resolveNetwork(params: CommonParams): Promise<NetworkConfig> {
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
async function resolveKeypair(params: CommonParams) {
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
async function confirm(content: JSXElement) {
  const approved = await snap.request({
    method: 'snap_dialog',
    params: { type: 'confirmation', content },
  });
  if (!approved) {
    throw new UserRejectedRequestError();
  }
}

const networkInfo = (network: NetworkConfig) => ({
  network: network.id,
  name: network.name,
  sep43Name: network.sep43Name,
  chainId: network.chainId,
  networkPassphrase: network.passphrase,
  horizonUrl: network.horizonUrl,
  rpcUrl: network.rpcUrl,
});

const bytesEqual = (a: Uint8Array, b: Uint8Array) =>
  a.length === b.length && a.every((byte, index) => byte === b[index]);

export const onRpcRequest: OnRpcRequestHandler = async ({ origin, request }): Promise<Json> => {
  await loadPreferences();
  switch (request.method) {
    case 'stellar_getAddress': {
      const params = validate(request.params, BaseParams);
      const keypair = await resolveKeypair(params);
      return { address: keypair.publicKey() };
    }

    case 'stellar_getAccounts': {
      const { accounts, selectedAccount, accountNames } = await getState();
      return {
        selectedAccount,
        accounts: await Promise.all(
          accounts.map(async (index) => ({
            index,
            name: accountNames[String(index)] ?? t('accounts.name', { n: index + 1 }),
            address: (await getKeypair(index)).publicKey(),
          })),
        ),
      };
    }

    case 'stellar_getNetwork': {
      return networkInfo(await resolveNetwork(validate(request.params, BaseParams)));
    }

    case 'stellar_switchNetwork': {
      const { network: target } = validate(request.params, SwitchNetworkParams);
      const state = await getState();
      if (state.network !== target) {
        await confirm(<ConfirmSwitchNetwork origin={origin} from={NETWORKS[state.network]} to={NETWORKS[target]} />);
        await updateState({ network: target });
      }
      return networkInfo(NETWORKS[target]);
    }

    case 'stellar_getBalance': {
      const params = validate(request.params, BaseParams);
      const network = await resolveNetwork(params);
      const keypair = await resolveKeypair(params);
      const account = await fetchAccount(network, keypair.publicKey());
      return {
        address: keypair.publicKey(),
        network: network.chainId,
        funded: account !== null,
        balances: (account?.balances ?? []) as Json,
      };
    }

    case 'stellar_signTransaction': {
      const params = validate(request.params, SignTransactionParams);
      const network = await resolveNetwork(params);
      const keypair = await resolveKeypair(params);

      let tx;
      try {
        tx = TransactionBuilder.fromXDR(params.xdr, network.passphrase);
      } catch {
        throw new InvalidParamsError('Invalid transaction XDR.');
      }
      const inner = innerTransaction(tx);
      const memo = inner.memo.value;

      await confirm(
        <ConfirmTransaction
          origin={origin}
          network={network}
          signer={keypair.publicKey()}
          source={'feeSource' in tx ? tx.feeSource : inner.source}
          fee={tx.fee}
          memo={memo === null || memo === undefined ? undefined : memo.toString()}
          operations={inner.operations.map(describeOperation)}
          submit={Boolean(params.submit)}
        />,
      );

      tx.sign(keypair);
      const signedXdr = tx.toXDR();
      const signed = {
        signedXdr,
        signedTxXdr: signedXdr,
        signerAddress: keypair.publicKey(),
      };

      if (params.submit) {
        return { ...signed, ...(await submitTransaction(network, signedXdr)) };
      }
      return signed;
    }

    case 'stellar_signAuthEntry': {
      const params = validate(request.params, SignAuthEntryParams);
      const network = await resolveNetwork(params);
      const keypair = await resolveKeypair(params);

      let preimage: xdr.HashIdPreimage;
      try {
        preimage = xdr.HashIdPreimage.fromXDR(params.authEntry, 'base64');
      } catch {
        throw new InvalidParamsError('authEntry must be a base64 HashIdPreimage XDR.');
      }

      let authorization;
      let account: string | undefined;
      if (preimage.type === 'envelopeTypeSorobanAuthorization') {
        authorization = preimage.sorobanAuthorization;
      } else if (preimage.type === 'envelopeTypeSorobanAuthorizationWithAddress') {
        authorization = preimage.sorobanAuthorizationWithAddress;
        account = Address.fromScAddress(authorization.address).toString();
      } else {
        throw new InvalidParamsError('authEntry is not a Soroban authorization preimage.');
      }

      if (!bytesEqual(authorization.networkId.toBytes(), hash(network.passphrase))) {
        throw new InvalidParamsError(`Auth entry was not built for ${network.name}.`);
      }

      await confirm(
        <ConfirmAuthEntry
          origin={origin}
          network={network}
          signer={keypair.publicKey()}
          account={account}
          nonce={authorization.nonce.toString()}
          expirationLedger={authorization.signatureExpirationLedger}
          invocation={describeInvocation(authorization.invocation)}
        />,
      );

      const signature = keypair.sign(hash(preimage.toXDR()));
      return {
        signedAuthEntry: Buffer.from(signature).toString('base64'),
        signerAddress: keypair.publicKey(),
      };
    }

    case 'stellar_signMessage': {
      const params = validate(request.params, SignMessageParams);
      const keypair = await resolveKeypair(params);

      await confirm(<ConfirmMessage origin={origin} signer={keypair.publicKey()} message={params.message} />);

      // SEP-53: ed25519(sha256("Stellar Signed Message:\n" + message)).
      const signature = Buffer.from(keypair.signMessage(params.message)).toString('base64');
      return {
        address: keypair.publicKey(),
        signature,
        signedMessage: signature,
        signerAddress: keypair.publicKey(),
      };
    }

    case 'stellar_sendPayment': {
      const params = validate(request.params, SendPaymentParams);
      const network = await resolveNetwork(params);
      const keypair = await resolveKeypair(params);

      let prepared;
      try {
        prepared = await preparePayment(network, keypair, params);
      } catch (error) {
        if (error instanceof PaymentValidationError) {
          throw new InvalidParamsError(error.message);
        }
        throw error;
      }

      await confirm(
        <ConfirmPayment
          origin={origin}
          network={network}
          from={keypair.publicKey()}
          to={params.destination}
          amount={params.amount}
          asset={prepared.assetLabel}
          memo={params.memo}
          createsAccount={prepared.createsAccount}
        />,
      );

      return sendPayment(network, keypair, prepared);
    }

    case 'stellar_getLinkMessage': {
      const params = validate(request.params, LinkMessageParams);
      const keypair = await resolveKeypair(params);
      return {
        message: buildLinkMessage(params.evmAddress, keypair.publicKey()),
      };
    }

    case 'stellar_linkEvmAddress': {
      const params = validate(request.params, LinkParams);
      const keypair = await resolveKeypair(params);
      const stellarAddress = keypair.publicKey();
      const evmAddress = params.evmAddress.toLowerCase();
      const message = buildLinkMessage(evmAddress, stellarAddress);

      let recovered: string;
      try {
        recovered = recoverPersonalSignAddress(message, params.evmSignature);
      } catch {
        throw new InvalidParamsError('Invalid EVM signature.');
      }
      if (recovered !== evmAddress) {
        throw new InvalidParamsError('EVM signature was not produced by evmAddress.');
      }

      await confirm(<ConfirmLink origin={origin} evmAddress={evmAddress} stellarAddress={stellarAddress} />);

      const link = {
        evmAddress,
        stellarAddress,
        message,
        evmSignature: params.evmSignature,
        stellarSignature: Buffer.from(keypair.signMessage(message)).toString('base64'),
        linkedAt: Date.now(),
      };
      const { links } = await getState();
      await updateState({
        links: [
          ...links.filter((item) => !(item.evmAddress === evmAddress && item.stellarAddress === stellarAddress)),
          link,
        ],
      });
      return link;
    }

    case 'stellar_getLinkedAddresses': {
      const params = validate(request.params, BaseParams);
      const { links } = await getState();
      if (params.accountIndex === undefined && params.address === undefined) {
        return links;
      }
      const keypair = await resolveKeypair(params);
      return links.filter((link) => link.stellarAddress === keypair.publicKey());
    }

    default:
      throw new MethodNotFoundError({ method: request.method });
  }
};

export const onHomePage: OnHomePageHandler = async () => ({
  id: await createHome(),
});

export { onUserInput } from './home';
