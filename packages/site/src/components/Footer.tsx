import { BrandSvg } from '@/components/BrandSvg';
import { useI18n } from '@/i18n';

/** Site footer: the wordmark and the copyright line. */
export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <BrandSvg name="stellarSnap" label="Stellar Snap" />
      <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
    </footer>
  );
}
