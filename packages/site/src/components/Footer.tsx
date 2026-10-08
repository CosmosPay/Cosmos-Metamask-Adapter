import { BrandSvg } from '@/components/BrandSvg';
import { GitHubIcon, InstagramIcon, XIcon } from '@/components/icons/SocialIcons';
import { Link } from '@/components/Link';
import { SnapText } from '@/components/SnapText';
import { COSMOS_GITHUB_URL, COSMOS_INSTAGRAM_URL, COSMOS_X_URL } from '@/config';
import { type MessageKey, useI18n } from '@/i18n';

const PAGES: { href: string; label: MessageKey }[] = [
  { href: '/privacy/', label: 'footer.privacy' },
  { href: '/terms/', label: 'footer.terms' },
  { href: '/credits/', label: 'footer.credits' },
  { href: '/contact/', label: 'footer.contact' },
];

/** Cosmos's accounts; network names read the same in every language. */
const SOCIALS = [
  { name: 'X', href: COSMOS_X_URL, Icon: XIcon },
  { name: 'Instagram', href: COSMOS_INSTAGRAM_URL, Icon: InstagramIcon },
  { name: 'GitHub', href: COSMOS_GITHUB_URL, Icon: GitHubIcon },
];

/** Site footer: the wordmark, the site's pages, Cosmos's social accounts and the copyright line. */
export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <Link className="wordmark footer-brand" href="/">
        <BrandSvg name="stellarSnap" label="Stellar Snap" />
      </Link>
      <nav className="footer-links" aria-label={t('footer.legal')}>
        {PAGES.map((page) => (
          <Link key={page.href} href={page.href}>
            {t(page.label)}
          </Link>
        ))}
      </nav>
      <ul className="footer-social" aria-label={t('footer.social')}>
        {SOCIALS.map(({ name, href, Icon }) => (
          <li key={name}>
            <a href={href} target="_blank" rel="noreferrer" aria-label={`Cosmos · ${name}`} title={name}>
              <Icon />
            </a>
          </li>
        ))}
      </ul>
      <p className="footer-copyright">
        <SnapText text={t('footer.copyright', { year: new Date().getFullYear() })} />
      </p>
    </footer>
  );
}
