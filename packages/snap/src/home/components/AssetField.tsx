import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Button, Image } from '@metamask/snaps-sdk/jsx';

import { wideRow } from '@/ui/graphics/icons';
import type { AssetOption } from '@/home/types';

/** Tappable field showing the chosen asset; opens the picker screen. */
export const AssetField: SnapComponent<{ name: string; option: AssetOption }> = ({ name, option }) => (
  <Button name={name}>
    <Image
      src={wideRow({
        avatar: option.avatar,
        title: option.title,
        subtitle: option.who,
        right: option.balance,
        trailing: 'chevron',
        surface: true,
      })}
      alt={option.title}
    />
  </Button>
);
