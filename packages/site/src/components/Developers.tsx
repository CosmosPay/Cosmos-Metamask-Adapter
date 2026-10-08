import { ExternalLink } from '@/components/ExternalLink';
import { RichText } from '@/components/RichText';
import { SectionHeading } from '@/components/SectionHeading';
import { REPO_URL } from '@/config';
import { DEVELOPER_EXAMPLE, DEVELOPER_POINTS } from '@/content/home';
import { useI18n } from '@/i18n';

/** For dApp builders: the adapter, what it's compatible with, an example and the repository. */
export function Developers() {
  const { t } = useI18n();
  return (
    <section className="section developers" id="developers" aria-labelledby="developers-title">
      <div className="developers-copy">
        <SectionHeading id="developers-title" eyebrow="dev.eyebrow" title="dev.title" lead="dev.lead" />
        <ul className="developer-points">
          {DEVELOPER_POINTS.map((point) => (
            <li key={point}>
              <RichText text={t(point)} />
            </li>
          ))}
        </ul>
        <ExternalLink className="text-link" href={REPO_URL}>
          {t('dev.repo')}
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 12h15M13 6l6 6-6 6" />
          </svg>
        </ExternalLink>
      </div>
      <figure className="code-sample">
        <figcaption>{t('dev.example')}</figcaption>
        {/* Focusable so keyboard users can scroll it sideways on narrow screens. */}
        <pre tabIndex={0} translate="no">
          <code>{DEVELOPER_EXAMPLE}</code>
        </pre>
      </figure>
    </section>
  );
}
