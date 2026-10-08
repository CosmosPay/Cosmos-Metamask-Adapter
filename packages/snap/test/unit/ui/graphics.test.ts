import { identicon, spacer, wideRow } from '@/ui/graphics/icons';
import { qrSvg } from '@/ui/graphics/qr';

const A = 'GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6';
const B = 'GBAW5XGWORWVFE2XTJYDTLDHXTY2Q2MO73HYCGB3XMFMQ562Q2W2GJQX';

describe('identicon', () => {
  it('is deterministic per address and differs between addresses', () => {
    expect(identicon(A)).toBe(identicon(A));
    expect(identicon(A)).not.toBe(identicon(B));
    expect(identicon(A, 16)).toContain('width="16"');
  });
});

describe('wideRow', () => {
  it('escapes user text (account names, memos) as XML', () => {
    const svg = wideRow({ avatar: identicon(A), title: '<script>&', subtitle: '"memo"' });
    expect(svg).not.toContain('<script>');
    expect(svg).toContain('&#60;script&#62;&#38;');
  });

  it('draws at 1000 units wide by default and at a real width when asked', () => {
    expect(wideRow({ avatar: identicon(A), title: 't', subtitle: 's' })).toContain('width="1000" height="150"');
    expect(wideRow({ avatar: identicon(A), title: 't', subtitle: 's', displayWidth: 320 })).toContain(
      'width="320" height="48"',
    );
  });
});

describe('spacer', () => {
  it('is drawn full-width so MetaMask scales it to the requested height, not thousands of px', () => {
    const svg = spacer(28);
    const [, width, height] = svg.match(/width="(\d+)" height="(\d+)"/u) ?? [];
    // Rendered at ~336px wide, the height comes out at ~28px.
    expect(Math.round((Number(height) / Number(width)) * 336)).toBe(28);
  });
});

describe('qrSvg', () => {
  it('renders a rounded, round-dot QR with three finder patterns', () => {
    const svg = qrSvg(A);
    expect(svg).toMatch(/^<svg[^>]*width="200"/u);
    expect(svg.match(/<circle /gu)?.length).toBeGreaterThan(100);
    // 3 finder patterns × 3 nested rounded squares, plus the card.
    expect(svg.match(/<rect /gu)).toHaveLength(10);
    expect(qrSvg(A)).toBe(svg);
  });
});
