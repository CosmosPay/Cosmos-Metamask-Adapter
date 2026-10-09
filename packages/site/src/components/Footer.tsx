import { askConsentAgain } from '@/analytics/consent';
import { BrandSvg } from '@/components/BrandSvg';
import { ExternalLink } from '@/components/ExternalLink';
import { GitHubIcon, InstagramIcon, XIcon } from '@/components/icons/SocialIcons';
import { Link } from '@/components/Link';
import { SnapText } from '@/components/SnapText';
import { COSMOS_GITHUB_URL, COSMOS_INSTAGRAM_URL, COSMOS_X_URL, GA_MEASUREMENT_ID } from '@/config';
import { type MessageKey, useI18n } from '@/i18n';
import { pathFor, type Route, useLocation } from '@/lib/router';

const PAGES: { route: Route; label: MessageKey }[] = [
  { route: 'changelog', label: 'nav.changelog' },
  { route: 'privacy', label: 'footer.privacy' },
  { route: 'terms', label: 'footer.terms' },
  { route: 'credits', label: 'footer.credits' },
  { route: 'contact', label: 'footer.contact' },
];

/** Cosmos's accounts; network names read the same in every language. */
const SOCIALS = [
  { name: 'X', href: COSMOS_X_URL, Icon: XIcon },
  { name: 'Instagram', href: COSMOS_INSTAGRAM_URL, Icon: InstagramIcon },
  { name: 'GitHub', href: COSMOS_GITHUB_URL, Icon: GitHubIcon },
];

/** Site footer: the wordmark, the site's pages, Cosmos's social accounts and the copyright line. */
export function Footer() {
  const { language, t } = useI18n();
  const { route } = useLocation();
  return (
    <footer className="footer reveal">
      <Link className="wordmark footer-brand" href={pathFor('home', language)}>
        <BrandSvg name="stellarSnap" label="Stellar Snap" />
      </Link>
      <nav className="footer-links" aria-label={t('footer.pages')}>
        <ul>
          {PAGES.map((page) => (
            <li key={page.route}>
              <Link href={pathFor(page.route, language)} aria-current={route === page.route ? 'page' : undefined}>
                {t(page.label)}
              </Link>
            </li>
          ))}
          {/* With analytics configured, the consent choice can be changed from any page. */}
          {GA_MEASUREMENT_ID ? (
            <li>
              <button type="button" className="footer-button" onClick={askConsentAgain}>
                {t('footer.analytics')}
              </button>
            </li>
          ) : null}
        </ul>
      </nav>
      {/* Each link names its network, so the list needs no label of its own. */}
      <ul className="footer-social">
        {SOCIALS.map(({ name, href, Icon }) => (
          <li key={name}>
            <ExternalLink href={href} title={name}>
              <Icon />
              <span className="visually-hidden">{t('footer.socialLink', { network: name })}</span>
            </ExternalLink>
          </li>
        ))}
      </ul>
      {/* The year is the build's until the page hydrates; it only differs right after New Year. */}
      <p className="footer-copyright" suppressHydrationWarning>
        <SnapText text={t('footer.copyright', { year: new Date().getFullYear() })} />
      </p>
    </footer>
  );
}
