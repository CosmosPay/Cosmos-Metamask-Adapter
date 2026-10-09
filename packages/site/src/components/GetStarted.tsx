import { RichText } from '@/components/RichText';
import { SectionHeading } from '@/components/SectionHeading';
import { STEPS } from '@/content/home';
import { useI18n } from '@/i18n';

/** The three steps from MetaMask to a Stellar account; an ordered list, numbered by the CSS. */
export function GetStarted() {
  const { t } = useI18n();
  return (
    <section className="section" id="get-started" aria-labelledby="get-started-title">
      <SectionHeading id="get-started-title" eyebrow="start.eyebrow" title="start.title" />
      {/* role="list": Safari drops list semantics from unstyled lists. */}
      <ol className="steps" role="list">
        {STEPS.map((step) => (
          <li key={step.title} className="step reveal">
            <h3>{t(step.title)}</h3>
            <p>
              <RichText text={t(step.text)} />
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
