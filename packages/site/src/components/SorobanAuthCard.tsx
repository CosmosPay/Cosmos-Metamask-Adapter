import { ActionButton } from '@/components/ActionButton';
import { Card } from '@/components/Card';
import { RichText } from '@/components/RichText';
import { useI18n } from '@/i18n';

export function SorobanAuthCard({ onSign }: { onSign: () => Promise<unknown> }) {
  const { t } = useI18n();
  return (
    <Card title={t('soroban.title')}>
      <p className="muted">
        <RichText text={t('soroban.text')} />
      </p>
      <ActionButton label={t('soroban.done')} action={onSign}>
        {t('soroban.button')}
      </ActionButton>
    </Card>
  );
}
