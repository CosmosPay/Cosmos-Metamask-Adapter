import type { ReactNode } from 'react';
import { BrandSvg } from '@/components/BrandSvg';
import { DONATE_SECTION, HAS_DONATIONS } from '@/components/Donations';
import { ExternalLink } from '@/components/ExternalLink';
import { LanguageSelect } from '@/components/LanguageSelect';
import { Link } from '@/components/Link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { COSMOS_WALLET_URL, REPO_URL } from '@/config';
import { revealStep } from '@/hooks/useReveal';
import { useI18n } from '@/i18n';
import { pathFor, useLocation } from '@/lib/router';

/** Product names, the same in every language. */
const LINKS = [
  { label: 'Cosmos Wallet', href: COSMOS_WALLET_URL },
  { label: 'GitHub', href: REPO_URL },
];

/**
 * The banner every page shares: the wordmark (home link), the outside links
 * and the home page's donations section (when there is one), the language and
 * theme controls. `children` sit before the theme toggle (the home page's
 * connect button). Its three parts drop in from above, left to right.
 */
export function SiteHeader({ children }: { children?: ReactNode }) {
  const { language, t } = useI18n();
  const { route } = useLocation();
  const home = pathFor('home', language);
  return (
    <header className="site-header">
      <div className="nav">
        <Link
          className="brand wordmark reveal reveal-drop"
          style={revealStep(0)}
          href={home}
          aria-current={route === 'home' ? 'page' : undefined}
        >
          <BrandSvg name="stellarSnap" label="Stellar Snap" />
        </Link>
        <nav className="nav-links reveal reveal-drop" style={revealStep(1)} aria-label={t('nav.main')}>
          <ul>
            {LINKS.map((link) => (
              <li key={link.label}>
                <ExternalLink href={link.href}>{link.label}</ExternalLink>
              </li>
            ))}
            {HAS_DONATIONS ? (
              <li>
                <Link href={`${home}#${DONATE_SECTION}`}>{t('nav.donate')}</Link>
              </li>
            ) : null}
          </ul>
        </nav>
        <div className="nav-end reveal reveal-drop" style={revealStep(2)}>
          <LanguageSelect />
          {children}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
