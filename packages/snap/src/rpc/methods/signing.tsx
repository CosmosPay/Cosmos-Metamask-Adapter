import { InvalidParamsError } from '@metamask/snaps-sdk';
import { Address, hash, TransactionBuilder, xdr } from '@stellar/stellar-sdk/base';

import { describeInvocation } from '@/domain/soroban';
import { summarizeTransaction } from '@/domain/transactions';
import { submitTransaction } from '@/services/horizon';
import type { RpcMethodRegistry } from '@/rpc/context';
import { confirm, resolveKeypair, resolveNetwork, validate } from '@/rpc/context';
import { ConfirmAuthEntry, ConfirmMessage, ConfirmTransaction } from '@/rpc/dialogs';
import { SignAuthEntryParams, SignMessageParams, SignTransactionParams } from '@/rpc/schemas';

const bytesEqual = (a: Uint8Array, b: Uint8Array) =>
  a.length === b.length && a.every((byte, index) => byte === b[index]);

const base64 = (bytes: Uint8Array) => Buffer.from(bytes).toString('base64');

/**
 * Decodes a HashIdPreimage into its Soroban authorization and, for
 * address-bound credentials, the account it authorizes.
 *
 * @param authEntry - Base64 HashIdPreimage XDR.
 * @returns The preimage, its authorization and the optional account.
 */
function decodeAuthEntry(authEntry: string) {
  let preimage: xdr.HashIdPreimage;
  try {
    preimage = xdr.HashIdPreimage.fromXDR(authEntry, 'base64');
  } catch {
    throw new InvalidParamsError('authEntry must be a base64 HashIdPreimage XDR.');
  }
  if (preimage.type === 'envelopeTypeSorobanAuthorization') {
    return { preimage, authorization: preimage.sorobanAuthorization, account: undefined };
  }
  if (preimage.type === 'envelopeTypeSorobanAuthorizationWithAddress') {
    const authorization = preimage.sorobanAuthorizationWithAddress;
    return { preimage, authorization, account: Address.fromScAddress(authorization.address).toString() };
  }
  throw new InvalidParamsError('authEntry is not a Soroban authorization preimage.');
}

export const signingMethods: RpcMethodRegistry = {
  async stellar_signTransaction({ origin, params }) {
    const request = validate(params, SignTransactionParams);
    const network = await resolveNetwork(request);
    const keypair = await resolveKeypair(request);

    let tx;
    try {
      tx = TransactionBuilder.fromXDR(request.xdr, network.passphrase);
    } catch {
      throw new InvalidParamsError('Invalid transaction XDR.');
    }

    await confirm(
      <ConfirmTransaction
        origin={origin}
        network={network}
        signer={keypair.publicKey()}
        submit={Boolean(request.submit)}
        {...summarizeTransaction(tx)}
      />,
    );

    tx.sign(keypair);
    const signedXdr = tx.toXDR();
    const signed = {
      signedXdr,
      signedTxXdr: signedXdr,
      signerAddress: keypair.publicKey(),
    };
    return request.submit ? { ...signed, ...(await submitTransaction(network, signedXdr)) } : signed;
  },

  async stellar_signAuthEntry({ origin, params }) {
    const request = validate(params, SignAuthEntryParams);
    const network = await resolveNetwork(request);
    const keypair = await resolveKeypair(request);
    const { preimage, authorization, account } = decodeAuthEntry(request.authEntry);

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

    return {
      signedAuthEntry: base64(keypair.sign(hash(preimage.toXDR()))),
      signerAddress: keypair.publicKey(),
    };
  },

  async stellar_signMessage({ origin, params }) {
    const request = validate(params, SignMessageParams);
    const keypair = await resolveKeypair(request);

    await confirm(<ConfirmMessage origin={origin} signer={keypair.publicKey()} message={request.message} />);

    // SEP-53: ed25519(sha256("Stellar Signed Message:\n" + message)).
    const signature = base64(keypair.signMessage(request.message));
    return {
      address: keypair.publicKey(),
      signature,
      signedMessage: signature,
      signerAddress: keypair.publicKey(),
    };
  },
};
