import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { ExternalLink } from '@/components/ExternalLink';
import { Astronaut } from '@/components/illustrations/Astronaut';
import { SectionHeading } from '@/components/SectionHeading';
import { DONATION_ADDRESS, DONATION_URL } from '@/config';
import { useHydrated } from '@/hooks/useHydrated';
import { useI18n } from '@/i18n';

const DonationQr = lazy(() => import('@/components/DonationQr').then((module) => ({ default: module.DonationQr })));

/** How long the "copied" confirmation stays. */
const COPIED_MS = 3000;

/** Whether there's a donations section: an address and/or a page to give through. */
export const HAS_DONATIONS = DONATION_ADDRESS !== null || DONATION_URL !== null;

/** The section's id, which the banner's "Donate" link points to (`/#donate`). */
export const DONATE_SECTION = 'donate';

/**
 * How to support the project: a Stellar address on the public network (copy
 * it or scan its QR) and/or a page with other ways to give, as configured in
 * config.ts. Without either, there's no section.
 */
export function Donations() {
  const { t } = useI18n();
  const hydrated = useHydrated();
  const [copied, setCopied] = useState(false);
  const address = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), COPIED_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  if (!HAS_DONATIONS) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(DONATION_ADDRESS ?? '');
      setCopied(true);
    } catch {
      // No clipboard access (an old browser, or blocked): select the address so it can be copied by hand.
      if (address.current) window.getSelection()?.selectAllChildren(address.current);
    }
  };

  const other = DONATION_URL ? (
    // Inside the card it enters with it; on its own, it enters by itself.
    <ExternalLink className={DONATION_ADDRESS ? 'text-link' : 'text-link reveal'} href={DONATION_URL}>
      {t('donate.other')}
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12h15M13 6l6 6-6 6" />
      </svg>
    </ExternalLink>
  ) : null;

  return (
    // Focusable from script: a link from another page (`/#donate`) lands focus here, like the headings on a page change.
    <section className="section donate-section" id={DONATE_SECTION} tabIndex={-1} aria-labelledby="donate-title">
      <SectionHeading id="donate-title" eyebrow="donate.eyebrow" title="donate.title" lead="donate.lead" />
      {DONATION_ADDRESS ? (
        <div className="donate reveal">
          {/* The QR draws in the browser; the box keeps its size meanwhile. */}
          <div className="donate-qr">
            {hydrated ? (
              <Suspense fallback={null}>
                <DonationQr address={DONATION_ADDRESS} label={t('donate.qr')} />
              </Suspense>
            ) : null}
          </div>
          <div className="donate-details">
            <h3>{t('donate.address')}</h3>
            <p className="donate-address">
              <code ref={address} translate="no">
                {DONATION_ADDRESS}
              </code>
            </p>
            <div className="donate-actions">
              <Button ink onClick={() => void copy()}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="8" y="8" width="12" height="12" rx="2" />
                  <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
                </svg>
                {t('donate.copy')}
              </Button>
              {/* Announced by screen readers too; the region stays in the page so the change is heard. */}
              <p className="donate-status" role="status">
                {copied ? t('donate.copied') : ''}
              </p>
            </div>
            <p className="donate-note">{t('donate.note')}</p>
            {other}
          </div>
        </div>
      ) : (
        other
      )}
      {/* Beside the heading and the card, in the width they leave: a thumbs-up for the help. */}
      <Astronaut pose="thumbsUp" className="donate-astronaut reveal" />
    </section>
  );
}
