import { SLIP10Node } from '@metamask/key-tree';
import { Keypair } from '@stellar/stellar-sdk/base';

/**
 * Derives the Stellar keypair for `m/44'/148'/{index}'` (SEP-0005) from the
 * MetaMask Secret Recovery Phrase. The same SRP yields the same addresses as
 * any other SEP-0005 wallet (Lobstr, Freighter, Ledger, ...).
 *
 * The private key never leaves the snap.
 *
 * @param index - Account index (hardened).
 * @returns The Stellar keypair.
 */
export async function getKeypair(index = 0): Promise<Keypair> {
  const root = await snap.request({
    method: 'snap_getBip32Entropy',
    params: { path: ['m', "44'", "148'"], curve: 'ed25519' },
  });

  const node = await SLIP10Node.fromJSON(root);
  const account = await node.derive([`slip10:${index}'`]);

  if (!account.privateKeyBytes) {
    throw new Error('Unable to derive Stellar private key.');
  }

  return Keypair.fromRawEd25519Seed(account.privateKeyBytes);
}
