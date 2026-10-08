import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Banner, Box, Heading, Icon, Link, Row, Text } from '@metamask/snaps-sdk/jsx';

import { t } from '@/i18n';
import { shorten } from '@/ui/format';
import { Gap, PillButton } from '@/home/components';

export const SentBody: SnapComponent<{
  amount: string;
  explorerUrl: string;
  hash: string;
  title?: string;
}> = ({ amount, explorerUrl, hash, title }) => (
  <Box>
    <Box center>
      <Icon name="check" color="primary" />
      <Heading>{title ?? t('sent.title')}</Heading>
      <Text alignment="center">{amount}</Text>
    </Box>
    <Row label={t('sent.transaction')}>
      <Text>{shorten(hash)}</Text>
    </Row>
    <Link href={explorerUrl}>{t('sent.explorer')}</Link>
  </Box>
);

export const Sent: SnapComponent<{
  amount: string;
  explorerUrl: string;
  hash: string;
  title?: string;
}> = (props) => (
  <Box>
    <SentBody {...props} />
    <Gap />
    <PillButton name="back" label={t('common.done')} />
  </Box>
);

export const Failed: SnapComponent<{ message: string; retry: string }> = ({ message, retry }) => (
  <Box>
    <Box>
      <Banner title={t('failed.title')} severity="danger">
        <Text>{message}</Text>
      </Banner>
    </Box>
    <Gap />
    <PillButton name={retry} label={t('failed.retry')} />
    <PillButton name="back" label={t('common.back')} kind="secondary" />
  </Box>
);
