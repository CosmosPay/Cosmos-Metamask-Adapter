import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Button, Image } from '@metamask/snaps-sdk/jsx';

import { t } from '@/i18n';
import { wideRow } from '@/ui/graphics/icons';
import { ScreenHeader } from '@/home/components';
import type { AssetOption, PickerPurpose } from '@/home/types';

/** Full-page asset list: grows downward and scrolls with the page. */
export const AssetPicker: SnapComponent<{
  purpose: PickerPurpose;
  options: AssetOption[];
  selected: string | null;
}> = ({ purpose, options, selected }) => (
  <Box>
    <ScreenHeader title={t('picker.title')} back={`picker-back:${purpose}`} />
    {options.map((option) => (
      <Button name={`choose-asset:${purpose}:${option.key}`}>
        <Image
          src={wideRow({
            avatar: option.avatar,
            title: option.title,
            subtitle: option.who,
            right: option.balance,
            trailing: option.key === selected ? 'check' : undefined,
            surface: option.key === selected,
          })}
          alt={option.title}
        />
      </Button>
    ))}
  </Box>
);
