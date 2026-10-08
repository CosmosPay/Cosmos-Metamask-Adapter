import en from '@locales/en.json';
import es from '@locales/es.json';
import pt from '@locales/pt.json';

import { hideBalances, loadPreferences, localizeNumber, pricingPreferences, t } from '@/i18n';

const catalogs = { en: en.messages, es: es.messages, pt: pt.messages } as Record<
  string,
  Record<string, { message: string }>
>;

const placeholders = (message: string) => [...message.matchAll(/\{(\w+)\}/gu)].map((match) => match[1]).sort();

describe('locales', () => {
  const english = catalogs.en ?? {};

  it.each(['es', 'pt'])('%s has exactly the English keys', (language) => {
    expect(Object.keys(catalogs[language] ?? {}).sort()).toEqual(Object.keys(english).sort());
  });

  it.each(['es', 'pt'])('%s keeps every placeholder of each message', (language) => {
    const catalog = catalogs[language] ?? {};
    for (const [key, { message }] of Object.entries(english)) {
      expect([key, placeholders(catalog[key]?.message ?? '')]).toEqual([key, placeholders(message)]);
    }
  });

  it('has no empty messages', () => {
    for (const catalog of Object.values(catalogs)) {
      for (const [key, { message }] of Object.entries(catalog)) {
        expect([key, message.trim().length > 0]).toEqual([key, true]);
      }
    }
  });
});

describe('t', () => {
  it('fills placeholders and defaults to English outside MetaMask', () => {
    expect(t('send.title', { network: 'Testnet' })).toBe('Send on Testnet');
  });

  it('formats numbers for the language', () => {
    expect(localizeNumber('1,234.5')).toBe('1,234.5');
  });
});

describe('loadPreferences', () => {
  const stubPreferences = (preferences: Record<string, unknown>) => {
    jest.spyOn(snap, 'request').mockImplementation((async () => preferences) as unknown as typeof snap.request);
  };

  afterEach(async () => {
    jest.restoreAllMocks();
    await loadPreferences(); // the stub-less snap.request throws → back to English
  });

  it("follows MetaMask's language, currency and privacy settings", async () => {
    stubPreferences({ locale: 'es_419', currency: 'EUR', hideBalances: true, useExternalPricingData: false });
    await loadPreferences();

    expect(t('send.title', { network: 'Testnet' })).toBe('Enviar en Testnet');
    expect(localizeNumber('1,234.5')).toBe('1.234,5');
    expect(hideBalances()).toBe(true);
    expect(pricingPreferences()).toEqual({ currency: 'eur', enabled: false });
  });

  it('falls back to English for unsupported languages', async () => {
    stubPreferences({ locale: 'ja', currency: 'usd', hideBalances: false, useExternalPricingData: true });
    await loadPreferences();
    expect(t('send.title', { network: 'Testnet' })).toBe('Send on Testnet');
  });

  it('resets every preference when MetaMask cannot answer', async () => {
    stubPreferences({ locale: 'es', currency: 'EUR', hideBalances: true, useExternalPricingData: false });
    await loadPreferences();
    jest.restoreAllMocks();
    await loadPreferences();
    expect(pricingPreferences()).toEqual({ currency: 'usd', enabled: true });
    expect(hideBalances()).toBe(false);
  });
});
