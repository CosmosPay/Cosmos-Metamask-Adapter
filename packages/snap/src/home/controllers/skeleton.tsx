import type { JSXElement } from '@metamask/snaps-sdk/jsx';

import type { MessageKey } from '@/i18n';
import { t } from '@/i18n';
import { accountName } from '@/wallet/accountNames';
import { HomeSkeleton, PageSkeleton } from '@/home/components';
import { show } from '@/home/interface';
import { parseName } from '@/home/router';
import type { HomeContext } from '@/home/types';

/** Buttons that open a slow list screen, with that screen's title. */
const PAGE_TITLES: Record<string, MessageKey> = {
  'go-accounts': 'accounts.title',
  'go-assets': 'trust.title',
  'go-swap': 'swap.title',
  'edit-swap': 'swap.title',
  'go-send': 'home.send',
  'edit-send': 'home.send',
  'go-receive': 'home.receive',
};

/** Buttons that end on the main screen. */
const HOME_ACTIONS = new Set(['back', 'dismiss', 'tab-tokens', 'tab-activity', 'select-account']);

/**
 * The placeholder for the screen a button opens, if that screen is slow.
 *
 * @param name - Clicked button.
 * @returns The skeleton, or null to keep the current screen until the next one is ready.
 */
function skeletonFor(name: string): JSXElement | null {
  const { action, arg } = parseName(name);
  const title = PAGE_TITLES[name];
  if (title) {
    return <PageSkeleton title={t(title)} />;
  }
  if (action === 'account-menu') {
    return <PageSkeleton title={accountName(Number(arg))} />;
  }
  if (action === 'activity') {
    return <PageSkeleton title={t('activity.detail.title')} />;
  }
  return HOME_ACTIONS.has(action) ? <HomeSkeleton /> : null;
}

/**
 * Swaps the screen for a skeleton the moment a slow screen is requested, so
 * the click answers instantly while its data loads.
 *
 * @param id - Interface id.
 * @param name - Clicked button.
 * @param context - Current context (kept, so nothing is lost).
 */
export async function showSkeleton(id: string, name: string, context: HomeContext): Promise<void> {
  const skeleton = skeletonFor(name);
  if (skeleton) {
    await show(id, skeleton, context);
  }
}
