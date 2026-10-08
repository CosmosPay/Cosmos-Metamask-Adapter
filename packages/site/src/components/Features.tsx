import { FeatureIcon } from '@/components/icons/FeatureIcons';
import { RichText } from '@/components/RichText';
import { SectionHeading } from '@/components/SectionHeading';
import { FEATURES } from '@/content/home';
import { useI18n } from '@/i18n';

/** What the snap adds to MetaMask, one card per feature. */
export function Features() {
  const { t } = useI18n();
  return (
    <section className="section" id="features" aria-labelledby="features-title">
      <SectionHeading id="features-title" eyebrow="features.eyebrow" title="features.title" lead="features.lead" />
      {/* role="list": Safari drops list semantics from unstyled lists. */}
      <ul className="features" role="list">
        {FEATURES.map((feature) => (
          <li key={feature.icon} className="feature">
            <FeatureIcon name={feature.icon} />
            <h3>{t(feature.title)}</h3>
            <p>
              <RichText text={t(feature.text)} />
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
