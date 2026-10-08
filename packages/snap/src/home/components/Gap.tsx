import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Image } from '@metamask/snaps-sdk/jsx';

import { spacer } from '@/ui/graphics/icons';

/** Breathing room between details and the action buttons. */
export const Gap: SnapComponent<{ size?: number }> = ({ size }) => <Image src={spacer(size ?? 28)} alt="" />;
