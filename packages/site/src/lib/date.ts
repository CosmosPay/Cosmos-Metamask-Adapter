import type { Language } from '@/i18n/languages';

/**
 * An ISO day (`2026-10-09`) as a long date in the reader's language; noon
 * keeps it on the same day in every time zone. Node and the browser may word
 * it slightly differently, so a `<time>` showing it suppresses the hydration warning.
 */
export const longDate = (iso: string, language: Language) =>
  new Intl.DateTimeFormat(language, { dateStyle: 'long' }).format(new Date(`${iso}T12:00:00`));
