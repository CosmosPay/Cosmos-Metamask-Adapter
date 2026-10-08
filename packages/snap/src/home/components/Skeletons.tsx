import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Skeleton } from '@metamask/snaps-sdk/jsx';

import { ScreenHeader } from '@/home/components/ScreenHeader';

/** Placeholder rows shaped like the list that is loading. */
export const SkeletonRows: SnapComponent<{ count: number }> = ({ count }) => (
  <Box>
    {Array.from({ length: count }, () => (
      <Box direction="horizontal" crossAlignment="center">
        <Skeleton width={40} height={40} borderRadius="full" />
        <Box>
          <Skeleton width={140} height={14} />
          <Skeleton width={90} height={12} />
        </Box>
      </Box>
    ))}
  </Box>
);

/** Shown the instant a screen is opened, while its data loads. */
export const PageSkeleton: SnapComponent<{ title: string }> = ({ title }) => (
  <Box>
    <ScreenHeader title={title} />
    <SkeletonRows count={4} />
  </Box>
);

export const HomeSkeleton: SnapComponent = () => (
  <Box>
    <Box direction="horizontal" alignment="space-between">
      <Box>
        <Skeleton width={110} height={20} />
        <Skeleton width={90} height={12} />
      </Box>
    </Box>
    <Box center>
      <Skeleton width={170} height={36} />
      <Skeleton width={90} height={14} />
    </Box>
    <Box direction="horizontal" alignment="center">
      <Skeleton width={70} height={64} />
      <Skeleton width={70} height={64} />
      <Skeleton width={70} height={64} />
      <Skeleton width={70} height={64} />
    </Box>
    <SkeletonRows count={3} />
  </Box>
);
