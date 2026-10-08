import { qrSvg } from '@snap/src/ui/graphics/qr';
import { useMemo } from 'react';

/** Display size of the code, in CSS pixels. */
const SIZE = 200;

/**
 * The donation address as a QR code, drawn by the snap's own generator (dark
 * dots on a white card, so it scans in both themes). Donations loads it
 * lazily: the generator only ships to visitors who reach the section.
 */
export function DonationQr({ address, label }: { address: string; label: string }) {
  const src = useMemo(() => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrSvg(address, SIZE))}`, [address]);
  return <img src={src} alt={label} width={SIZE} height={SIZE} decoding="async" />;
}
