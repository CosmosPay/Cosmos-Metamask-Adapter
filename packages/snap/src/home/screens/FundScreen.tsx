import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Copyable, Text } from '@metamask/snaps-sdk/jsx';

import { t } from '@/i18n';
import { ScreenHeader } from '@/home/components';

export const Fund: SnapComponent<{ address: string }> = ({ address }) => (
  <Box>
    <ScreenHeader title={t('fund.title')} />
    <Text>{t('fund.step1')}</Text>
    <Text>{t('fund.step2')}</Text>
    <Copyable value={address} />
    <Text>{t('fund.step3')}</Text>
  </Box>
);
