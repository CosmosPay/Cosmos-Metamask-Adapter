import { NETWORK_OPTIONS } from '@/lib/network';
import type { StellarNetwork } from '@/types';

type NetworkSelectProps = {
  value: StellarNetwork;
  disabled: boolean;
  onChange: (network: StellarNetwork) => void;
};

export function NetworkSelect({ value, disabled, onChange }: NetworkSelectProps) {
  return (
    <select
      aria-label="Red"
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
