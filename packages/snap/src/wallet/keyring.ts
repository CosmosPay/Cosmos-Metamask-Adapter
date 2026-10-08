import { SLIP10Node } from '@metamask/key-tree';
import { validateMnemonic } from '@metamask/scure-bip39';
import { wordlist } from '@metamask/scure-bip39/dist/wordlists/english';
import { Keypair, StrKey } from '@stellar/stellar-sdk/base';

import { getState, isImported } from '@/wallet/state';

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
  if (!isImported(index)) {
    // Derivation is a round-trip to MetaMask; keep derived keys for the session.
    let pending = derived.get(index);
    if (!pending) {
      pending = deriveKeypair(index);
      derived.set(index, pending);
      pending.catch(() => derived.delete(index));
    }
    return pending;
  }

  const secret = (await getState()).imported[String(index)];
  if (!secret) {
    throw new Error('Unknown imported account.');
  }
  return Keypair.fromSecret(secret);
}

const derived = new Map<number, Promise<Keypair>>();

/**
 * @param index - Account index (hardened).
 * @returns The keypair for `m/44'/148'/{index}'`.
 */
async function deriveKeypair(index: number): Promise<Keypair> {
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

export type ImportFailure = 'secret' | 'phrase' | 'account';

/** Why an import was refused (the UI maps `reason` to a message). */
export class ImportError extends Error {
  readonly reason: ImportFailure;

  constructor(reason: ImportFailure) {
    super(`Invalid import: ${reason}`);
    this.name = 'ImportError';
    this.reason = reason;
  }
}

/**
 * Turns what the user pasted into a keypair: a Stellar secret key (`S…`) or a
 * BIP-39 recovery phrase, derived like every SEP-0005 wallet at
 * `m/44'/148'/{account}'`.
 *
 * @param input - Secret key or 12/24-word phrase.
 * @param accountNumber - 1-based account of the phrase (ignored for a key).
 * @returns The keypair.
 */
export async function keypairFromImport(input: string, accountNumber = 1): Promise<Keypair> {
  const value = input.trim();
  if (/^S[A-Z2-7]{55}$/u.test(value.toUpperCase()) && !/\s/u.test(value)) {
    const secret = value.toUpperCase();
    if (!StrKey.isValidEd25519SecretSeed(secret)) {
      throw new ImportError('secret');
    }
    return Keypair.fromSecret(secret);
  }

  const phrase = value.toLowerCase().split(/\s+/u).join(' ');
  if (!validateMnemonic(phrase, wordlist)) {
    throw new ImportError('phrase');
  }
  if (!Number.isInteger(accountNumber) || accountNumber < 1 || accountNumber > 1000) {
    throw new ImportError('account');
  }
  const node = await SLIP10Node.fromDerivationPath({
    derivationPath: [`bip39:${phrase}`, "slip10:44'", "slip10:148'", `slip10:${accountNumber - 1}'`],
    curve: 'ed25519',
  });
  if (!node.privateKeyBytes) {
    throw new ImportError('phrase');
  }
  return Keypair.fromRawEd25519Seed(Buffer.from(node.privateKeyBytes));
}
