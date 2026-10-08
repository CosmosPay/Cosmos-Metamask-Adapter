import type { JSXElement } from '@metamask/snaps-sdk/jsx';

import { t } from '@/i18n';
import { fetchPayments, requestFriendbot } from '@/services/horizon';
import { qrSvg } from '@/ui/graphics/qr';
import { Loading } from '@/home/components';
import { loadWallet, show } from '@/home/interface';
import type { ClickEvent, Routes } from '@/home/router';
import { Fund } from '@/home/screens/FundScreen';
import { Main } from '@/home/screens/MainScreen';
import { Receive } from '@/home/screens/ReceiveScreen';
import type { Notice, Tab } from '@/home/types';
import { portfolio } from '@/home/viewModels/portfolio';

/**
 * Builds the main screen: balance, actions, tokens or activity.
 *
 * @param notice - Optional banner on top.
 * @param tab - Tab to show.
 * @returns The screen.
 */
export async function mainScreen(notice?: Notice, tab: Tab = 'tokens'): Promise<JSXElement> {
  const { state, keypair, network, account } = await loadWallet();
  const address = keypair.publicKey();
  const [{ rows, summary }, payments] = await Promise.all([
    portfolio(network, account),
    tab === 'activity' && account ? fetchPayments(network, address).catch(() => []) : Promise.resolve([]),
  ]);
  return (
    <Main
      selected={state.selectedAccount}
      address={address}
      network={network}
      funded={account !== null}
      summary={summary}
      tokens={rows}
      tab={tab}
      payments={payments}
      notice={notice}
    />
  );
}

/**
 * Goes back to the main screen, optionally with a notice.
 *
 * @param id - Interface id.
 * @param notice - Optional banner.
 * @param tab - Tab to show (kept in context).
 */
export async function showMain(id: string, notice?: Notice, tab?: Tab): Promise<void> {
  await show(id, await mainScreen(notice, tab), tab ? { tab } : {});
}

const showTab = async ({ id, context }: ClickEvent) => showMain(id, undefined, context.tab ?? 'tokens');

export const mainRoutes: Routes = {
  clicks: {
    back: async ({ id }) => showMain(id),
    dismiss: showTab,
    'tab-tokens': async ({ id }) => showMain(id, undefined, 'tokens'),
    'tab-activity': async ({ id }) => showMain(id, undefined, 'activity'),
    refresh: async (event) => {
      await show(event.id, <Loading text={t('loading.refresh')} />, { tab: event.context.tab ?? 'tokens' });
      await showTab(event);
    },
    'go-receive': async ({ id }) => {
      const { keypair, network, account } = await loadWallet();
      const address = keypair.publicKey();
      await show(id, <Receive address={address} network={network} qr={qrSvg(address)} active={account !== null} />);
    },
    'go-fund': async ({ id }) => {
      const { keypair } = await loadWallet();
      await show(id, <Fund address={keypair.publicKey()} />);
    },
    friendbot: async ({ id }) => {
      await show(id, <Loading text={t('loading.friendbot')} />);
      const { keypair, network } = await loadWallet();
      try {
        await requestFriendbot(network, keypair.publicKey());
        await showMain(id, {
          severity: 'success',
          title: t('home.funded.title'),
          text: t('home.funded.text', { network: network.name }),
        });
      } catch (error) {
        await showMain(id, { severity: 'danger', title: t('home.friendbot.title'), text: (error as Error).message });
      }
    },
  },
};
