import cosmos from '@/assets/brand/cosmos.svg?raw';
import stellar from '@/assets/brand/stellar.svg?raw';
import stellarSnap from '@/assets/brand/stellar-snap.svg?raw';

/**
 * Brand assets, all painting with `currentColor` so each placement picks its
 * color through CSS `color`:
 * - `stellarSnap`: the project's wordmark, "Stellar Snap" outlined from the
 *   brand book's display face (Aeronaut), so it needs no webfont.
 * - `cosmos`: the main Cosmos logo, from the brand kit's Illustrator export.
 * - `stellar`: the SDF press kit logo (2026), converted from its vector PDF.
 *   Unused until Stellar's sponsorship is official (see Header).
 */
const BRAND_SVGS = { stellarSnap, cosmos, stellar };

type BrandName = keyof typeof BRAND_SVGS;

type BrandSvgProps = {
  name: BrandName;
  className?: string;
  /** Accessible name; omit for decorative uses. */
  label?: string;
};

/**
 * Inlines a brand SVG (inline, not `<img>`, so it inherits `color`). The markup
 * is our own bundled files, never user input, so innerHTML is safe here.
 */
export function BrandSvg({ name, className, label }: BrandSvgProps) {
  return (
    <span
      className={['brand-svg', className].filter(Boolean).join(' ')}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      dangerouslySetInnerHTML={{ __html: BRAND_SVGS[name] }}
    />
  );
}
