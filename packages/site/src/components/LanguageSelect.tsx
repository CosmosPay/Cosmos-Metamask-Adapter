import { type KeyboardEvent, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { Flag } from '@/components/Flag';
import { Link } from '@/components/Link';
import { LANGUAGE_NAMES, LANGUAGE_TAGS, LANGUAGES, rememberLanguage, useI18n } from '@/i18n';
import { pathFor, useLocation } from '@/lib/router';

/**
 * Language dropdown for the nav, like cosmospay.lat's. The button shows the
 * flag and the short code (ES / EN / …) so it fits beside the connect button
 * on phones; the list shows each language in its own words.
 *
 * Each language is a link to this page's translation (its own URL), so
 * crawlers find every translation and it works before scripts load. It's a
 * disclosure: the button opens the list, arrows, Home and End move between
 * the links, Escape closes and returns focus to the button.
 */
export function LanguageSelect() {
  const { language, t } = useI18n();
  const { route } = useLocation();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const listId = useId();

  // Opening focuses the current language right away (before the next key press: WebKit runs plain effects late).
  useLayoutEffect(() => {
    if (open) root.current?.querySelector<HTMLElement>('[aria-current="true"]')?.focus();
  }, [open]);

  // A press anywhere outside closes the list.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  const onTriggerKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      // Already open (a click or Enter opened it): the arrows step into the list.
      if (open) root.current?.querySelector<HTMLElement>('[aria-current="true"]')?.focus();
      else setOpen(true);
    } else if (event.key === 'Escape' && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const links = [...event.currentTarget.querySelectorAll<HTMLElement>('a')];
    const index = links.findIndex((link) => link === document.activeElement);
    const focus = (next: number) => links[(next + links.length) % links.length]?.focus();
    switch (event.key) {
      case 'ArrowDown':
        focus(index + 1);
        break;
      case 'ArrowUp':
        focus(index - 1);
        break;
      case 'Home':
        focus(0);
        break;
      case 'End':
        focus(links.length - 1);
        break;
      case 'Escape':
        close();
        break;
      case 'Tab':
        // Let focus move on; just drop the list.
        setOpen(false);
        return;
      default:
        return;
    }
    event.preventDefault();
  };

  return (
    <div className="language" ref={root}>
      <Button
        ref={trigger}
        ink
        className="language-trigger"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${t('nav.language')}: ${LANGUAGE_NAMES[language]}`}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={onTriggerKeyDown}
      >
        <Flag language={language} />
        <span className="language-code">{language.toUpperCase()}</span>
        <svg className="language-chevron" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </Button>
      {/* Always in the page (hidden while closed), so the links are there for crawlers. */}
      <ul id={listId} className="language-menu" hidden={!open} onKeyDown={onListKeyDown}>
        {LANGUAGES.map((code) => (
          <li key={code}>
            <Link
              href={pathFor(route ?? 'home', code)}
              hrefLang={LANGUAGE_TAGS[code]}
              lang={LANGUAGE_TAGS[code]}
              aria-current={code === language ? 'true' : undefined}
              onClick={() => {
                rememberLanguage(code);
                setOpen(false);
              }}
            >
              <Flag language={code} />
              <span>{LANGUAGE_NAMES[code]}</span>
              <svg className="language-check" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
