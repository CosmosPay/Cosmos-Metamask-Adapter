import { useI18n } from '@/i18n';
import { NETWORK_OPTIONS } from '@/lib/network';
import type { StellarNetwork } from '@/types';

type NetworkSelectProps = {
  value: StellarNetwork;
  disabled?: boolean;
  onChange: (network: StellarNetwork) => void;
};

export function NetworkSelect({ value, disabled, onChange }: NetworkSelectProps) {
  const { t } = useI18n();
  return (
    <select
      aria-label={t('account.network')}
      value={value}
      disabled={disabled}
      onChange={(event) => {
        const option = NETWORK_OPTIONS.find((o) => o.value === event.currentTarget.value);
        if (option) onChange(option.value);
      }}
    >
      {NETWORK_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
