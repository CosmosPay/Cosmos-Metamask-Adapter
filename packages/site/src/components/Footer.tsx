import { BrandSvg } from '@/components/BrandSvg';
import { Link } from '@/components/Link';
import { SnapText } from '@/components/SnapText';
import { type MessageKey, useI18n } from '@/i18n';

const PAGES: { href: string; label: MessageKey }[] = [
  { href: '/privacy/', label: 'footer.privacy' },
  { href: '/terms/', label: 'footer.terms' },
  { href: '/credits/', label: 'footer.credits' },
];

/** Site footer: the wordmark, the privacy / terms / credits pages and the copyright line. */
export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <Link className="wordmark" href="/">
        <BrandSvg name="stellarSnap" label="Stellar Snap" />
      </Link>
      <nav className="footer-links" aria-label={t('footer.legal')}>
        {PAGES.map((page) => (
          <Link key={page.href} href={page.href}>
            {t(page.label)}
          </Link>
        ))}
      </nav>
      <p>
        <SnapText text={t('footer.copyright', { year: new Date().getFullYear() })} />
      </p>
    </footer>
  );
}
