import snapIcon from '@snap/images/icon.svg?raw';
import { NETWORKS } from '@snap/src/config/networks';
import { formatAmount } from '@snap/src/domain/amounts';
import {
  actionTile,
  assetIcon,
  fundIllustration,
  identicon,
  networkPill,
  pillButton,
  textLabel,
  tokenInfo,
  type ActionIcon,
} from '@snap/src/ui/graphics/icons';
import es from '@snap/locales/es.json';
import manifest from '@snap/snap.manifest.json';
import { type Theme, useTheme } from '@/lib/theme';
import type { AccountSnapshot, StellarNetwork } from '@/types';

/** First SEP-0005 test-vector account: what a fresh snap install shows. */
const SAMPLE_ADDRESS = 'GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6';

/** The snap's `t()`, fixed to Spanish like the rest of the site. */
function t(key: string, values: Record<string, string> = {}): string {
  const template = es.messages[key]?.message ?? key;
  return template.replace(/\{(\w+)\}/gu, (match, name: string) => values[name] ?? match);
}

/** The snap's `localizeNumber` for Spanish: `1,234.5` → `1.234,5`. */
const localizeNumber = (value: string) => value.replace(/[,.]/gu, (char) => (char === ',' ? '.' : ','));

/** The snap's `shorten`: first and last 6 characters. */
const shorten = (value: string) => (value.length > 16 ? `${value.slice(0, 6)}…${value.slice(-6)}` : value);

const svgUrl = (markup: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;

/**
 * The snap's art switches colors with `@media (prefers-color-scheme:dark)`,
 * i.e. the OS scheme. Here it must follow the site's toggle instead, so the
 * query is pinned: always on in dark, never in light.
 */
const pinScheme = (markup: string, theme: Theme) =>
  markup.replaceAll('@media (prefers-color-scheme:dark)', theme === 'dark' ? '@media all' : '@media not all');

function Art({ svg, className }: { svg: string; className?: string }) {
  const theme = useTheme();
  return <img className={className} src={svgUrl(pinScheme(svg, theme))} alt="" />;
}

/** Same tile width the snap uses for its four-tile row. */
const TILE_WIDTH = 78;

type Tile = { icon: ActionIcon; label: string; disabled?: boolean };

type HomeState = {
  name: string;
  address: string;
  network: StellarNetwork;
  /** Native balance; null while the account isn't activated. */
  xlm: string | null;
};

/**
 * The connected snap account, or a fresh install (account 1, unfunded, testnet)
 * when there's none to show: mainnet goes through MetaMask's own Stellar UI.
 */
function homeState(account: AccountSnapshot | null): HomeState {
  if (account?.backend !== 'snap') {
    return { name: t('accounts.name', { n: '1' }), address: SAMPLE_ADDRESS, network: 'testnet', xlm: null };
  }
  return {
    name: account.accountName ?? t('accounts.name', { n: '1' }),
    address: account.address,
    network: account.network,
    xlm: account.balance.kind === 'funded' ? account.balance.xlm : null,
  };
}

/**
 * The snap's home page as MetaMask renders it (`home/screens/MainScreen.tsx`):
 * same order, the snap's own SVG art and its Spanish strings. Decorative; the
 * account card below carries the same data accessibly.
 */
export function SnapHomePreview({ account }: { account: AccountSnapshot | null }) {
  const home = homeState(account);
  const network = NETWORKS[home.network];
  const funded = home.xlm !== null;
  const balance = `${localizeNumber(formatAmount(home.xlm ?? '0'))} XLM`;

  const tiles: Tile[] = funded
    ? [
        { icon: 'send', label: t('home.send') },
        // Cosmos Pay doesn't serve futurenet, so the snap disables swaps there.
        { icon: 'swap', label: t('swap.tile'), disabled: home.network === 'futurenet' },
        { icon: 'receive', label: t('home.receive') },
        { icon: 'sign', label: t('home.sign') },
      ]
    : [
        { icon: 'fund', label: t('home.fund') },
        { icon: 'send', label: t('home.send'), disabled: true },
        { icon: 'receive', label: t('home.receive') },
        { icon: 'sign', label: t('home.sign') },
      ];

  return (
    <div className="preview" aria-hidden="true">
      <div className="preview-back" />
      <div className="mm-window">
        <div className="mm-topbar">
          <svg className="mm-glyph" viewBox="0 0 24 24">
            <path d="M15 5l-7 7 7 7" />
          </svg>
          <span className="mm-snap">
            <Art svg={snapIcon} />
            {manifest.proposedName}
          </span>
          <svg className="mm-glyph" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="1.4" />
            <circle cx="12" cy="12" r="1.4" />
            <circle cx="12" cy="19" r="1.4" />
          </svg>
        </div>

        <div className="mm-body">
          <div className="mm-account">
            <div>
              <Art svg={textLabel(home.name, { size: 18, chevron: true })} />
              <div className="mm-address">
                <Art svg={identicon(home.address, 16)} />
                {shorten(home.address)}
              </div>
            </div>
            <svg className="mm-glyph" viewBox="0 0 24 24">
              <path d="M20 12a8 8 0 1 1-2.3-5.6M20 4v4.5h-4.5" />
            </svg>
          </div>

          <p className="mm-headline">{balance}</p>

          {funded ? null : (
            <div className="mm-section">
              <Art svg={fundIllustration()} />
              <p className="mm-section-title">{t('home.hero.title')}</p>
              <p className="mm-section-text">
                {network.friendbotUrl ? t('home.hero.text.test') : t('home.hero.text.mainnet')}
              </p>
              <Art className="mm-pill" svg={pillButton(t('home.hero.cta'))} />
            </div>
          )}

          <div className="mm-tiles">
            {tiles.map((tile) => (
              <Art key={tile.icon} svg={actionTile(tile.icon, tile.label, tile.disabled, TILE_WIDTH)} />
            ))}
          </div>

          <div className="mm-tabs">
            <strong>{t('home.tokens')}</strong>
            <span className="mm-link">{t('home.activity')}</span>
          </div>
          <Art svg={networkPill(t('network.pill', { network: network.name }))} />

          {funded ? (
            <>
              <div className="mm-token">
                <Art className="mm-token-avatar" svg={assetIcon('XLM')} />
                <Art svg={tokenInfo(t('asset.xlm'), 'Stellar', { text: localizeNumber('0.00%'), tone: 'flat' })} />
                <strong>{balance}</strong>
              </div>
              <span className="mm-link mm-center">{t('trust.title')}</span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
