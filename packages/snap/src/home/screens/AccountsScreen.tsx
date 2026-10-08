import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Button, Icon, Image } from '@metamask/snaps-sdk/jsx';

import { t } from '@/i18n';
import { shorten } from '@/ui/format';
import { identicon, wideRow } from '@/ui/graphics/icons';
import { accountName } from '@/wallet/accountNames';
import { PillButton, ScreenHeader } from '@/home/components';
import type { AccountRowData } from '@/home/types';

/**
 * One clickable row (avatar, name, address, balance) plus its ⋮ menu. The ⋮ is
 * a native icon: its fixed CSS size keeps it from shrinking, so the row art can
 * be drawn large and scale down to whatever width is left.
 */
export const AccountRow: SnapComponent<{
  row: AccountRowData;
  selected: boolean;
}> = ({ row, selected }) => (
  <Box direction="horizontal" alignment="space-between" crossAlignment="center">
    <Button name={`select-account:${row.index}`}>
      <Image
        src={wideRow({
          avatar: identicon(row.address),
          title: accountName(row.index),
          subtitle: shorten(row.address),
          right: row.balance,
          surface: selected,
        })}
        alt={accountName(row.index)}
      />
    </Button>
    <Button name={`account-menu:${row.index}`}>
      <Icon name="more-vertical" color="muted" />
    </Button>
  </Box>
);

export const AccountList: SnapComponent<{
  rows: AccountRowData[];
  selected: number;
}> = ({ rows, selected }) => (
  <Box>
    <ScreenHeader title={t('accounts.title')} />
    {rows.map((row) => (
      <AccountRow row={row} selected={row.index === selected} />
    ))}
  </Box>
);

export const Accounts: SnapComponent<{
  rows: AccountRowData[];
  selected: number;
}> = ({ rows, selected }) => (
  <Box>
    <AccountList rows={rows} selected={selected} />
    <PillButton name="add-account" label={t('accounts.addButton')} kind="secondary" />
    <PillButton name="go-import" label={t('accounts.importButton')} kind="secondary" />
  </Box>
);
