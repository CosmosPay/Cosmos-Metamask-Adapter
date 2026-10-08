import { type KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { Flag } from '@/components/Flag';
import { type Language, LANGUAGE_NAMES, LANGUAGES, setLanguage, useI18n } from '@/i18n';

/**
 * Language dropdown for the nav, like cosmospay.lat's. The button shows the
 * flag and the short code (ES / EN / …) so it fits beside the connect button
 * on phones; the list shows each language in its own words.
 *
 * It's a listbox: arrows, Home and End move, Enter or Space picks, Escape
 * closes and returns focus to the button.
 */
export function LanguageSelect() {
  const { language, t } = useI18n();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const listId = useId();

  // Opening focuses the current language; a press anywhere outside closes the list.
  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus();
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

  const choose = (code: Language) => {
    setLanguage(code);
    close();
  };

  const onTriggerKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
    }
  };

  const onListKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const options = [...event.currentTarget.querySelectorAll<HTMLElement>('[role="option"]')];
    const index = options.findIndex((option) => option === document.activeElement);
    const focus = (next: number) => options[(next + options.length) % options.length]?.focus();
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
        focus(options.length - 1);
        break;
      case 'Enter':
      case ' ': {
        // Options are rendered in LANGUAGES order.
        const code = LANGUAGES[index];
        if (code) choose(code);
        break;
      }
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
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
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
      {open && (
        <ul
          id={listId}
          className="language-menu"
          role="listbox"
          aria-label={t('nav.language')}
          onKeyDown={onListKeyDown}
        >
          {LANGUAGES.map((code) => (
            <li
              key={code}
              role="option"
              aria-selected={code === language}
              tabIndex={-1}
              lang={code}
              onClick={() => choose(code)}
            >
              <Flag language={code} />
              <span>{LANGUAGE_NAMES[code]}</span>
              <svg className="language-check" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m5 12.5 4.5 4.5L19 7.5" />
              </svg>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
