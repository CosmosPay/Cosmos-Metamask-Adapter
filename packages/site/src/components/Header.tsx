import { ConnectButton } from '@/components/ConnectButton';
import { WalletPreview } from '@/components/WalletPreview';
import type { AccountSnapshot } from '@/types';

const SEP43_URL = 'https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0043.md';

const NAV_LINKS = [
  { label: 'Stellar', href: 'https://stellar.org' },
  { label: 'SEP-43', href: SEP43_URL },
  { label: 'MetaMask Snaps', href: 'https://metamask.io/snaps/' },
];

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

function Sparkle() {
  return (
    <svg className="sparkle" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0C12.6 7.2 16.8 11.4 24 12C16.8 12.6 12.6 16.8 12 24C11.4 16.8 7.2 12.6 0 12C7.2 11.4 11.4 7.2 12 0Z" />
    </svg>
  );
}

/** Landing header: nav plus the connect hero. The demo sections live below it. */
export function Header({ connected, account, onConnect }: HeaderProps) {
  return (
    <header className="landing">
      <nav className="nav">
        <a className="brand" href="/">
          Cosmos <span>Pay</span>
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
        <ConnectButton className="nav-connect" connected={connected} account={account} onConnect={onConnect} />
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <Sparkle /> Compatible con Freighter
          </p>
          <h1>
            Tu cuenta <strong>Stellar</strong>, dentro de <mark>MetaMask</mark> <Sparkle />
          </h1>
          <p className="hero-lead">
            Mainnet con el soporte oficial de MetaMask; testnet y futurenet con el Stellar Snap. Una sola API para tu
            dApp.
          </p>
          <div className="hero-actions">
            <ConnectButton className="hero-connect" connected={connected} account={account} onConnect={onConnect} />
            <a className="hero-link" href={SEP43_URL} target="_blank" rel="noreferrer">
              Qué es SEP-43 <span aria-hidden="true">→</span>
            </a>
          </div>
          <p className="hero-support">
            Funciona con <span>MetaMask</span>
            <span>Stellar</span>
            <span>Soroban</span>
          </p>
        </div>

        <svg className="hero-scribble" viewBox="0 0 220 160" aria-hidden="true">
          <path d="M8 140 C60 150 120 130 130 90 C138 58 100 46 92 70 C84 96 140 110 176 72 C196 50 204 30 210 12" />
          <path d="M198 18 L210 12 L212 26" />
        </svg>

        <WalletPreview account={account} />

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
