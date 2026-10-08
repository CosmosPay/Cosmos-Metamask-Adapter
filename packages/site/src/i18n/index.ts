import { useCallback, useSyncExternalStore } from 'react';
import { de } from '@/i18n/messages/de';
import { en } from '@/i18n/messages/en';
import { es, type MessageKey, type Messages } from '@/i18n/messages/es';
import { fr } from '@/i18n/messages/fr';
import { hi } from '@/i18n/messages/hi';
import { pt } from '@/i18n/messages/pt';
import { zh } from '@/i18n/messages/zh';

export type { MessageKey } from '@/i18n/messages/es';

/** cosmospay.lat's languages in its order, then Chinese and Hindi. Spanish is still the default (see currentLanguage). */
export const LANGUAGES = ['en', 'es', 'pt', 'fr', 'de', 'zh', 'hi'] as const;
export type Language = (typeof LANGUAGES)[number];

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

const CATALOGS: Record<Language, Messages> = { en, es, pt, fr, de, zh, hi };

/** Same key the inline script in index.html reads before first paint. */
const STORAGE_KEY = 'lang';

const root = document.documentElement;

const isLanguage = (value: string): value is Language => (LANGUAGES as readonly string[]).includes(value);

/** The language on <html lang>, which index.html sets from the saved choice or the browser. */
export const currentLanguage = (): Language => (isLanguage(root.lang) ? root.lang : 'es');

export function setLanguage(language: Language): void {
  root.lang = language;
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Storage can be blocked (private mode, site data off): just don't persist.
  }
}

export type TranslateValues = Record<string, string | number>;
export type Translate = (key: MessageKey, values?: TranslateValues) => string;

/** `{name}` placeholders; unknown ones are left as is so they show up in review. */
export function translate(language: Language, key: MessageKey, values: TranslateValues = {}): string {
  return CATALOGS[language][key].replace(/\{(\w+)\}/gu, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(root, { attributes: true, attributeFilter: ['lang'] });
  return () => observer.disconnect();
}

/** Current language and its `t()`, re-rendering when the language changes. */
export function useI18n(): { language: Language; t: Translate } {
  const language = useSyncExternalStore(subscribe, currentLanguage);
  const t = useCallback<Translate>((key, values) => translate(language, key, values), [language]);
  return { language, t };
}
