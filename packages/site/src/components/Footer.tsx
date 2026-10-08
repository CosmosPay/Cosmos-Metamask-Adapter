import { BrandSvg } from '@/components/BrandSvg';
import { SnapText } from '@/components/SnapText';
import { useI18n } from '@/i18n';

/** Site footer: the wordmark and the copyright line, both with the "Snap" hover circle. */
export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <span className="wordmark">
        <BrandSvg name="stellarSnap" label="Stellar Snap" />
      </span>
      <p>
        <SnapText text={t('footer.copyright', { year: new Date().getFullYear() })} />
      </p>
    </footer>
  );
}
