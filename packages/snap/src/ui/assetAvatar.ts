import { getImageData } from '@metamask/snaps-sdk';

import type { RegistryAsset } from '@/services/assets/registry';
import { findAsset, mainnetCounterpart } from '@/services/assets/registry';
import { assetIcon, stellarLogoDataUrl, svgDataUrl, tokenAvatar } from '@/ui/graphics/icons';

/** Logo domain per organization when the registry has none, or only a technical subdomain. */
const ISSUER_LOGO_DOMAINS: Record<string, string> = {
  Circle: 'circle.com',
  Tether: 'tether.to',
  BlindPay: 'blindpay.com',
  Latamex: 'latamex.com',
  Paxos: 'paxos.com',
  'Glo Foundation': 'glodollar.org',
  'GMO Trust': 'gyen.z.com',
  Anclap: 'anclap.com',
  LINK: 'ngnc.online',
};

/** Some favicons are 300 KB+: they would bloat every screen. */
const MAX_IMAGE_DATA_URL = 60_000;

export type ImageLoader = (url: string) => Promise<string | null>;

/**
 * Loader that downloads each image once per snap session, as a data URL, and
 * skips oversized ones.
 *
 * @param download - Fetches an image as a data URL.
 * @returns The loader.
 */
export function cachedImageLoader(download: (url: string) => Promise<string> = getImageData): ImageLoader {
  const cache = new Map<string, Promise<string | null>>();
  return async (url) => {
    let pending = cache.get(url);
    if (!pending) {
      pending = download(url)
        .then((data) => (data.length <= MAX_IMAGE_DATA_URL ? data : null))
        .catch(() => null);
      cache.set(url, pending);
    }
    return pending;
  };
}

/** Official token logo URL on MetaMask's icon CDN (mainnet assets only). */
export const tokenLogoUrl = (asset: RegistryAsset) => {
  const mainnet = mainnetCounterpart(asset);
  return mainnet?.issuer
    ? `https://static.cx.metamask.io/api/v2/tokenIcons/assets/stellar/pubnet/asset/${mainnet.code}-${mainnet.issuer}.png`
    : null;
};

/** Logo URL of the organization behind the issuer, for the corner badge. */
export const issuerLogoUrl = (asset: RegistryAsset) => {
  const domain = ISSUER_LOGO_DOMAINS[asset.issuerName] ?? asset.issuerDomain;
  return domain ? `https://icon.horse/icon/${domain}` : null;
};

/**
 * Builds MetaMask-style asset avatars: official logo + issuer badge. Unknown
 * or unverified assets get initials and the Stellar network badge; a verified
 * asset without a logo shows its company's logo instead of initials.
 *
 * @param load - Image loader (injected for tests).
 * @returns `assetAvatar(code, issuer, registry, size)` → SVG markup.
 */
export function createAssetAvatar(load: ImageLoader = cachedImageLoader()) {
  const fetchLogo = (url: string | null) => (url ? load(url) : Promise.resolve(null));
  return async (code: string, issuer: string | null, registry: RegistryAsset[], size = 40): Promise<string> => {
    if (issuer === null) {
      return tokenAvatar(stellarLogoDataUrl(), null, size);
    }
    const entry = findAsset(registry, code, issuer);
    if (!entry?.verified) {
      return tokenAvatar(svgDataUrl(assetIcon(code)), stellarLogoDataUrl(), size);
    }
    const [logo, company] = await Promise.all([fetchLogo(tokenLogoUrl(entry)), fetchLogo(issuerLogoUrl(entry))]);
    if (logo) {
      return tokenAvatar(logo, company ?? stellarLogoDataUrl(), size);
    }
    return company
      ? tokenAvatar(company, null, size)
      : tokenAvatar(svgDataUrl(assetIcon(code)), stellarLogoDataUrl(), size);
  };
}

export const assetAvatar = createAssetAvatar();
