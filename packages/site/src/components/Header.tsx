import type { CSSProperties } from 'react';
import { BrandSvg } from '@/components/BrandSvg';
import { ConnectButton } from '@/components/ConnectButton';
import { InstallSnapButton } from '@/components/InstallSnapButton';
import { LanguageSelect } from '@/components/LanguageSelect';
import { RichText } from '@/components/RichText';
import { SnapHomePreview } from '@/components/SnapHomePreview';
import { ThemeToggle } from '@/components/ThemeToggle';
import { type MessageKey, useI18n } from '@/i18n';
import type { AccountSnapshot } from '@/types';

const COSMOS_WALLET_URL = 'https://cosmospay.lat';

const NAV_LINKS = [
  { label: 'Stellar', href: 'https://stellar.org' },
  { label: 'SEP-43', href: 'https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0043.md' },
  { label: 'MetaMask Snaps', href: 'https://metamask.io/snaps/' },
];

const SUPPORTED = ['MetaMask', 'Stellar', 'Soroban'];

const STATS: { value: string; label: MessageKey }[] = [
  { value: '3', label: 'stats.networks' },
  { value: 'SEP-43', label: 'stats.api' },
  { value: '0', label: 'stats.extensions' },
];

/** Position in the entrance sequence; the CSS turns it into a delay. */
const step = (index: number) => ({ '--step': index }) as CSSProperties;

type HeaderProps = {
  connected: boolean;
  account: AccountSnapshot | null;
  onConnect: () => Promise<unknown>;
};

/** Landing header: nav plus the connect hero. The demo sections live below it. */
export function Header({ connected, account, onConnect }: HeaderProps) {
  const { t } = useI18n();
  return (
    <header className="landing">
      <nav className="nav">
        <a className="brand" href="/">
          <BrandSvg name="cosmosPay" label="Cosmos Pay" />
        </a>
        <ul className="nav-links">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="nav-end">
          <LanguageSelect />
          <ConnectButton className="nav-connect" connected={connected} account={account} onConnect={onConnect} />
          <ThemeToggle />
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow rise" style={step(0)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
            </svg>
            {t('hero.eyebrow')}
          </p>
          <h1 className="rise" style={step(1)}>
            <RichText text={t('hero.title')} />
          </h1>
          <p className="hero-lead rise" style={step(2)}>
            <RichText text={t('hero.lead')} />
          </p>
          <div className="hero-actions rise" style={step(3)}>
            <InstallSnapButton installed={connected} onInstall={onConnect} />
            <a className="hero-cta" href={COSMOS_WALLET_URL} target="_blank" rel="noreferrer">
              {t('hero.cta')}
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 12h15M13 6l6 6-6 6" />
              </svg>
            </a>
          </div>
          <p className="hero-support rise" style={step(4)}>
            {t('hero.supported')}
            {SUPPORTED.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </p>
        </div>

        <div className="rise" style={step(2)}>
          <SnapHomePreview account={account} />
        </div>

        <dl className="hero-stats">
          {STATS.map((stat, index) => (
            <div key={stat.label} className="rise" style={step(3 + index)}>
              <dt>{t(stat.label)}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </header>
  );
}
