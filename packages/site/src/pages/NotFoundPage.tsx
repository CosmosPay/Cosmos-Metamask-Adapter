import { Footer } from '@/components/Footer';
import { Link } from '@/components/Link';
import { SiteHeader } from '@/components/SiteHeader';
import { useI18n } from '@/i18n';
import { pathFor } from '@/lib/router';

/**
 * A path that isn't a page. Prerendered as 404.html, which static hosts serve
 * with a 404 status, so it never stands in for the home page in search results.
 */
export function NotFoundPage() {
  const { language, t } = useI18n();
  return (
    <>
      <SiteHeader />
      <main id="main" className="doc-main" tabIndex={-1}>
        <div className="doc not-found">
          {/* tabIndex -1: client-side navigation moves focus here (usePageFocus). */}
          <h1 tabIndex={-1}>{t('notFound.title')}</h1>
          <p className="doc-intro">{t('notFound.text')}</p>
          <p>
            <Link className="text-link" href={pathFor('home', language)}>
              {t('notFound.home')}
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
