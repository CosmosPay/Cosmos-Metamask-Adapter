import { BrandSvg } from '@/components/BrandSvg';
import { ConnectButton } from '@/components/ConnectButton';
import { SnapHomePreview } from '@/components/SnapHomePreview';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { AccountSnapshot } from '@/types';

const COSMOS_WALLET_URL = 'https://cosmospay.lat';

const NAV_LINKS = [
  { label: 'Stellar', href: 'https://stellar.org' },
  { label: 'SEP-43', href: 'https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0043.md' },
  { label: 'MetaMask Snaps', href: 'https://metamask.io/snaps/' },
];

const SUPPORTED = ['MetaMask', 'Stellar', 'Soroban'];

const STATS = [
  { value: '3', label: 'Redes Stellar' },
  { value: 'SEP-43', label: 'API estándar' },
  { value: '0', label: 'Extensiones extra' },
];

type HeaderProps = {
  connected: boolean;
  account: AccountSnapshot | null;
  onConnect: () => Promise<unknown>;
};

/** Landing header: nav plus the connect hero. The demo sections live below it. */
export function Header({ connected, account, onConnect }: HeaderProps) {
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
          <ConnectButton className="nav-connect" connected={connected} account={account} onConnect={onConnect} />
          <ThemeToggle />
        </div>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
            </svg>
            Compatible con Freighter
          </p>
          <h1>
            Tu cuenta <strong>Stellar</strong>, <strong>dentro</strong> de <mark>MetaMask.</mark>
          </h1>
          <p className="hero-lead">
            Mainnet con el soporte oficial de MetaMask; testnet y futurenet con el <strong>Stellar Snap</strong>.
          </p>
          <a className="hero-cta" href={COSMOS_WALLET_URL} target="_blank" rel="noreferrer">
            Obtener Cosmos Wallet
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12h15M13 6l6 6-6 6" />
            </svg>
          </a>
          <p className="hero-support">
            Funciona con
            {SUPPORTED.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </p>
        </div>

        <SnapHomePreview account={account} />

        <dl className="hero-stats">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </header>
  );
}
