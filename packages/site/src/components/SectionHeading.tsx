import { RichText } from '@/components/RichText';
import { type MessageKey, useI18n } from '@/i18n';

type SectionHeadingProps = {
  /** The heading's id, which the section points at with `aria-labelledby`. */
  id: string;
  eyebrow: MessageKey;
  title: MessageKey;
  lead?: MessageKey;
};

/**
 * A home section's heading: the small label above it and the title, whose
 * *bold* parts carry the weight as in the hero, grouped as one heading
 * (`hgroup`), then an optional lead paragraph.
 */
export function SectionHeading({ id, eyebrow, title, lead }: SectionHeadingProps) {
  const { t } = useI18n();
  return (
    <div className="section-heading">
      <hgroup>
        <p className="section-eyebrow reveal">{t(eyebrow)}</p>
        <h2 id={id} className="reveal">
          <RichText text={t(title)} />
        </h2>
      </hgroup>
      {lead ? (
        <p className="section-lead reveal">
          <RichText text={t(lead)} />
        </p>
      ) : null}
    </div>
  );
}
