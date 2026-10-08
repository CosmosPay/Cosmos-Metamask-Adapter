import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Banner, Box, Copyable, Image, Text } from '@metamask/snaps-sdk/jsx';

import type { NetworkConfig } from '@/config/networks';
import { t } from '@/i18n';
import { networkLabel } from '@/ui/format';
import { Gap, ScreenHeader } from '@/home/components';

export const Receive: SnapComponent<{
  address: string;
  network: NetworkConfig;
  qr: string;
  active: boolean;
}> = ({ address, network, qr, active }) => (
  <Box>
    <ScreenHeader title={t('receive.title', { network: networkLabel(network.id) })} />
    <Box center>
      <Image src={qr} alt={t('receive.qrAlt')} />
    </Box>
    <Gap size={8} />
    <Copyable value={address} />
    <Text color="alternative">{t('receive.note')}</Text>
    {active ? null : (
      <Banner title={t('home.inactive.title')} severity="info">
        <Text>{t('receive.inactive')}</Text>
      </Banner>
    )}
  </Box>
);
