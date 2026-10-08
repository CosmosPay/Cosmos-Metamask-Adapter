import { useState } from 'react';
import { Flag } from '@/components/Flag';
import { Link } from '@/components/Link';
import { useHydrated } from '@/hooks/useHydrated';
import {
  isLanguage,
  type Language,
  LANGUAGE_TAGS,
  type MessageKey,
  rememberLanguage,
  savedLanguage,
  translate,
  useI18n,
} from '@/i18n';
import { pathFor, useLocation } from '@/lib/router';

/** The first of the browser's languages the site has, if any. */
function browserLanguage(): Language | null {
  for (const tag of navigator.languages ?? [navigator.language]) {
    const code = tag.slice(0, 2).toLowerCase();
    if (isLanguage(code)) return code;
  }
  return null;
}

/**
 * Offers this page in the browser's language when it shows another one, until
 * the visitor picks a language (here or in the nav). An offer, not a redirect:
 * search engines and shared links keep the language their URL asks for. It
 * speaks the language it offers, and floats so it never shifts the page.
 */
export function LanguageSuggestion() {
  const { language } = useI18n();
  const { route } = useLocation();
  const hydrated = useHydrated();
  const [dismissed, setDismissed] = useState(false);
  if (!hydrated || dismissed || savedLanguage()) return null;
  const offered = browserLanguage();
  if (!offered || offered === language) return null;

  const say = (key: MessageKey) => translate(offered, key);
  const keepThisLanguage = () => {
    rememberLanguage(language);
    setDismissed(true);
  };

  return (
    <aside className="notice language-suggestion" lang={LANGUAGE_TAGS[offered]} aria-label={say('nav.language')}>
      <Flag language={offered} />
      <p>{say('suggest.text')}</p>
      <Link
        className="language-suggestion-action"
        href={pathFor(route ?? 'home', offered)}
        hrefLang={LANGUAGE_TAGS[offered]}
        onClick={() => rememberLanguage(offered)}
      >
        {say('suggest.action')}
      </Link>
      <button type="button" className="toast-close" aria-label={say('suggest.dismiss')} onClick={keepThisLanguage}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </aside>
  );
}
