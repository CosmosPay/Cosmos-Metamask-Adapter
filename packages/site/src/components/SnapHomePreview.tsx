import { lazy, Suspense } from 'react';
import { useHydrated } from '@/hooks/useHydrated';
import type { AccountSnapshot } from '@/types';

/** The windows, with the snap's art, QR code and strings they draw with: their own chunk. */
const PreviewWindows = lazy(() =>
  import('@/components/SnapPreviewWindows').then((module) => ({ default: module.PreviewWindows })),
);

/**
 * The snap's Home and Receive pages as MetaMask shows them. Decorative; the
 * account card below carries the same data accessibly.
 *
 * The windows are drawn once the page runs in the browser: their art follows
 * the site theme, which the prerender can't know. The box keeps its size
 * meanwhile, so nothing shifts, and the windows rise into it as before; off
 * screen, they rise once it scrolls into view (`.reveal`).
 */
export function SnapHomePreview({ account }: { account: AccountSnapshot | null }) {
  const hydrated = useHydrated();
  return (
    <div className="preview reveal" aria-hidden="true">
      {hydrated ? (
        <Suspense fallback={null}>
          <PreviewWindows account={account} />
        </Suspense>
      ) : null}
    </div>
  );
}
