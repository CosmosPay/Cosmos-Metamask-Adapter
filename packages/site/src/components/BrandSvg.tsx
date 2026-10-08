import { CosmosLogo } from '@/components/logos/CosmosLogo';
import { StellarLogo } from '@/components/logos/StellarLogo';
import { StellarSnapLogo } from '@/components/logos/StellarSnapLogo';

/** The brand logos, as React components that paint with `currentColor` (each placement sets its color through CSS). */
const LOGOS = { stellarSnap: StellarSnapLogo, cosmos: CosmosLogo, stellar: StellarLogo };

type BrandName = keyof typeof LOGOS;

type BrandSvgProps = {
  name: BrandName;
  className?: string;
  /** Accessible name; omit for decorative uses. */
  label?: string;
};

/** A brand logo inline (not an `<img>`, so it inherits `color`), sized by its wrapper. */
export function BrandSvg({ name, className, label }: BrandSvgProps) {
  const Logo = LOGOS[name];
  return (
    <span
      className={['brand-svg', className].filter(Boolean).join(' ')}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <Logo />
    </span>
  );
}
