/**
 * The site's languages and how they are written in URLs, `lang` and social
 * cards. No imports, so `vite.config.ts` (the boot script) can read it too.
 */

/** cosmospay.lat's languages in its order, then Chinese and Hindi. */
export const LANGUAGES = ['en', 'es', 'pt', 'fr', 'de', 'zh', 'hi'] as const;
export type Language = (typeof LANGUAGES)[number];

/**
 * Spanish pages live at the root (`/`, `/privacy/`), the product's Latin
 * American audience first; every other language under its code (`/en/`,
 * `/en/privacy/`), so each translation has its own URL for search engines.
 */
export const DEFAULT_LANGUAGE: Language = 'es';

export const isLanguage = (value: string): value is Language => (LANGUAGES as readonly string[]).includes(value);

/** Endonyms: each language is listed in its own words. */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  hi: 'हिन्दी',
};

/** BCP 47 tags for `lang` and `hreflang`. The Chinese text is Simplified, so screen readers pick the right voice. */
export const LANGUAGE_TAGS: Record<Language, string> = {
  en: 'en',
  es: 'es',
  pt: 'pt',
  fr: 'fr',
  de: 'de',
  zh: 'zh-Hans',
  hi: 'hi',
};

/** Open Graph locales (`ll_TT`), with the countries the language flags show. */
export const OG_LOCALES: Record<Language, string> = {
  en: 'en_US',
  es: 'es_AR',
  pt: 'pt_BR',
  fr: 'fr_FR',
  de: 'de_DE',
  zh: 'zh_CN',
  hi: 'hi_IN',
};
