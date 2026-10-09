import { RichText } from '@/components/RichText';
import { SectionHeading } from '@/components/SectionHeading';
import { FAQ, FAQ_VALUES } from '@/content/home';
import { useI18n } from '@/i18n';

/**
 * Questions and answers, all open: a question is a heading people can jump
 * to, and nothing hides behind a control (headings inside `<summary>` lose
 * their role in some screen readers).
 */
export function Faq() {
  const { t } = useI18n();
  return (
    <section className="section" id="faq" aria-labelledby="faq-title">
      <SectionHeading id="faq-title" eyebrow="faq.eyebrow" title="faq.title" />
      <div className="faq">
        {FAQ.map((item) => (
          <div key={item.question} className="faq-item reveal">
            <h3>{t(item.question)}</h3>
            <p>
              <RichText text={t(item.answer, FAQ_VALUES)} />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
