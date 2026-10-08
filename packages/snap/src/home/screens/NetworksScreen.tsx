import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Button, Image } from '@metamask/snaps-sdk/jsx';

import type { StellarNetwork } from '@/config/networks';
import { NETWORK_IDS, NETWORKS } from '@/config/networks';
import { t } from '@/i18n';
import { assetIcon, wideRow } from '@/ui/graphics/icons';
import { ScreenHeader } from '@/home/components';

export const Networks: SnapComponent<{ selected: StellarNetwork }> = ({ selected }) => (
  <Box>
    <ScreenHeader title={t('networks.title')} />
    {NETWORK_IDS.map((id) => (
      <Button name={`select-network:${id}`}>
        <Image
          src={wideRow({
            avatar: assetIcon('XLM'),
            title: NETWORKS[id].name,
            subtitle: t(`networks.sub.${id}`),
            trailing: id === selected ? 'check' : undefined,
            surface: id === selected,
          })}
          alt={NETWORKS[id].name}
        />
      </Button>
    ))}
  </Box>
);
