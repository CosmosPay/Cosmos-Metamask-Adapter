import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Spinner, Text } from '@metamask/snaps-sdk/jsx';

export const Loading: SnapComponent<{ text: string }> = ({ text }) => (
  <Box center>
    <Spinner />
    <Text alignment="center">{text}</Text>
  </Box>
);
