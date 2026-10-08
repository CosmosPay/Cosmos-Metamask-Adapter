import { useEffect } from 'react';
import { Footer } from '@/components/Footer';
import { RichText } from '@/components/RichText';
import { SiteNav } from '@/components/SiteNav';
import type { Block, DocSet } from '@/content/types';
import { type Language, useI18n } from '@/i18n';

function BlockView({ block }: { block: Block }) {
  if (typeof block === 'string') {
    return (
      <p>
        <RichText text={block} />
      </p>
    );
  }
  return (
    <ul>
      {block.map((item) => (
        <li key={item}>
          <RichText text={item} />
        </li>
      ))}
    </ul>
  );
}

/** An ISO date in the reader's language; noon keeps it on the same day in every time zone. */
const longDate = (iso: string, language: Language) =>
  new Intl.DateTimeFormat(language, { dateStyle: 'long' }).format(new Date(`${iso}T12:00:00`));

/**
 * A text page (privacy, terms, credits) in the site's frame: nav, the
 * document, footer. Spanish readers get the Spanish text, everyone else the
 * English one, with a note when that isn't their language.
 */
export function DocumentPage({ docs }: { docs: DocSet }) {
  const { language, t } = useI18n();
  const docLanguage = language === 'es' ? 'es' : 'en';
  const doc = docs[docLanguage];

  useEffect(() => {
    document.title = `${doc.title} · Stellar Snap`;
  }, [doc.title]);

  return (
    <>
      <main>
        <header className="doc-header">
          <SiteNav />
        </header>
        <article className="doc" lang={docLanguage}>
          <a className="doc-home" href="/">
            {t('doc.home')}
          </a>
          <h1>{doc.title}</h1>
          {docs.updated ? (
            <p className="doc-meta">{t('doc.updated', { date: longDate(docs.updated, language) })}</p>
          ) : null}
          {docLanguage === language ? null : <p className="doc-meta">{t('doc.translationNote')}</p>}
          <div className="doc-intro">
            {doc.intro.map((block, index) => (
              <BlockView key={index} block={block} />
            ))}
          </div>
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.blocks.map((block, index) => (
                <BlockView key={index} block={block} />
              ))}
            </section>
          ))}
        </article>
      </main>
      <Footer />
    </>
  );
}
