import { getImageData } from '@metamask/snaps-sdk';

import { COSMOS_API, cosmosApiKey } from './cosmosApi';
import { stellarLogoDataUrl, svgDataUrl, assetIcon, tokenAvatar } from './icons';
import type { NetworkConfig, StellarNetwork } from './networks';
import { classicAssetId, XLM_ASSET_ID } from './prices';

/**
 * Stellar asset as published by the Cosmos Pay asset registry
 * (`GET /v1/assets` on api.cosmospay.lat). Identity is (code, issuer).
 */
export type RegistryAsset = {
  code: string;
  /** null for native XLM. */
  issuer: string | null;
  name: string;
  /** Organization behind the issuer, e.g. "Circle". */
  issuerName: string;
  issuerDomain: string;
  /** The issuer's identity was checked by Cosmos Pay. */
  verified: boolean;
};

const NATIVE: RegistryAsset = {
  code: 'XLM',
  issuer: null,
  name: 'Stellar Lumens',
  issuerName: 'Stellar',
  issuerDomain: 'stellar.org',
  verified: true,
};

/**
 * Bundled copy of the Cosmos Pay registry (version 2), used when the API is
 * unreachable — same strategy as the Cosmos Pay wallet.
 */
export const BUNDLED_REGISTRY_VERSION = 2;

const BUNDLED: Record<StellarNetwork, RegistryAsset[]> = {
  mainnet: [
    NATIVE,
    {
      code: 'USDC',
      issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
      name: 'USD Coin',
      issuerName: 'Circle',
      issuerDomain: 'circle.com',
      verified: true,
    },
    {
      code: 'USDT0',
      issuer: 'GATISXX6BZ6NC7IKQBY37CJD4SOZL3CYZJWXEDG6JVIY4WBS6KXJHN6Q',
      name: 'USDT0',
      issuerName: 'Tether',
      issuerDomain: '',
      verified: true,
    },
    {
      code: 'EURC',
      issuer: 'GDHU6WRG4IEQXM5NZ4BMPKOXHW76MZM4Y2IEMFDVXBSDP6SJY4ITNPP2',
      name: 'Euro Coin',
      issuerName: 'Circle',
      issuerDomain: 'circle.com',
      verified: true,
    },
    {
      code: 'EURC',
      issuer: 'GAQRF3UGHBT6JYQZ7YSUYCIYWAF4T2SAA5237Q5LIQYJOHHFAWDXZ7NM',
      name: 'Euro Coin',
      issuerName: 'MyKobo',
      issuerDomain: 'mykobo.co',
      verified: true,
    },
    {
      code: 'AQUA',
      issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA',
      name: 'Aquarius',
      issuerName: 'Aquarius',
      issuerDomain: 'aqua.network',
      verified: true,
    },
    {
      code: 'yXLM',
      issuer: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55',
      name: 'Ultra Stellar XLM',
      issuerName: 'Ultra Capital',
      issuerDomain: 'ultracapital.xyz',
      verified: true,
    },
    {
      code: 'ARST',
      issuer: 'GCSAZVWXZKWS4XS223M5F54H2B6XPIIXZZGP7KEAIU6YSL5HDRGCI3DG',
      name: 'Argentine Peso',
      issuerName: 'Latamex',
      issuerDomain: 'pubnet-sep.latamex.com',
      verified: true,
    },
    {
      code: 'PYUSD',
      issuer: 'GDQE7IXJ4HUHV6RQHIUPRJSEZE4DRS5WY577O2FY6YQ5LVWZ7JZTU2V5',
      name: 'PayPal USD',
      issuerName: 'Paxos',
      issuerDomain: 'token-metadata.paxos.com',
      verified: true,
    },
    {
      code: 'USDY',
      issuer: 'GAJMPX5NBOG6TQFPQGRABJEEB2YE7RFRLUKJDZAZGAD5GFX4J7TADAZ6',
      name: 'Ondo US Dollar Yield',
      issuerName: 'Ondo Finance',
      issuerDomain: 'ondo.finance',
      verified: true,
    },
    {
      code: 'USDGLO',
      issuer: 'GBBS25EGYQPGEZCGCFBKG4OAGFXU6DSOQBGTHELLJT3HZXZJ34HWS6XV',
      name: 'Glo Dollar',
      issuerName: 'Glo Foundation',
      issuerDomain: 'app.glodollar.org',
      verified: true,
    },
    {
      code: 'GYEN',
      issuer: 'GDF6VOEGRWLOZ64PQQGKD2IYWA22RLT37GJKS2EJXZHT2VLAGWLC5TOB',
      name: 'GYEN',
      issuerName: 'GMO Trust',
      issuerDomain: 'stablecoin.z.com',
      verified: true,
    },
    {
      code: 'AUDD',
      issuer: 'GDC7X2MXTYSAKUUGAIQ7J7RPEIM7GXSAIWFYWWH4GLNFECQVJJLB2EEU',
      name: 'AUDD',
      issuerName: 'AUDD',
      issuerDomain: 'audd.digital',
      verified: true,
    },
    {
      code: 'VCHF',
      issuer: 'GDXLSLCOPPHTWOQXLLKSVN4VN3G67WD2ENU7UMVAROEYVJLSPSEWXIZN',
      name: 'VNX Swiss Franc',
      issuerName: 'VNX',
      issuerDomain: 'vnx.io',
      verified: true,
    },
    {
      code: 'ZARZ',
      issuer: 'GAROH4EV3WVVTRQKEY43GZK3XSRBEYETRVZ7SVG5LHWOAANSMCTJBB3U',
      name: 'ZARZ',
      issuerName: 'ZEAM',
      issuerDomain: 'zeam.money',
      verified: true,
    },
    {
      code: 'USDZ',
      issuer: 'GAKTLPC4ZV37SSCITQ5IS5AQ4WPF4CF4VZJQPPAROSGXMYOATF5U6XPR',
      name: 'USDZ',
      issuerName: 'ZEAM',
      issuerDomain: 'zeam.money',
      verified: true,
    },
    {
      code: 'NGNC',
      issuer: 'GASBV6W7GGED66MXEVC7YZHTWWYMSVYEY35USF2HJZBLABLYIFQGXZY6',
      name: 'NGN Coin',
      issuerName: 'LINK',
      issuerDomain: 'ngnc.online',
      verified: true,
    },
    {
      code: 'ARS',
      issuer: 'GCYE7C77EB5AWAA25R5XMWNI2EDOKTTFTTPZKM2SR5DI4B4WFD52DARS',
      name: 'Argentine Peso',
      issuerName: 'Anclap',
      issuerDomain: 'api.anclap.com',
      verified: true,
    },
    {
      code: 'PEN',
      issuer: 'GA4TDPNUCZPTOHB3TKUYMDCRVATXKEADH7ZEYEBWJKQKE2UBFCYNBPEN',
      name: 'Peruvian Sol',
      issuerName: 'Anclap',
      issuerDomain: 'api.anclap.com',
      verified: true,
    },
    {
      code: 'CLPX',
      issuer: 'GDYSPBVZHPQTYMGSYNOHRZQNLB3ZWFVQ2F7EP7YBOLRGD42XIC3QUX5G',
      name: 'Chilean Peso',
      issuerName: 'CLPX',
      issuerDomain: 'clpx.finance',
      verified: true,
    },
    {
      code: 'CETES',
      issuer: 'GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC',
      name: 'Etherfuse CETES',
      issuerName: 'Etherfuse',
      issuerDomain: 'etherfuse.com',
      verified: true,
    },
    {
      code: 'USTRY',
      issuer: 'GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC',
      name: 'Etherfuse US Treasury',
      issuerName: 'Etherfuse',
      issuerDomain: 'etherfuse.com',
      verified: true,
    },
    {
      code: 'TESOURO',
      issuer: 'GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC',
      name: 'Etherfuse Tesouro',
      issuerName: 'Etherfuse',
      issuerDomain: 'etherfuse.com',
      verified: true,
    },
    {
      code: 'KTB',
      issuer: 'GCRYUGD5NVARGXT56XEZI5CIFCQETYHAPQQTHO2O3IQZTHDH4LATMYWC',
      name: 'Etherfuse KTB',
      issuerName: 'Etherfuse',
      issuerDomain: 'etherfuse.com',
      verified: true,
    },
    {
      code: 'yUSDC',
      issuer: 'GDGTVWSM4MGS4T7Z6W4RPWOCHE2I6RDFCIFZGS3DOA63LWQTRNZNTTFF',
      name: 'Ultra Stellar USDC',
      issuerName: 'Ultra Capital',
      issuerDomain: 'ultracapital.xyz',
      verified: true,
    },
    {
      code: 'yBTC',
      issuer: 'GBUVRNH4RW4VLHP4C5MOF46RRIRZLAVHYGX45MVSTKA2F6TMR7E7L6NW',
      name: 'Ultra Stellar BTC',
      issuerName: 'Ultra Capital',
      issuerDomain: 'ultracapital.xyz',
      verified: true,
    },
    {
      code: 'yETH',
      issuer: 'GDYQNEF2UWTK4L6HITMT53MZ6F5QWO3Q4UVE6SCGC4OMEQIZQQDERQFD',
      name: 'Ultra Stellar ETH',
      issuerName: 'Ultra Capital',
      issuerDomain: 'ultracapital.xyz',
      verified: true,
    },
    {
      code: 'BTC',
      issuer: 'GDPJALI4AZKUU2W426U5WKMAT6CN3AJRPIIRYR2YM54TL2GDWO5O2MZM',
      name: 'Bitcoin',
      issuerName: 'Ultra Capital',
      issuerDomain: 'ultracapital.xyz',
      verified: true,
    },
    {
      code: 'ETH',
      issuer: 'GBFXOHVAS43OIWNIO7XLRJAHT3BICFEIKOJLZVXNT572MISM4CMGSOCC',
      name: 'Ethereum',
      issuerName: 'Ultra Capital',
      issuerDomain: 'ultracapital.xyz',
      verified: true,
    },
    {
      code: 'XRP',
      issuer: 'GBXRPL45NPHCVMFFAYZVUVFFVKSIZ362ZXFP7I2ETNQ3QKZMFLPRDTD5',
      name: 'XRP',
      issuerName: 'Fchain',
      issuerDomain: 'fchain.io',
      verified: true,
    },
    {
      code: 'SHX',
      issuer: 'GDSTRSHXHGJ7ZIVRBXEYE5Q74XUVCUSEKEBR7UCHEUUEK72N7I7KJ6JH',
      name: 'Stronghold SHx',
      issuerName: 'Stronghold',
      issuerDomain: 'stronghold.co',
      verified: true,
    },
    {
      code: 'MOBI',
      issuer: 'GA6HCMBLTZS5VYYBCATRBRZ3BZJMAFUDKYYF6AH6MVCMGWMRDNSWJPIH',
      name: 'Mobius',
      issuerName: 'Mobius',
      issuerDomain: 'mobius.network',
      verified: true,
    },
    {
      code: 'AFR',
      issuer: 'GBX6YI45VU7WNAAKA3RBFDR3I3UKNFHTJPQ5F6KOOKSGYIAM4TRQN54W',
      name: 'Afreum',
      issuerName: 'Afreum',
      issuerDomain: 'afreum.com',
      verified: true,
    },
    {
      code: 'TFT',
      issuer: 'GBOVQKJYHXRR3DX6NOX2RRYFRCUMSADGDESTDNBDS6CDVLGVESRTAC47',
      name: 'ThreeFold Token',
      issuerName: 'ThreeFold',
      issuerDomain: 'threefold.io',
      verified: true,
    },
    {
      code: 'LSP',
      issuer: 'GAB7STHVD5BDH3EEYXPI3OM7PCS4V443PYB5FNT6CFGJVPDLMKDM24WK',
      name: 'Lumenswap',
      issuerName: 'Lumenswap',
      issuerDomain: 'lumenswap.io',
      verified: true,
    },
    {
      code: 'KALE',
      issuer: 'GBDVX4VELCDSQ54KQJYTNHXAHFLBCA77ZY2USQBM4CSHTTV7DME7KALE',
      name: 'KALE',
      issuerName: 'KALEpail',
      issuerDomain: 'kalepail.com',
      verified: true,
    },
    {
      code: 'BRL',
      issuer: 'GDVKY2GU2DRXWTBEYJJWSFXIGBZV6AZNBVVSUHEPZI54LIS6BA7DVVSP',
      name: 'Brazilian Real',
      issuerName: 'NTokens',
      issuerDomain: 'ntokens.com',
      verified: false,
    },
    {
      code: 'VELO',
      issuer: 'GDM4RQUQQUVSKQA7S6EM7XBZP3FCGH4Q7CL6TABQ7B2BEJ5ERARM2M5M',
      name: 'Velo',
      issuerName: 'Velo',
      issuerDomain: '',
      verified: false,
    },
  ],
  testnet: [
    NATIVE,
    {
      code: 'USDC',
      issuer: 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5',
      name: 'USD Coin',
      issuerName: 'Circle',
      issuerDomain: 'centre.io',
      verified: true,
    },
    {
      code: 'EURC',
      issuer: 'GB3Q6QDZYTHWT7E5PVS3W7FUT5GVAFC5KSZFFLPU25GO7VTC3NM2ZTVO',
      name: 'Euro Coin',
      issuerName: 'Circle',
      issuerDomain: 'circle.com',
      verified: true,
    },
    {
      code: 'USDB',
      issuer: 'GCQSSIMOW5OCGULZATDXKU5MOJBOMFX6G65X6CXZDQ7AIB3SKFUZ67NX',
      name: 'USD BlindPay',
      issuerName: 'BlindPay',
      issuerDomain: '',
      verified: true,
    },
  ],
  futurenet: [NATIVE],
};

const REGISTRY_TTL_MS = 60 * 60 * 1000;

const registryCache = new Map<StellarNetwork, { at: number; assets: RegistryAsset[] }>();

/**
 * The Cosmos Pay asset registry for a network: live from api.cosmospay.lat
 * (primary source, read with the shared public key), else the bundled copy.
 *
 * @param network - Network config.
 * @returns Assets, verified first.
 */
export async function getRegistry(network: NetworkConfig): Promise<RegistryAsset[]> {
  const cached = registryCache.get(network.id);
  if (cached && Date.now() - cached.at < REGISTRY_TTL_MS) {
    return cached.assets;
  }

  let assets = BUNDLED[network.id];
  let live = false;
  // The live registry is the primary source; the bundled copy only covers an
  // unreachable gateway. Any ledger's key may read any ledger's registry.
  const apiKey =
    (await cosmosApiKey(network.id)) || (await cosmosApiKey(network.id === 'mainnet' ? 'testnet' : 'mainnet'));
  if (apiKey && network.id !== 'futurenet') {
    try {
      const response = await fetch(
        `${COSMOS_API}/v1/assets?network=${network.id === 'mainnet' ? 'public' : 'testnet'}`,
        { headers: { apikey: apiKey } },
      );
      if (response.ok) {
        const body = (await response.json()) as {
          version?: number;
          data?: RegistryAsset[];
        };
        if (Array.isArray(body.data) && (body.version ?? 0) >= BUNDLED_REGISTRY_VERSION) {
          assets = body.data.map((asset) =>
            asset.issuer === null ? { ...NATIVE, ...asset, issuerName: 'Stellar' } : asset,
          );
          live = true;
        }
      }
    } catch {
      // Gateway unreachable (CORS, offline…): keep the bundled registry.
    }
  }

  // A bundled fallback is retried after a minute rather than held for an hour.
  registryCache.set(network.id, {
    at: live ? Date.now() : Date.now() - REGISTRY_TTL_MS + 60_000,
    assets,
  });
  return assets;
}

/**
 * Registry entry for an asset held by the account, if Cosmos Pay knows it.
 *
 * @param registry - Registry for the network.
 * @param code - Asset code.
 * @param issuer - Issuer (null for XLM).
 * @returns The entry.
 */
export const findAsset = (registry: RegistryAsset[], code: string, issuer: string | null) =>
  registry.find((asset) => asset.code === code && asset.issuer === issuer);

/**
 * CAIP-19 id used to price an asset. Prices only exist on mainnet, so test
 * network copies (e.g. Circle's testnet USDC) are estimated with the mainnet
 * asset of the same code and organization.
 *
 * @param code - Asset code.
 * @param issuer - Issuer (null for XLM).
 * @param network - Network id.
 * @param registry - Registry for the network.
 * @returns The id, or null when there's no market price.
 */
export function pricingAssetId(
  code: string,
  issuer: string | null,
  network: StellarNetwork,
  registry: RegistryAsset[],
): string | null {
  if (issuer === null) {
    return XLM_ASSET_ID;
  }
  if (network === 'mainnet') {
    return classicAssetId(code, issuer);
  }
  const entry = findAsset(registry, code, issuer);
  const mainnet = entry?.verified
    ? BUNDLED.mainnet.find((candidate) => candidate.code === code && candidate.issuerName === entry.issuerName)
    : undefined;
  return mainnet?.issuer ? classicAssetId(mainnet.code, mainnet.issuer) : null;
}

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

const MAX_IMAGE_DATA_URL = 60_000;

const imageCache = new Map<string, Promise<string | null>>();

/**
 * Downloads an image once (per snap session) as a data URL.
 *
 * @param url - Image URL.
 * @returns The data URL, or null if it can't be fetched.
 */
function loadImage(url: string): Promise<string | null> {
  let pending = imageCache.get(url);
  if (!pending) {
    // Skip oversized logos (some favicons are 300 KB+): they bloat every screen.
    pending = getImageData(url)
      .then((data) => (data.length <= MAX_IMAGE_DATA_URL ? data : null))
      .catch(() => null);
    imageCache.set(url, pending);
  }
  return pending;
}

/**
 * Official token logo. MetaMask's token icon CDN has the Stellar assets it
 * lists; testnet copies of mainnet assets (e.g. Circle's testnet USDC) reuse
 * the mainnet logo of the same code and organization.
 *
 * @param asset - Registry asset.
 * @returns Logo data URL or null.
 */
async function tokenLogo(asset: RegistryAsset): Promise<string | null> {
  const mainnet =
    BUNDLED.mainnet.find((candidate) => candidate.code === asset.code && candidate.issuer === asset.issuer) ??
    BUNDLED.mainnet.find((candidate) => candidate.code === asset.code && candidate.issuerName === asset.issuerName);
  if (!mainnet?.issuer) {
    return null;
  }
  return loadImage(
    `https://static.cx.metamask.io/api/v2/tokenIcons/assets/stellar/pubnet/asset/${mainnet.code}-${mainnet.issuer}.png`,
  );
}

/**
 * Logo of the organization behind the issuer, for the corner badge.
 *
 * @param asset - Registry asset.
 * @returns Logo data URL or null.
 */
function issuerLogo(asset: RegistryAsset): Promise<string | null> {
  const domain = ISSUER_LOGO_DOMAINS[asset.issuerName] ?? asset.issuerDomain;
  return domain ? loadImage(`https://icon.horse/icon/${domain}`) : Promise.resolve(null);
}

/**
 * MetaMask-style avatar for an asset: official logo + issuer badge. Unknown or
 * unverified assets get initials and the Stellar network badge.
 *
 * @param code - Asset code.
 * @param issuer - Issuer (null for XLM).
 * @param registry - Registry for the network.
 * @param size - Avatar size.
 * @returns SVG markup.
 */
export async function assetAvatar(
  code: string,
  issuer: string | null,
  registry: RegistryAsset[],
  size = 40,
): Promise<string> {
  if (issuer === null) {
    return tokenAvatar(stellarLogoDataUrl(), null, size);
  }
  const entry = findAsset(registry, code, issuer);
  if (!entry?.verified) {
    return tokenAvatar(svgDataUrl(assetIcon(code)), stellarLogoDataUrl(), size);
  }
  const [logo, company] = await Promise.all([tokenLogo(entry), issuerLogo(entry)]);
  if (logo) {
    return tokenAvatar(logo, company ?? stellarLogoDataUrl(), size);
  }
  // No logo for the asset itself: show its company's logo instead of initials.
  return company
    ? tokenAvatar(company, null, size)
    : tokenAvatar(svgDataUrl(assetIcon(code)), stellarLogoDataUrl(), size);
}
