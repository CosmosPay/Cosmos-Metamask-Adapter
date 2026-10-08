import { Footer } from '@/components/Footer';
import { Link } from '@/components/Link';
import { RichText } from '@/components/RichText';
import { SiteHeader } from '@/components/SiteHeader';
import { type DocRoute, docLanguage, DOCUMENTS } from '@/content';
import type { Block } from '@/content/types';
import { type Language, LANGUAGE_TAGS, useI18n } from '@/i18n';
import { pathFor } from '@/lib/router';

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
 * A text page (privacy, terms, credits, contact) in the site's frame: the
 * banner, a breadcrumb, the document, the footer. Spanish readers get the
 * Spanish text, everyone else the English one, marked with its language and a
 * note when that isn't theirs.
 */
export function DocumentPage({ route }: { route: DocRoute }) {
  const { language, t } = useI18n();
  const docs = DOCUMENTS[route];
  const textLanguage = docLanguage(language);
  const doc = docs[textLanguage];
  const translated = textLanguage !== language;
  /** The page's own language, for its parts inside the English text. */
  const pageLang = translated ? LANGUAGE_TAGS[language] : undefined;
  const [updatedBefore, updatedAfter = ''] = t('doc.updated').split('{date}');

  return (
    <>
      <SiteHeader />
      <main id="main" className="doc-main" tabIndex={-1}>
        <nav className="breadcrumb" aria-label={t('breadcrumb.label')}>
          <ol>
            <li>
              <Link href={pathFor('home', language)}>{t('breadcrumb.home')}</Link>
            </li>
            <li aria-current="page" lang={translated ? textLanguage : undefined}>
              {doc.title}
            </li>
          </ol>
        </nav>
        <article className="doc" lang={textLanguage}>
          {/* tabIndex -1: client-side navigation moves focus here (usePageFocus). */}
          <h1 tabIndex={-1}>{doc.title}</h1>
          {docs.updated ? (
            <p className="doc-meta" lang={pageLang}>
              {updatedBefore}
              {/* Node and the browser may word the date slightly differently. */}
              <time dateTime={docs.updated} suppressHydrationWarning>
                {longDate(docs.updated, language)}
              </time>
              {updatedAfter}
            </p>
          ) : null}
          {translated ? (
            <p className="doc-meta" lang={pageLang}>
              {t('doc.translationNote')}
            </p>
          ) : null}
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
