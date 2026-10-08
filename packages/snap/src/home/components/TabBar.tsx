import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Button, Text } from '@metamask/snaps-sdk/jsx';

import { t } from '@/i18n';
import type { Tab } from '@/home/types';

export const TabBar: SnapComponent<{ tab: Tab }> = ({ tab }) => (
  <Box direction="horizontal">
    {tab === 'tokens' ? (
      <Text fontWeight="bold">{t('home.tokens')}</Text>
    ) : (
      <Button name="tab-tokens">{t('home.tokens')}</Button>
    )}
    {tab === 'activity' ? (
      <Text fontWeight="bold">{t('home.activity')}</Text>
    ) : (
      <Button name="tab-activity">{t('home.activity')}</Button>
    )}
  </Box>
);
