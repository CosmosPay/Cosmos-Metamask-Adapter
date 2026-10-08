import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Button, Icon, Section, Text } from '@metamask/snaps-sdk/jsx';

import type { Notice } from '@/home/types';

/** Notification with the close "X" in its top-right corner. */
export const NoticeBanner: SnapComponent<{ notice: Notice }> = ({ notice }) => {
  const icon = notice.severity === 'success' ? 'confirmation' : notice.severity === 'danger' ? 'danger' : 'info';
  const color = notice.severity === 'success' ? 'success' : notice.severity === 'danger' ? 'error' : 'primary';
  return (
    <Section>
      <Box direction="horizontal" alignment="space-between">
        <Box direction="horizontal">
          <Icon name={icon} color={color} />
          <Box>
            <Text fontWeight="bold">{notice.title}</Text>
            <Text color="alternative">{notice.text}</Text>
          </Box>
        </Box>
        <Button name="dismiss">
          <Icon name="close" />
        </Button>
      </Box>
    </Section>
  );
};
