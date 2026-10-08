import type { ReactNode } from 'react';
import { BrandSvg } from '@/components/BrandSvg';
import { ExternalLink } from '@/components/ExternalLink';
import { LanguageSelect } from '@/components/LanguageSelect';
import { Link } from '@/components/Link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { COSMOS_WALLET_URL, REPO_URL } from '@/config';
import { useI18n } from '@/i18n';
import { pathFor, useLocation } from '@/lib/router';

/** Product names, the same in every language. */
const LINKS = [
  { label: 'Cosmos Wallet', href: COSMOS_WALLET_URL },
  { label: 'GitHub', href: REPO_URL },
];

/**
 * The banner every page shares: the wordmark (home link), the outside links,
 * the language and theme controls. `children` sit before the theme toggle
 * (the home page's connect button).
 */
export function SiteHeader({ children }: { children?: ReactNode }) {
  const { language, t } = useI18n();
  const { route } = useLocation();
  return (
    <header className="site-header">
      <div className="nav">
        <Link
          className="brand wordmark"
          href={pathFor('home', language)}
          aria-current={route === 'home' ? 'page' : undefined}
        >
          <BrandSvg name="stellarSnap" label="Stellar Snap" />
        </Link>
        <nav className="nav-links" aria-label={t('nav.main')}>
          <ul>
            {LINKS.map((link) => (
              <li key={link.label}>
                <ExternalLink href={link.href}>{link.label}</ExternalLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-end">
          <LanguageSelect />
          {children}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
