import type { ReactNode } from 'react';
import { BrandSvg } from '@/components/BrandSvg';
import { LanguageSelect } from '@/components/LanguageSelect';
import { ThemeToggle } from '@/components/ThemeToggle';
import { COSMOS_WALLET_URL, REPO_URL } from '@/config';
import { useI18n } from '@/i18n';

/** Product names, the same in every language. */
const LINKS = [
  { label: 'Cosmos Wallet', href: COSMOS_WALLET_URL },
  { label: 'GitHub', href: REPO_URL },
];

/**
 * The top bar every page shares: the wordmark (home link), the outside links,
 * the language and theme controls. `children` sit before the theme toggle
 * (the home page's connect button).
 */
export function SiteNav({ children }: { children?: ReactNode }) {
  const { t } = useI18n();
  return (
    <nav className="nav">
      <a className="brand wordmark" href="/">
        <BrandSvg name="stellarSnap" label="Stellar Snap" />
      </a>
      <ul className="nav-links" aria-label={t('nav.links')}>
        {LINKS.map((link) => (
          <li key={link.label}>
            <a href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <div className="nav-end">
        <LanguageSelect />
        {children}
        <ThemeToggle />
      </div>
    </nav>
  );
}
