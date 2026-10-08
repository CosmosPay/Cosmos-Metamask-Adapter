import { useCallback } from 'react';
import { de } from '@/i18n/messages/de';
import { en } from '@/i18n/messages/en';
import { es, type MessageKey, type Messages } from '@/i18n/messages/es';
import { fr } from '@/i18n/messages/fr';
import { hi } from '@/i18n/messages/hi';
import { pt } from '@/i18n/messages/pt';
import { zh } from '@/i18n/messages/zh';
import { isLanguage, type Language } from '@/i18n/languages';
import { useLocation } from '@/lib/router';

export type { MessageKey } from '@/i18n/messages/es';
export {
  DEFAULT_LANGUAGE,
  LANGUAGE_NAMES,
  LANGUAGE_TAGS,
  LANGUAGES,
  OG_LOCALES,
  isLanguage,
  type Language,
} from '@/i18n/languages';

const CATALOGS: Record<Language, Messages> = { en, es, pt, fr, de, zh, hi };

/** Same key the boot script in vite.config.ts reads: the visitor's explicit choice. */
const STORAGE_KEY = 'lang';

/** The language the visitor picked, if they ever did. */
export function savedLanguage(): Language | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value && isLanguage(value) ? value : null;
  } catch {
    // Storage can be blocked (private mode, site data off).
    return null;
  }
}

/** Remembers an explicit choice: from then on, pages in the default language open in it (see the boot script). */
export function rememberLanguage(language: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch {
    // See savedLanguage: just don't persist.
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

/** The page's language, which its URL sets, and its `t()`. */
export function useI18n(): { language: Language; t: Translate } {
  const { language } = useLocation();
  const t = useCallback<Translate>((key, values) => translate(language, key, values), [language]);
  return { language, t };
}
