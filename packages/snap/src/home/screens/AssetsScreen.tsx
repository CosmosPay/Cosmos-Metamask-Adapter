import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Button, Image, Text } from '@metamask/snaps-sdk/jsx';

import { t } from '@/i18n';
import { rowAction } from '@/ui/graphics/icons';
import { PillButton, ScreenHeader } from '@/home/components';
import type { AssetPickerRow } from '@/home/types';

export const AssetPickerList: SnapComponent<{ rows: AssetPickerRow[] }> = ({ rows }) => (
  <Box>
    <ScreenHeader title={t('trust.title')} />
    {rows.map((row) => (
      <Box direction="horizontal" alignment="space-between">
        <Box direction="horizontal" crossAlignment="center">
          <Image src={row.avatar} alt={row.code} />
          <Box>
            <Text fontWeight="bold">{row.code}</Text>
            <Text size="sm" color="muted">
              {row.subtitle}
            </Text>
          </Box>
        </Box>
        <Button name={`${row.held ? 'remove' : 'add'}-trust:${row.code}:${row.issuer}`}>
          <Image src={rowAction(row.held ? 'added' : 'add')} alt={row.held ? '✓' : '+'} />
        </Button>
      </Box>
    ))}
  </Box>
);

/** Picker like the account/network lists: logo, code, issuer, + / ✓. */
export const Assets: SnapComponent<{ rows: AssetPickerRow[] }> = ({ rows }) => (
  <Box>
    <AssetPickerList rows={rows} />
    <PillButton name="go-custom-asset" label={t('trust.otherAsset')} kind="secondary" />
  </Box>
);
