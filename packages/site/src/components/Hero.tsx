import saltaDevLogo from '@/assets/brand/saltadev.png';
import { BrandSvg } from '@/components/BrandSvg';
import { ExternalLink } from '@/components/ExternalLink';
import { InstallSnapButton } from '@/components/InstallSnapButton';
import { RichText } from '@/components/RichText';
import { SnapHomePreview } from '@/components/SnapHomePreview';
import { COSMOS_URL, COSMOS_WALLET_URL, SALTA_DEV_URL } from '@/config';
import { revealStep as step } from '@/hooks/useReveal';
import { type MessageKey, useI18n } from '@/i18n';
import { moveInk } from '@/lib/ink';
import type { AccountSnapshot } from '@/types';

const STATS: { value: string; label: MessageKey }[] = [
  { value: '3', label: 'stats.networks' },
  { value: 'SEP-43', label: 'stats.api' },
  { value: '0', label: 'stats.extensions' },
];

type HeroProps = {
  connected: boolean;
  account: AccountSnapshot | null;
  onConnect: () => Promise<unknown>;
};

/** The landing's first section: the page's title, the install call to action, sponsors, the snap preview and the stats. */
export function Hero({ connected, account, onConnect }: HeroProps) {
  const { t } = useI18n();
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow reveal" style={step(0)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
          </svg>
          {t('hero.eyebrow')}
        </p>
        {/* tabIndex -1: client-side navigation moves focus here (usePageFocus). */}
        <h1 id="hero-title" className="reveal" style={step(1)} tabIndex={-1}>
          <RichText text={t('hero.title')} />
        </h1>
        <p className="hero-lead reveal" style={step(2)}>
          <RichText text={t('hero.lead')} />
        </p>
        <div className="hero-actions reveal" style={step(3)}>
          <InstallSnapButton installed={connected} onInstall={onConnect} />
          <ExternalLink
            className="hero-cta ink"
            href={COSMOS_WALLET_URL}
            onPointerEnter={moveInk}
            onPointerLeave={moveInk}
          >
            {t('hero.cta')}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 12h15M13 6l6 6-6 6" />
            </svg>
          </ExternalLink>
        </div>
        {/* Stellar joins (BrandSvg "stellar", stellar.org) once its sponsorship is official. */}
        <div className="hero-sponsors reveal" style={step(4)}>
          <p id="hero-sponsors">{t('hero.sponsoredBy')}</p>
          <ul aria-labelledby="hero-sponsors">
            <li>
              <ExternalLink href={COSMOS_URL}>
                <BrandSvg name="cosmos" className="sponsor-cosmos" label="Cosmos" />
              </ExternalLink>
            </li>
            <li>
              {/* SaltaDev's own lockup: the poncho beside the name, as on salta.dev. */}
              <ExternalLink className="sponsor-saltadev" href={SALTA_DEV_URL}>
                <img src={saltaDevLogo} alt="" width="38" height="32" decoding="async" />
                SaltaDev
              </ExternalLink>
            </li>
          </ul>
        </div>
      </div>

      {/* The preview enters through its windows, which rise in on their own (window-rise). */}
      <div>
        <SnapHomePreview account={account} />
      </div>

      <dl className="hero-stats">
        {STATS.map((stat, index) => (
          <div key={stat.label} className="reveal" style={step(3 + index)}>
            <dt>{t(stat.label)}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
