import type { ReactNode } from 'react';
import type { FeatureIcon as FeatureIconName } from '@/content/home';

/** Line icons on a 24×24 grid, stroked with `currentColor` (sized and styled by `.feature-icon`). */
const PATHS: Record<FeatureIconName, ReactNode> = {
  // Two people: several accounts.
  accounts: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14.2a6.5 6.5 0 0 1 3 5.8" />
    </>
  ),
  // A paper plane.
  payments: <path d="M21 3 10 14M21 3l-7 18-4-7-7-4z" />,
  // Stacked layers: assets held side by side.
  assets: <path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5" />,
  // Arrows both ways.
  swaps: <path d="M4 8h14M14 4l4 4-4 4M20 16H6M10 12l-4 4 4 4" />,
  // A pen.
  soroban: <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16zM13.5 6.5l4 4" />,
  // Chain links.
  evm: (
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
  ),
};

/** A feature's icon. Decorative: the feature's title says what it is. */
export function FeatureIcon({ name }: { name: FeatureIconName }) {
  return (
    <svg className="feature-icon" viewBox="0 0 24 24" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}
