import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Banner, Box, Heading, Text } from '@metamask/snaps-sdk/jsx';

import { t } from '@/i18n';
import { shorten } from '@/ui/format';
import { accountName } from '@/wallet/accountNames';
import { isImported } from '@/wallet/state';
import { Gap, PillButton } from '@/home/components';

export const ConfirmRemoveBody: SnapComponent<{ index: number; address: string }> = ({ index, address }) => (
  <Box>
    <Heading>{t('accounts.remove.title', { name: accountName(index) })}</Heading>
    <Text color="alternative">{shorten(address)}</Text>
    <Banner title={t('accounts.remove.confirm')} severity="warning">
      <Text>{isImported(index) ? t('accounts.remove.importedText') : t('accounts.remove.text')}</Text>
    </Banner>
  </Box>
);

export const ConfirmRemoveAccount: SnapComponent<{
  index: number;
  address: string;
}> = ({ index, address }) => (
  <Box>
    <ConfirmRemoveBody index={index} address={address} />
    <Gap />
    <PillButton name={`confirm-remove-account:${index}`} label={t('accounts.remove.confirm')} kind="danger" />
    <PillButton name={`account-menu:${index}`} label={t('common.cancel')} kind="secondary" />
  </Box>
);
