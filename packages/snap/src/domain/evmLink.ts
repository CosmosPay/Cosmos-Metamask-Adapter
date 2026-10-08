import { secp256k1 } from '@noble/curves/secp256k1';
import { keccak_256 } from '@noble/hashes/sha3';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils';

/**
 * The statement both keys sign to prove they belong to the same person. It is
 * deterministic so anyone can rebuild it and verify the two signatures.
 *
 * @param evmAddress - 0x address (any case).
 * @param stellarAddress - G... address.
 * @returns The message.
 */
export function buildLinkMessage(evmAddress: string, stellarAddress: string): string {
  return ['Link EVM address to Stellar account', `EVM: ${evmAddress.toLowerCase()}`, `Stellar: ${stellarAddress}`].join(
    '\n',
  );
}

/**
 * Recovers the signer of an EIP-191 `personal_sign` signature.
 *
 * @param message - The UTF-8 message that was signed.
 * @param signature - 65-byte hex signature (r || s || v).
 * @returns The lowercase 0x address of the signer.
 */
export function recoverPersonalSignAddress(message: string, signature: string): string {
  const bytes = hexToBytes(signature.replace(/^0x/u, ''));
  if (bytes.length !== 65) {
    throw new Error('Expected a 65-byte signature.');
  }

  const messageBytes = utf8ToBytes(message);
  const digest = keccak_256(
    new Uint8Array([...utf8ToBytes(`\x19Ethereum Signed Message:\n${messageBytes.length}`), ...messageBytes]),
  );

  const v = bytes[64] as number;
  const recovery = v >= 27 ? v - 27 : v;
  const publicKey = secp256k1.Signature.fromCompact(bytes.slice(0, 64))
    .addRecoveryBit(recovery)
    .recoverPublicKey(digest)
    .toRawBytes(false);

  return `0x${bytesToHex(keccak_256(publicKey.slice(1)).slice(-20))}`;
}
