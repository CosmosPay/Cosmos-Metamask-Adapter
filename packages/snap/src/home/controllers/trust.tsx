import { ValidationError } from '@/domain/errors';
import { signAndSubmit } from '@/domain/transactions';
import type { TrustlineRequest } from '@/domain/trustlines';
import { prepareTrustline } from '@/domain/trustlines';
import { t } from '@/i18n';
import { findAsset, getRegistry } from '@/services/assets';
import { assetAvatar } from '@/ui/assetAvatar';
import { Loading } from '@/home/components';
import { loadWallet, readString, show } from '@/home/interface';
import type { ClickEvent, Routes } from '@/home/router';
import { Assets } from '@/home/screens/AssetsScreen';
import { CustomAsset } from '@/home/screens/CustomAssetScreen';
import { Failed } from '@/home/screens/ResultScreens';
import { TrustReview } from '@/home/screens/TrustReviewScreen';
import type { FieldErrors } from '@/home/types';
import { assetPickerRows } from '@/home/viewModels/assets';
import { showMain } from '@/home/controllers/main';

async function openAssets(id: string) {
  const { network, account } = await loadWallet();
  if (!account) {
    await showMain(id);
    return;
  }
  await show(id, <Assets rows={await assetPickerRows(network, account)} />);
}

async function openCustomAsset(id: string, errors?: FieldErrors, values?: { code: string; issuer: string }) {
  await show(id, <CustomAsset errors={errors} values={values} />);
}

/**
 * Validates an add/remove trustline request and shows its review.
 *
 * @param id - Interface id.
 * @param trust - Asset and direction.
 * @param fromForm - Typed in the custom asset form (errors go back to it).
 */
async function reviewTrust(id: string, trust: TrustlineRequest, fromForm = false) {
  await show(id, <Loading text={t('loading.trust')} />, { trust });
  const { keypair, network } = await loadWallet();
  try {
    const [prepared, registry] = await Promise.all([prepareTrustline(network, keypair, trust), getRegistry(network)]);
    const entry = findAsset(registry, prepared.code, prepared.issuer);
    await show(
      id,
      <TrustReview
        network={network}
        code={prepared.code}
        issuer={prepared.issuer}
        issuerName={entry?.verified ? entry.issuerName : null}
        avatar={await assetAvatar(prepared.code, prepared.issuer, registry, 56)}
        domain={prepared.domain}
        remove={prepared.remove}
        feeXlm={prepared.feeXlm}
      />,
      { trust },
    );
  } catch (error) {
    if (error instanceof ValidationError && fromForm) {
      await openCustomAsset(id, error.fields, { code: trust.code, issuer: trust.issuer });
      return;
    }
    await show(id, <Failed message={(error as Error).message} retry="go-assets" />);
  }
}

async function confirmTrust(id: string, trust: TrustlineRequest) {
  await show(id, <Loading text={t('loading.sending')} />, { trust });
  const { keypair, network } = await loadWallet();
  try {
    const prepared = await prepareTrustline(network, keypair, trust);
    await signAndSubmit(network, keypair, prepared.tx);
    await showMain(
      id,
      prepared.remove
        ? {
            severity: 'success',
            title: t('trust.removed.title'),
            text: t('trust.removed.text', { asset: prepared.code }),
          }
        : {
            severity: 'success',
            title: t('trust.added.title'),
            text: t('trust.added.text', { asset: prepared.code }),
          },
    );
  } catch (error) {
    await show(id, <Failed message={(error as Error).message} retry="go-assets" />);
  }
}

/** `add-trust:CODE:ISSUER` / `remove-trust:CODE:ISSUER`. */
const toggleTrust =
  (remove: boolean) =>
  async ({ id, arg }: ClickEvent) => {
    const [code, issuer] = arg.split(':');
    if (code && issuer) {
      await reviewTrust(id, { code, issuer, remove });
    }
  };

export const trustRoutes: Routes = {
  clicks: {
    'go-assets': async ({ id }) => openAssets(id),
    'go-custom-asset': async ({ id }) => openCustomAsset(id),
    'add-trust': toggleTrust(false),
    'remove-trust': toggleTrust(true),
    'confirm-trust': async ({ id, context }) => {
      if (context.trust) {
        await confirmTrust(id, context.trust);
      }
    },
  },
  forms: {
    'trust-form': async ({ id, values }) =>
      reviewTrust(id, { code: readString(values, 'code'), issuer: readString(values, 'issuer') }, true),
  },
};
