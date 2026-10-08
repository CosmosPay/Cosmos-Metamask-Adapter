import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Button, Heading, Icon } from '@metamask/snaps-sdk/jsx';

/** Back arrow + centered title. `back` is the button name to go back (default: home). */
export const ScreenHeader: SnapComponent<{ title: string; back?: string }> = ({ title, back }) => (
  <Box direction="horizontal" alignment="space-between">
    <Button name={back ?? 'back'}>
      <Icon name="arrow-left" />
    </Button>
    <Heading>{title}</Heading>
    <Box>{null}</Box>
  </Box>
);
