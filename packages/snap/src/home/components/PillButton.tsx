import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Button, Image } from '@metamask/snaps-sdk/jsx';

import { pillButton } from '@/ui/graphics/icons';

/** Full-width button drawn to fit (see `pillButton`): no snap logo, MetaMask hover. */
export const PillButton: SnapComponent<{
  name: string;
  label: string;
  kind?: 'primary' | 'secondary' | 'danger';
  submit?: boolean;
  disabled?: boolean;
}> = ({ name, label, kind, submit, disabled }) => (
  <Button name={name} type={submit ? 'submit' : 'button'} disabled={Boolean(disabled)}>
    <Image src={pillButton(label, kind ?? 'primary')} alt={label} />
  </Button>
);
