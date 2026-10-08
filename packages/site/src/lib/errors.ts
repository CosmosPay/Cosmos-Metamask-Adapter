import type { MessageKey, Translate, TranslateValues } from '@/i18n';
import type { Sep43Error } from '@/types';

/** An error of our own, raised with a message key so it's shown in the user's language. */
export class AppError extends Error {
  constructor(
    readonly key: MessageKey,
    readonly values: TranslateValues = {},
  ) {
    super(key);
    this.name = 'AppError';
  }
}

/** Throws a SEP-43 `{ code, message }` (from a wallet result) as an Error that keeps its code. */
export function sep43Failure(error: Sep43Error): Error & Sep43Error {
  return Object.assign(new Error(error.message), { code: error.code });
}

/** True for anything carrying a SEP-43 code (-1…-4) and a message, thrown or returned. */
function isSep43(value: unknown): value is Sep43Error {
  if (typeof value !== 'object' || value === null) return false;
  const { code, message } = value as Partial<Sep43Error>;
  return typeof code === 'number' && code >= -4 && code <= -1 && typeof message === 'string';
}

/** SEP-43 results report failure as `{ error }` instead of throwing. */
export function hasSep43Error(value: unknown): value is { error: Sep43Error } {
  return typeof value === 'object' && value !== null && 'error' in value && isSep43(value.error);
}

const SEP43_TITLES: Record<number, MessageKey> = {
  [-4]: 'error.rejected.title',
  [-3]: 'error.invalid.title',
  [-2]: 'error.external.title',
  [-1]: 'error.internal.title',
};

/**
 * Title and text for an error toast. A rejection gets our own wording (the
 * wallet's is English boilerplate); other wallet errors keep their message,
 * which is the useful part.
 */
export function describeError(error: unknown, t: Translate): { title: string; message: string } {
  if (error instanceof AppError) {
    return { title: t('error.internal.title'), message: t(error.key, error.values) };
  }
  if (isSep43(error)) {
    if (error.code === -4) return { title: t('error.rejected.title'), message: t('error.rejected.text') };
    return { title: t(SEP43_TITLES[error.code] ?? 'error.internal.title'), message: error.message };
  }
  const message =
    typeof error === 'object' && error !== null && 'message' in error ? String(error.message) : String(error);
  return { title: t('error.internal.title'), message };
}
