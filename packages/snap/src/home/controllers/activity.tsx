import { fetchOperation } from '@/services/horizon';
import { loadWallet, show } from '@/home/interface';
import type { Routes } from '@/home/router';
import { ActivityDetail } from '@/home/screens/ActivityDetailScreen';
import { showMain } from '@/home/controllers/main';

export const activityRoutes: Routes = {
  clicks: {
    activity: async ({ id, arg: operationId }) => {
      const { keypair, network } = await loadWallet();
      const payment = await fetchOperation(network, operationId).catch(() => null);
      if (!payment) {
        await showMain(id, undefined, 'activity');
        return;
      }
      await show(id, <ActivityDetail payment={payment} address={keypair.publicKey()} network={network} />, {
        tab: 'activity',
      });
    },
  },
};
