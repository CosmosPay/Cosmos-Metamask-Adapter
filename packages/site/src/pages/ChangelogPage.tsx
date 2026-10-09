import { useState } from 'react';
import { Button } from '@/components/Button';
import { ExternalLink } from '@/components/ExternalLink';
import { Footer } from '@/components/Footer';
import { Link } from '@/components/Link';
import { RichText } from '@/components/RichText';
import { SiteHeader } from '@/components/SiteHeader';
import { type ChangelogPackage, type PackageRelease, RELEASES, RELEASES_FEED } from '@/content/changelog';
import { revealStep, useReveal } from '@/hooks/useReveal';
import { type MessageKey, useI18n } from '@/i18n';
import type { ChangeBlock, ChangeKind } from '@/lib/changelog';
import { longDate } from '@/lib/date';
import { pathFor } from '@/lib/router';

const KIND_LABELS: Record<ChangeKind, MessageKey> = {
  major: 'changelog.major',
  minor: 'changelog.minor',
  patch: 'changelog.patch',
};

type Filter = ChangelogPackage | 'all';
const FILTERS: Filter[] = ['all', 'snap', 'adapter'];

/** The newest release of each package (RELEASES is newest first): it gets the "Latest" tag. */
const LATEST = new Set(
  (['snap', 'adapter'] as const).map((pkg) => RELEASES.find((release) => release.package === pkg)?.id),
);

/** The releases on screen when the page opens enter in turn after the heading; later ones as they scroll in. */
const OPENING_STEPS = 5;

const Arrow = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
);

function Blocks({ blocks }: { blocks: ChangeBlock[] }) {
  return blocks.map((block, index) =>
    typeof block === 'string' ? (
      <p key={index}>
        <RichText text={block} />
      </p>
    ) : (
      <ul key={index}>
        {block.map((item, itemIndex) => (
          <li key={itemIndex}>
            <RichText text={item} />
          </li>
        ))}
      </ul>
    ),
  );
}

/**
 * One version of a package: its name and number, date, changes grouped by
 * the size of the bump, and where it was published. The changes are in
 * English (`textLang` on other pages); their group names in the reader's language.
 */
function ReleaseCard({ release, name, textLang }: { release: PackageRelease; name: string; textLang?: string }) {
  const { language, t } = useI18n();
  const titleId = `${release.id}-title`;
  return (
    <article className="release-card" aria-labelledby={titleId}>
      <header className="release-header">
        <h2 id={titleId}>
          {name} <span className="release-version">{release.version}</span>
        </h2>
        {LATEST.has(release.id) ? <span className="release-latest">{t('changelog.latest')}</span> : null}
        {release.date ? (
          // Node and the browser may word the date slightly differently.
          <time className="release-date" dateTime={release.date} suppressHydrationWarning>
            {longDate(release.date, language)}
          </time>
        ) : null}
      </header>
      {release.notes.length > 0 ? (
        <div className="release-notes" lang={textLang}>
          {release.notes.map((note, index) => (
            <p key={index}>
              <RichText text={note} />
            </p>
          ))}
        </div>
      ) : null}
      {release.groups.map((group) => (
        <section key={group.heading} className={`release-group release-${group.kind ?? 'other'}`}>
          <h3>{group.kind ? t(KIND_LABELS[group.kind]) : group.heading}</h3>
          <ul className="release-changes" lang={textLang}>
            {group.changes.map((change, index) => (
              <li key={index}>
                <RichText text={change.text} />
                {change.details.length > 0 ? <Blocks blocks={change.details} /> : null}
              </li>
            ))}
          </ul>
        </section>
      ))}
      <p className="release-links">
        <ExternalLink className="text-link" href={release.npmUrl}>
          {t('changelog.npm')}
          <Arrow />
        </ExternalLink>
        <ExternalLink className="text-link" href={release.releaseUrl}>
          {t('changelog.github')}
          <Arrow />
        </ExternalLink>
      </p>
    </article>
  );
}

/**
 * The changelog: every release of the snap and the adapter, newest first,
 * read from their CHANGELOG.md files (content/changelog.ts), with a filter by
 * package. Each release has its own anchor (`#snap-0.2.0`). Release notes are
 * written in English, which other languages say and mark.
 */
export function ChangelogPage() {
  const { language, t } = useI18n();
  const [filter, setFilter] = useState<Filter>('all');
  useReveal();
  const textLang = language === 'en' ? undefined : 'en';
  const packageName = (pkg: ChangelogPackage) => (pkg === 'snap' ? 'Stellar Snap' : t('changelog.adapter'));
  const filterLabel = (option: Filter) => (option === 'all' ? t('changelog.all') : packageName(option));

  return (
    <>
      <SiteHeader />
      <main id="main" className="changelog-main" tabIndex={-1}>
        <nav className="breadcrumb" aria-label={t('breadcrumb.label')}>
          <ol>
            <li>
              <Link href={pathFor('home', language)}>{t('breadcrumb.home')}</Link>
            </li>
            <li aria-current="page">{t('nav.changelog')}</li>
          </ol>
        </nav>
        <div className="changelog">
          <header className="changelog-header">
            <p className="section-eyebrow reveal" style={revealStep(0)}>
              {t('changelog.eyebrow')}
            </p>
            {/* tabIndex -1: client-side navigation moves focus here (usePageFocus). */}
            <h1 className="reveal" style={revealStep(1)} tabIndex={-1}>
              <RichText text={t('changelog.title')} />
            </h1>
            <p className="section-lead reveal" style={revealStep(2)}>
              <RichText text={t('changelog.lead')} />
              {textLang ? ` ${t('changelog.englishNote')}` : null}
            </p>
            <p className="changelog-feed reveal" style={revealStep(3)}>
              <ExternalLink className="text-link" href={RELEASES_FEED}>
                {t('changelog.feed')}
                <Arrow />
              </ExternalLink>
            </p>
          </header>

          {/* Without JavaScript every release shows, as "Everything" says. */}
          <div
            className="changelog-filter reveal"
            style={revealStep(4)}
            role="group"
            aria-label={t('changelog.filter')}
          >
            {FILTERS.map((option) => (
              <Button key={option} ink aria-pressed={filter === option} onClick={() => setFilter(option)}>
                {filterLabel(option)}
              </Button>
            ))}
          </div>

          {/* role="list": Safari drops list semantics from unstyled lists. */}
          <ol className="releases" role="list">
            {RELEASES.map((release, index) => (
              <li
                key={release.id}
                id={release.id}
                className="release reveal"
                style={revealStep(Math.min(OPENING_STEPS + index, OPENING_STEPS + 3))}
                hidden={filter !== 'all' && filter !== release.package}
              >
                <ReleaseCard release={release} name={packageName(release.package)} textLang={textLang} />
              </li>
            ))}
          </ol>
        </div>
      </main>
      <Footer />
    </>
  );
}
