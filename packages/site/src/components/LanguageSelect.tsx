import { LANGUAGE_NAMES, LANGUAGES, setLanguage, useI18n } from '@/i18n';

/**
 * Language picker for the nav. Options read as short codes (ES / EN / PT) so
 * it fits beside the connect button on phones; assistive tech gets each
 * language's own name.
 */
export function LanguageSelect() {
  const { language, t } = useI18n();
  return (
    <label className="language-select">
      <span className="visually-hidden">{t('nav.language')}</span>
      <select
        value={language}
        onChange={(event) => {
          const next = LANGUAGES.find((code) => code === event.currentTarget.value);
          if (next) setLanguage(next);
        }}
      >
        {LANGUAGES.map((code) => (
          <option key={code} value={code} lang={code} aria-label={LANGUAGE_NAMES[code]}>
            {code.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}
