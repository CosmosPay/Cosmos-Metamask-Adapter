import { BUNDLED_REGISTRY } from '@/services/assets';
import { cachedImageLoader, createAssetAvatar, issuerLogoUrl, tokenLogoUrl } from '@/ui/assetAvatar';
import { USDC_ISSUER } from '@test/unit/fixtures';

jest.mock('@metamask/snaps-sdk', () => ({ ...jest.requireActual('@metamask/snaps-sdk'), getImageData: jest.fn() }));

const testnet = BUNDLED_REGISTRY.testnet;
const LOGO = 'data:image/png;base64,TOKEN';
const COMPANY = 'data:image/png;base64,COMPANY';

describe('logo urls', () => {
  it("uses MetaMask's CDN with the mainnet counterpart, and the issuer's domain for the badge", () => {
    const usdc = testnet.find((asset) => asset.code === 'USDC');
    expect(usdc && tokenLogoUrl(usdc)).toMatch(/tokenIcons\/assets\/stellar\/pubnet\/asset\/USDC-GA5ZSEJY/u);
    expect(usdc && issuerLogoUrl(usdc)).toBe('https://icon.horse/icon/circle.com');
  });
});

describe('createAssetAvatar', () => {
  it('never downloads anything for XLM or unverified assets', async () => {
    const load = jest.fn();
    const avatar = createAssetAvatar(load);
    expect(await avatar('XLM', null, testnet)).toContain('<svg');
    expect(await avatar('SCAM', USDC_ISSUER, testnet)).toContain('<svg');
    expect(load).not.toHaveBeenCalled();
  });

  it('shows the official logo with the company badge', async () => {
    const avatar = createAssetAvatar(async (url) => (url.includes('tokenIcons') ? LOGO : COMPANY));
    const svg = await avatar('USDC', USDC_ISSUER, testnet);
    expect(svg).toContain(LOGO);
    expect(svg).toContain(COMPANY);
  });

  it("falls back to the company's logo when the asset has none", async () => {
    const svg = await createAssetAvatar(async (url) => (url.includes('tokenIcons') ? null : COMPANY))(
      'USDC',
      USDC_ISSUER,
      testnet,
    );
    expect(svg).toContain(COMPANY);
    expect(svg).not.toContain(LOGO);
  });
});

describe('cachedImageLoader', () => {
  it('downloads each url once and drops oversized or failing images', async () => {
    const download = jest.fn(async (url: string) => {
      if (url.endsWith('fail')) {
        throw new Error('404');
      }
      return url.endsWith('big') ? 'x'.repeat(70_000) : 'data:small';
    });
    const load = cachedImageLoader(download);

    expect(await load('https://a/small')).toBe('data:small');
    expect(await load('https://a/small')).toBe('data:small');
    expect(await load('https://a/big')).toBeNull();
    expect(await load('https://a/fail')).toBeNull();
    expect(download).toHaveBeenCalledTimes(3);
  });
});
