import type { Sep43Error } from './types.ts';

const USER_REJECTED = 4001;
const INVALID_PARAMS = -32602;
const METHOD_NOT_FOUND = -32601;

/**
 * Normalizes MetaMask / snap / official-adapter errors into SEP-43 codes.
 *
 * @param error - Anything thrown or returned as `error`.
 * @param source - Who produced it: the official adapter uses -4 for
 * "unsupported network", which SEP-43 reserves for user rejection.
 * @returns A SEP-43 error.
 */
export function toSep43Error(error: unknown, source: 'snap' | 'official' = 'snap'): Sep43Error {
  const { code, message } = readError(error);

  if (code === USER_REJECTED || /user rejected|user denied/iu.test(message)) {
    return { code: -4, message: message || 'User rejected the request.' };
  }
  if (code === INVALID_PARAMS || code === METHOD_NOT_FOUND || (source === 'official' && code === -4)) {
    return { code: -3, message };
  }
  if (code === -2 || code === -3 || code === -4) {
    return { code, message };
  }
  if (/horizon|transaction failed|fetch/iu.test(message)) {
    return { code: -2, message };
  }
  return { code: -1, message };
}

/**
 * Whether an error means the user said no (and we must not retry elsewhere).
 *
 * @param error - The error.
 * @returns True for user rejections.
 */
export function isUserRejection(error: unknown): boolean {
  return toSep43Error(error).code === -4;
}

/** Error thrown by the Wallets Kit module, carrying a SEP-43 code. */
export class StellarWalletError extends Error {
  readonly code: Sep43Error['code'];

  constructor(error: Sep43Error) {
    super(error.message);
    this.name = 'StellarWalletError';
    this.code = error.code;
  }
}

function readError(error: unknown): { code: number | undefined; message: string } {
  if (typeof error === 'object' && error !== null) {
    const record = error as { code?: unknown; message?: unknown };
    return {
      code: typeof record.code === 'number' ? record.code : undefined,
      message: typeof record.message === 'string' ? record.message : String(error),
    };
  }
  return { code: undefined, message: String(error) };
}
