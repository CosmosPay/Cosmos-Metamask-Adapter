import type { OnHomePageHandler, OnUserInputHandler } from '@metamask/snaps-sdk';
import { UserInputEventType } from '@metamask/snaps-sdk';

import { loadPreferences } from '@/i18n';
import { refreshAccountNames } from '@/wallet/accountNames';
import { accountRoutes } from '@/home/controllers/accounts';
import { activityRoutes } from '@/home/controllers/activity';
import { mainRoutes, mainScreen, showMain } from '@/home/controllers/main';
import { networkRoutes } from '@/home/controllers/networks';
import { pickerRoutes } from '@/home/controllers/picker';
import { sendRoutes } from '@/home/controllers/send';
import { signRoutes } from '@/home/controllers/sign';
import { showSkeleton } from '@/home/controllers/skeleton';
import { liveSwapEstimate, swapRoutes } from '@/home/controllers/swap';
import { trustRoutes } from '@/home/controllers/trust';
import { combineRoutes, parseName } from '@/home/router';
import type { HomeContext } from '@/home/types';

const routes = combineRoutes(
  mainRoutes,
  accountRoutes,
  networkRoutes,
  activityRoutes,
  pickerRoutes,
  sendRoutes,
  swapRoutes,
  trustRoutes,
  signRoutes,
);

/** Every event re-reads preferences and names: the user may have changed them in MetaMask. */
async function prepare() {
  await loadPreferences();
  await refreshAccountNames();
}

export const onHomePage: OnHomePageHandler = async () => {
  await prepare();
  const id = await snap.request({
    method: 'snap_createInterface',
    params: { ui: await mainScreen(), context: {} },
  });
  return { id };
};

export const onUserInput: OnUserInputHandler = async ({ id, event, context }) => {
  await prepare();
  const homeContext = (context as HomeContext | null) ?? {};

  switch (event.type) {
    case UserInputEventType.InputChangeEvent:
      // Only the swap amount reacts to typing (live quote).
      if (event.name === 'amount' && homeContext.swap && !homeContext.quote) {
        await liveSwapEstimate(id, homeContext.swap, typeof event.value === 'string' ? event.value : '');
      }
      return;

    case UserInputEventType.FormSubmitEvent: {
      const { action, arg } = parseName(event.name ?? '');
      await routes.form(action)?.({ id, arg, values: event.value, context: homeContext });
      return;
    }

    case UserInputEventType.ButtonClickEvent: {
      const name = event.name ?? '';
      const { action, arg } = parseName(name);
      await showSkeleton(id, name, homeContext);
      const handler = routes.click(action);
      // Unknown buttons go home, so the user is never stuck.
      await (handler ? handler({ id, name, arg, context: homeContext }) : showMain(id));
      return;
    }

    default:
  }
};
