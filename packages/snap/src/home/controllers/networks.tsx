import type { StellarNetwork } from '@/config/networks';
import { NETWORKS } from '@/config/networks';
import { t } from '@/i18n';
import { getState, updateState } from '@/wallet/state';
import { Loading } from '@/home/components';
import { show } from '@/home/interface';
import type { Routes } from '@/home/router';
import { Networks } from '@/home/screens/NetworksScreen';
import { showMain } from '@/home/controllers/main';

export const networkRoutes: Routes = {
  clicks: {
    'go-networks': async ({ id }) => {
      const { network } = await getState();
      await show(id, <Networks selected={network} />);
    },
    'select-network': async ({ id, arg }) => {
      if (arg in NETWORKS) {
        await updateState({ network: arg as StellarNetwork });
      }
      await show(id, <Loading text={t('loading.network')} />);
      await showMain(id);
    },
  },
};
