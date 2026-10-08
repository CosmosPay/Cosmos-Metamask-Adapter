import { answerConsent, useConsent } from '@/analytics/consent';
import { Button } from '@/components/Button';
import { Link } from '@/components/Link';
import { GA_MEASUREMENT_ID } from '@/config';
import { useHydrated } from '@/hooks/useHydrated';
import { useI18n } from '@/i18n';
import { pathFor } from '@/lib/router';

/**
 * Asks before any measurement: Google Analytics loads only after "Accept".
 * Shown while there's no answer, or again from the footer. Both choices are
 * equally easy, and it floats (in `.notices`) so the page never shifts.
 */
export function AnalyticsConsent() {
  const { language, t } = useI18n();
  const { consent, asking } = useConsent();
  // Only in the browser: the prerendered page can't know whether this visitor already answered.
  const hydrated = useHydrated();
  if (!GA_MEASUREMENT_ID || !hydrated || (consent !== null && !asking)) return null;
  return (
    <section className="notice consent" aria-label={t('consent.label')}>
      <p>
        {t('consent.text')} <Link href={pathFor('privacy', language)}>{t('consent.policy')}</Link>
      </p>
      <div className="consent-actions">
        {/* Equal weight: declining is as easy and as visible as accepting. */}
        <Button ink onClick={() => answerConsent('granted')}>
          {t('consent.accept')}
        </Button>
        <Button ink onClick={() => answerConsent('denied')}>
          {t('consent.reject')}
        </Button>
      </div>
    </section>
  );
}
