import cosmosPay from '@/assets/brand/cosmos-pay.svg?raw';

/**
 * Brand kit assets (the logo), cleaned from the Illustrator exports. They paint with `currentColor`, so each placement picks
 * its brand color through CSS `color`.
 */
const BRAND_SVGS = { cosmosPay };

type BrandSvgProps = {
  name: keyof typeof BRAND_SVGS;
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
