import type { Sep43Error } from '@/types';

/** True for SEP-43 style results that carry an `error`. */
export function hasSep43Error(value: unknown): value is { error: Sep43Error } {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false;
  const { error } = value;
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
}

/** Message of a thrown value, whether it is an `Error`, an `{ message }` object or anything else. */
export function errorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return String(error);
}

export function formatLogValue(value: unknown): string {
  return typeof value === 'string' ? value : JSON.stringify(value, null, 2);
}
