import en from '../locales/en.json';
import es from '../locales/es.json';
import pt from '../locales/pt.json';

export type MessageKey = keyof typeof en.messages;
type Messages = Record<MessageKey, { message: string }>;

const CATALOGS: Record<string, Messages> = { en: en.messages, es: es.messages, pt: pt.messages };

/** Decimal / thousands separators per language. */
const SEPARATORS: Record<string, { decimal: string; group: string }> = {
  en: { decimal: '.', group: ',' },
  es: { decimal: ',', group: '.' },
  pt: { decimal: ',', group: '.' },
};

let language = 'en';
let balancesHidden = false;
let fiatCurrency = 'usd';
let externalPricing = true;

/**
 * Picks the catalog matching MetaMask's language (`es_419` → `es`), falling
 * back to English. Call at the start of every handler.
 */
export async function loadPreferences(): Promise<void> {
  try {
    const preferences = await snap.request({ method: 'snap_getPreferences' });
    const base = preferences.locale.toLowerCase().split(/[-_]/u)[0] ?? 'en';
    language = base in CATALOGS ? base : 'en';
    balancesHidden = preferences.hideBalances;
    fiatCurrency = preferences.currency.toLowerCase();
    externalPricing = preferences.useExternalPricingData;
  } catch {
    language = 'en';
    balancesHidden = false;
  }
}

export const currentLanguage = () => language;

/** Whether the user turned on "hide balances" in MetaMask. */
export const hideBalances = () => balancesHidden;

/** MetaMask's display currency (e.g. `usd`) and whether price lookups are allowed. */
export const pricingPreferences = () => ({ currency: fiatCurrency, enabled: externalPricing });

/**
 * Localized short date, e.g. "6 oct, 21:15".
 *
 * @param iso - ISO timestamp.
 * @returns The formatted date.
 */
export function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(language, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16).replace('T', ' ');
  }
}

/**
 * Translates a message, replacing `{placeholders}`.
 *
 * @param key - Message key.
 * @param values - Placeholder values.
 * @returns The localized text.
 */
export function t(key: MessageKey, values: Record<string, string | number> = {}): string {
  const template = (CATALOGS[language] ?? CATALOGS.en)[key]?.message ?? en.messages[key].message;
  return template.replace(/\{(\w+)\}/gu, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}

/**
 * Applies the language's separators to a number formatted as `1,234.5`.
 *
 * @param value - Number with `,` grouping and `.` decimals.
 * @returns The localized number.
 */
export function localizeNumber(value: string): string {
  const { decimal, group } = SEPARATORS[language] ?? SEPARATORS.en!;
  return value.replace(/[,.]/gu, (char) => (char === ',' ? group : decimal));
}
