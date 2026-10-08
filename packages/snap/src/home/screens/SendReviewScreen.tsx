import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Banner, Box, Heading, Row, Section, Text } from '@metamask/snaps-sdk/jsx';

import type { NetworkConfig } from '@/config/networks';
import { formatAmount, normalizeAmount } from '@/domain/amounts';
import { localizeNumber, t } from '@/i18n';
import { shorten } from '@/ui/format';
import { Gap, PillButton, ScreenHeader } from '@/home/components';
import type { SendForm } from '@/home/types';

export const Review: SnapComponent<{
  network: NetworkConfig;
  from: string;
  form: SendForm;
  assetLabel: string;
  feeXlm: string;
  createsAccount: boolean;
}> = ({ network, from, form, assetLabel, feeXlm, createsAccount }) => (
  <Box>
    <Box>
      <ScreenHeader title={t('review.title')} back="edit-send" />
      <Box center>
        <Heading size="lg">{`${localizeNumber(formatAmount(normalizeAmount(form.amount)))} ${assetLabel}`}</Heading>
      </Box>
      <Section>
        <Row label={t('review.network')}>
          <Text>{network.name}</Text>
        </Row>
        <Row label={t('review.from')}>
          <Text>{shorten(from)}</Text>
        </Row>
        <Row label={t('review.to')}>
          <Text>{shorten(form.destination.trim())}</Text>
        </Row>
        {form.memo.trim() ? (
          <Row label={t('review.memo')}>
            <Text>{form.memo.trim()}</Text>
          </Row>
        ) : null}
        <Row label={t('review.fee')}>
          <Text>{`${localizeNumber(feeXlm)} XLM`}</Text>
        </Row>
      </Section>
      {createsAccount ? (
        <Banner title={t('review.newAccount.title')} severity="info">
          <Text>{t('review.newAccount.text')}</Text>
        </Banner>
      ) : null}
      {network.id === 'mainnet' ? (
        <Banner title={t('review.mainnet.title')} severity="warning">
          <Text>{t('review.mainnet.text')}</Text>
        </Banner>
      ) : null}
    </Box>
    <Gap />
    <PillButton name="confirm-send" label={t('review.confirm')} />
    <PillButton name="edit-send" label={t('review.edit')} kind="secondary" />
  </Box>
);
