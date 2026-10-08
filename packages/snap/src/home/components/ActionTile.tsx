import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Button, Image } from '@metamask/snaps-sdk/jsx';

import type { ActionIcon } from '@/ui/graphics/icons';
import { actionTile } from '@/ui/graphics/icons';

/** Four tiles share the row. */
export const TILE_WIDTH = 78;

/** Rounded tile (icon + label) like MetaMask's Buy / Swap / Send / Receive. */
export const ActionTile: SnapComponent<{
  name: string;
  icon: ActionIcon;
  label: string;
  disabled?: boolean;
  width?: number;
}> = ({ name, icon, label, disabled, width }) => (
  <Button name={name} disabled={Boolean(disabled)}>
    <Image src={actionTile(icon, label, disabled, width)} alt={label} />
  </Button>
);
