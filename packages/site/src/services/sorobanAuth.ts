import { Address, authorizeInvocation, hash, nativeToScVal, StrKey, xdr } from '@stellar/stellar-sdk/base';
import { base64ToBytes } from '@/lib/base64';
import type { StellarWallet } from '@/types';

export type SignedAuthorization = {
  contract: string;
  signedEntryXdr: string;
};

/** A `transfer(from, to, 1 XLM)` invocation on a deterministic demo token contract. */
function buildDemoTransfer(contract: string, from: string): xdr.SorobanAuthorizedInvocation {
  return new xdr.SorobanAuthorizedInvocation({
    function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
      new xdr.InvokeContractArgs({
        contractAddress: Address.fromString(contract).toScAddress(),
        functionName: 'transfer',
        args: [
          nativeToScVal(from, { type: 'address' }),
          nativeToScVal(StrKey.encodeContract(hash('demo-recipient')), { type: 'address' }),
          nativeToScVal(10_000_000n, { type: 'i128' }),
        ],
      }),
    ),
    subInvocations: [],
  });
}

/**
 * Builds a demo Soroban authorization, has the wallet sign it (SEP-43
 * `signAuthEntry`) and verifies the signature with the Stellar SDK, like a
 * Soroban dApp would.
 */
export async function signDemoAuthorization(
  wallet: Pick<StellarWallet, 'getNetwork' | 'signAuthEntry'>,
  address: string,
): Promise<SignedAuthorization> {
  const { networkPassphrase } = await wallet.getNetwork();
  const contract = StrKey.encodeContract(hash('demo-token'));

  // authorizeInvocation verifies the wallet's signature against the payload.
  const entry = await authorizeInvocation({
    invocation: buildDemoTransfer(contract, address),
    networkPassphrase,
    publicKey: address,
    validUntilLedgerSeq: 1_000_000,
    signer: async (preimage) => {
      const result = await wallet.signAuthEntry(preimage.toXDR('base64'), {
        networkPassphrase,
        address,
      });
      if (result.error || !result.signedAuthEntry) {
        throw new Error(result.error?.message ?? 'Sin firma');
      }
      return {
        signature: base64ToBytes(result.signedAuthEntry),
        publicKey: result.signerAddress,
      };
    },
  });
  return { contract, signedEntryXdr: entry.toXDR('base64') };
}
