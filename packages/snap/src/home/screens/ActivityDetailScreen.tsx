import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Heading, Image, Link, Row, Section, Text } from '@metamask/snaps-sdk/jsx';

import type { NetworkConfig } from '@/config/networks';
import { formatAmount, formatStroops } from '@/domain/amounts';
import { formatDate, localizeNumber, t } from '@/i18n';
import type { HorizonPayment } from '@/services/horizon';
import { shorten } from '@/ui/format';
import { ScreenHeader } from '@/home/components';
import { describeActivity } from '@/home/viewModels/activity';

export const ActivityDetail: SnapComponent<{
  payment: HorizonPayment;
  address: string;
  network: NetworkConfig;
}> = ({ payment, address, network }) => {
  const item = describeActivity(payment, address);
  const fee = payment.transaction?.fee_charged;
  return (
    <Box>
      <ScreenHeader title={item.title} back="tab-activity" />
      <Box center>
        <Image src={item.icon} alt="" />
        <Heading size="lg">{item.value}</Heading>
        {item.sold ? <Text color="alternative">{`${item.sold} →`}</Text> : null}
      </Box>
      <Section>
        <Row label={t('activity.status')}>
          <Text color="success">{t('activity.completed')}</Text>
        </Row>
        <Row label={t('activity.date')}>
          <Text>{formatDate(payment.created_at)}</Text>
        </Row>
        {item.swap ? null : (
          <Row label={item.outgoing ? t('activity.to') : t('activity.from')}>
            <Text>{shorten(item.counterparty)}</Text>
          </Row>
        )}
        {item.memo ? (
          <Row label={t('activity.memo')}>
            <Text>{item.memo}</Text>
          </Row>
        ) : null}
        {fee ? (
          <Row label={t('activity.networkFee')}>
            <Text>{`${localizeNumber(formatAmount(formatStroops(BigInt(fee))))} XLM`}</Text>
          </Row>
        ) : null}
        <Row label={t('sent.transaction')}>
          <Text>{shorten(payment.transaction_hash)}</Text>
        </Row>
      </Section>
      <Link href={`${network.explorerUrl}/tx/${payment.transaction_hash}`}>{t('sent.explorer')}</Link>
    </Box>
  );
};
