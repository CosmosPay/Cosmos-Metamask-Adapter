import { lazy, Suspense, type ComponentType } from 'react';
import { ASTRONAUT_VIEWBOXES, type AstronautPath, type AstronautPose } from '@/components/illustrations/astronautPoses';
import { useHydrated } from '@/hooks/useHydrated';

/** The drawing in the page's ink: lines in `currentColor`, the white details in the background color. */
function Drawing({ pose, paths }: { pose: AstronautPose; paths: AstronautPath[] }) {
  return (
    <svg viewBox={ASTRONAUT_VIEWBOXES[pose]} fill="currentColor" focusable="false">
      {paths.map(({ d, hole }, index) => (
        <path key={index} d={d} className={hole ? 'astronaut-hole' : undefined} />
      ))}
    </svg>
  );
}

const drawing = (pose: AstronautPose, load: () => Promise<{ paths: AstronautPath[] }>) =>
  lazy(async () => {
    const { paths } = await load();
    return { default: () => <Drawing pose={pose} paths={paths} /> };
  });

/** Each pose in its own chunk, so a page downloads only the poses it shows. */
const DRAWINGS: Record<AstronautPose, ComponentType> = {
  thumbsUp: drawing('thumbsUp', () => import('@/components/illustrations/poses/thumbsUp')),
};

/**
 * The Cosmos astronaut, as decoration beside a section. The prerendered page
 * holds only its box (sized by the pose, so nothing shifts); the drawing loads
 * once the page runs, which keeps every page's HTML light.
 */
export function Astronaut({ pose, className }: { pose: AstronautPose; className?: string }) {
  const hydrated = useHydrated();
  const Drawn = DRAWINGS[pose];
  const [, , width, height] = ASTRONAUT_VIEWBOXES[pose].split(' ');
  return (
    <div
      className={['astronaut', className].filter(Boolean).join(' ')}
      style={{ aspectRatio: `${width} / ${height}` }}
      aria-hidden="true"
    >
      {hydrated ? (
        <Suspense fallback={null}>
          <Drawn />
        </Suspense>
      ) : null}
    </div>
  );
}
