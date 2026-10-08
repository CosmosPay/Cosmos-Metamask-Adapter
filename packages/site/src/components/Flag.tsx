import type { ReactNode } from 'react';
import type { Language } from '@/i18n';

const US_STRIPES = [0, 2.154, 4.308, 6.462, 8.615, 10.77, 12.92];
const US_STARS = [
  [1.7, 1.5],
  [4.2, 1.5],
  [6.7, 1.5],
  [2.95, 3],
  [5.45, 3],
  [1.7, 4.5],
  [4.2, 4.5],
  [6.7, 4.5],
  [2.95, 6],
  [5.45, 6],
];

/**
 * Same flags as cosmospay.lat: Spanish and Portuguese use Argentina and Brazil,
 * the Latin American markets the product is for; Chinese and Hindi use China
 * and India. Drawn inline because Windows renders flag emoji as plain letters.
 */
const FLAGS: Record<Language, ReactNode> = {
  en: (
    <>
      <rect width="20" height="14" fill="#fff" />
      {US_STRIPES.map((y) => (
        <rect key={y} y={y} width="20" height="1.077" fill="#B22234" />
      ))}
      <rect width="8.4" height="7.54" fill="#3C3B6E" />
      <g fill="#fff">
        {US_STARS.map(([cx, cy]) => (
          <circle key={`${cx},${cy}`} cx={cx} cy={cy} r="0.48" />
        ))}
      </g>
    </>
  ),
  es: (
    <>
      <rect width="20" height="14" fill="#74ACDF" />
      <rect y="4.66" width="20" height="4.67" fill="#fff" />
      <circle cx="10" cy="7" r="1.5" fill="#F6B40E" />
    </>
  ),
  pt: (
    <>
      <rect width="20" height="14" fill="#009C3B" />
      <polygon points="10,1.4 18.6,7 10,12.6 1.4,7" fill="#FFDF00" />
      <circle cx="10" cy="7" r="2.6" fill="#002776" />
    </>
  ),
  fr: (
    <>
      <rect width="20" height="14" fill="#fff" />
      <rect width="6.7" height="14" fill="#0055A4" />
      <rect x="13.3" width="6.7" height="14" fill="#EF4135" />
    </>
  ),
  de: (
    <>
      <rect width="20" height="14" fill="#FFCE00" />
      <rect width="20" height="4.66" fill="#000" />
      <rect y="4.66" width="20" height="4.66" fill="#DD0000" />
    </>
  ),
  // China: the official star layout mapped onto this 20×14 grid, the small stars pointing at the big one.
  zh: (
    <>
      <rect width="20" height="14" fill="#DE2910" />
      <g fill="#FFDE00">
        <polygon points="3.33,1.45 3.79,2.87 5.28,2.87 4.08,3.74 4.54,5.16 3.33,4.28 2.13,5.16 2.59,3.74 1.38,2.87 2.87,2.87" />
        <polygon points="6.09,1.76 6.41,1.38 6.14,0.96 6.6,1.15 6.92,0.77 6.89,1.26 7.35,1.45 6.87,1.57 6.83,2.06 6.57,1.64" />
        <polygon points="7.32,2.9 7.77,2.68 7.69,2.19 8.04,2.54 8.49,2.32 8.26,2.76 8.61,3.12 8.12,3.03 7.89,3.47 7.81,2.98" />
        <polygon points="7.35,4.7 7.84,4.69 7.98,4.22 8.15,4.69 8.64,4.67 8.25,4.98 8.41,5.44 8.01,5.16 7.61,5.46 7.75,4.99" />
        <polygon points="6.14,5.86 6.6,6.05 6.92,5.67 6.89,6.16 7.35,6.35 6.87,6.47 6.83,6.96 6.57,6.54 6.09,6.66 6.41,6.28" />
      </g>
    </>
  ),
  // India: saffron, white and green, with the Ashoka Chakra (its spokes are too fine to show at this size).
  hi: (
    <>
      <rect width="20" height="14" fill="#fff" />
      <rect width="20" height="4.67" fill="#FF9933" />
      <rect y="9.33" width="20" height="4.67" fill="#138808" />
      <circle cx="10" cy="7" r="1.75" fill="none" stroke="#000080" strokeWidth="0.4" />
      <circle cx="10" cy="7" r="0.35" fill="#000080" />
    </>
  ),
};

/** The flag shown next to a language. Decorative: the language name or code goes beside it. */
export function Flag({ language }: { language: Language }) {
  return (
    <svg className="flag" viewBox="0 0 20 14" aria-hidden="true">
      {FLAGS[language]}
    </svg>
  );
}
