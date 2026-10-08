import { formValues, loadWallet, readString, show } from '@/home/interface';
import type { Routes } from '@/home/router';
import { AssetPicker } from '@/home/screens/AssetPickerScreen';
import type { HomeContext, PickerPurpose, SendForm } from '@/home/types';
import { EMPTY_SEND_FORM, EMPTY_SWAP_FORM } from '@/home/types';
import { assetOptions } from '@/home/viewModels/assets';
import { showMain } from '@/home/controllers/main';
import { openSend } from '@/home/controllers/send';
import { openSwap } from '@/home/controllers/swap';

const readSendForm = (values: Record<string, unknown>): SendForm => ({
  destination: readString(values, 'destination'),
  amount: readString(values, 'amount'),
  asset: readString(values, 'asset', 'native'),
  memo: readString(values, 'memo'),
});

/**
 * Shows the asset list for the send form or either side of a swap.
 *
 * @param id - Interface id.
 * @param purpose - Which field is being picked.
 * @param context - Form state to return to.
 */
async function openPicker(id: string, purpose: PickerPurpose, context: HomeContext) {
  const { network, account } = await loadWallet();
  if (!account) {
    await showMain(id);
    return;
  }
  let options = await assetOptions(network, account);
  const { swap } = context;
  if (purpose === 'swap-to' && swap) {
    options = options.filter((option) => option.key !== swap.from);
  }
  const selected =
    purpose === 'send'
      ? (context.form ?? EMPTY_SEND_FORM).asset
      : purpose === 'swap-from'
        ? (swap?.from ?? null)
        : (swap?.to ?? null);
  await show(id, <AssetPicker purpose={purpose} options={options} selected={selected} />, context);
}

export const pickerRoutes: Routes = {
  clicks: {
    'pick-asset': async ({ id, arg, context }) => {
      const purpose = arg as PickerPurpose;
      if (purpose === 'send') {
        // Keep what was typed: the picker replaces the form.
        const typed = await formValues(id, 'send-form');
        const asset = (context.form ?? EMPTY_SEND_FORM).asset;
        await openPicker(id, purpose, { form: { ...readSendForm(typed), asset } });
        return;
      }
      const swap = context.swap ?? EMPTY_SWAP_FORM;
      const typed = await formValues(id, 'swap-form');
      await openPicker(id, purpose, { swap: { ...swap, amount: readString(typed, 'amount', swap.amount) } });
    },
    'choose-asset': async ({ id, arg, context }) => {
      const [purpose, ...rest] = arg.split(':');
      const key = rest.join(':');
      if (purpose === 'send') {
        await openSend(id, { ...(context.form ?? EMPTY_SEND_FORM), asset: key });
        return;
      }
      const swap = context.swap ?? EMPTY_SWAP_FORM;
      await openSwap(
        id,
        purpose === 'swap-from'
          ? { ...swap, from: key, to: swap.to === key ? swap.from : swap.to }
          : { ...swap, to: key },
      );
    },
    'picker-back': async ({ id, arg, context }) => {
      if (arg === 'send') {
        await openSend(id, context.form ?? EMPTY_SEND_FORM);
      } else {
        await openSwap(id, context.swap ?? EMPTY_SWAP_FORM);
      }
    },
  },
};
