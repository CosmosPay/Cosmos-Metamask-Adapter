import { BrandSvg } from '@/components/BrandSvg';
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
      <a className="wordmark" href="/">
        <BrandSvg name="stellarSnap" label="Stellar Snap" />
      </a>
      <nav className="footer-links" aria-label={t('footer.legal')}>
        {PAGES.map((page) => (
          <a key={page.href} href={page.href}>
            {t(page.label)}
          </a>
        ))}
      </nav>
      <p>
        <SnapText text={t('footer.copyright', { year: new Date().getFullYear() })} />
      </p>
    </footer>
  );
}
