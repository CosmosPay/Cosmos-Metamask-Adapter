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
 * the Latin American markets the product is for. Drawn inline because Windows
 * renders flag emoji as plain letters.
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
};

/** The flag shown next to a language. Decorative: the language name or code goes beside it. */
export function Flag({ language }: { language: Language }) {
  return (
    <svg className="flag" viewBox="0 0 20 14" aria-hidden="true">
      {FLAGS[language]}
    </svg>
  );
}
