import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Heading, Icon, Row, Section, Text } from '@metamask/snaps-sdk/jsx';

import { formatAmount, toStroops } from '@/domain/amounts';
import type { SwapQuote } from '@/domain/swap';
import { localizeNumber, t } from '@/i18n';
import { swapProviderName } from '@/services/swap';
import { Gap, PillButton, ScreenHeader } from '@/home/components';

export const SwapReview: SnapComponent<{ quote: SwapQuote }> = ({ quote }) => {
  const rate = toStroops(quote.swapAmount) > 0n ? Number(quote.estimated) / Number(quote.swapAmount) : 0;
  const route = [quote.from, ...quote.path, quote.to].map((asset) => asset.code).join(' → ');
  return (
    <Box>
      <ScreenHeader title={t('swap.review.title')} back="edit-swap" />
      <Box center>
        <Heading size="lg">{`${localizeNumber(formatAmount(quote.sendAmount))} ${quote.from.code}`}</Heading>
        <Icon name="arrow-down" color="muted" />
        <Heading size="lg">{`≈ ${localizeNumber(formatAmount(quote.estimated))} ${quote.to.code}`}</Heading>
      </Box>
      <Section>
        <Row label={t('swap.rate')}>
          <Text>{`1 ${quote.from.code} ≈ ${localizeNumber(rate.toFixed(7).replace(/\.?0+$/u, ''))} ${quote.to.code}`}</Text>
        </Row>
        <Row label={t('swap.minimum')}>
          <Text>{`${localizeNumber(formatAmount(quote.minimum))} ${quote.to.code}`}</Text>
        </Row>
        <Row label={t('swap.slippage')}>
          <Text>{`${localizeNumber((quote.slippageBps / 100).toFixed(2))}%`}</Text>
        </Row>
        {toStroops(quote.fee.amount) > 0n ? (
          <Row label={t('swap.fee')}>
            <Text>{`${localizeNumber(formatAmount(quote.fee.amount))} ${quote.from.code} (${localizeNumber((quote.fee.bps / 100).toFixed(2))}%)`}</Text>
          </Row>
        ) : null}
        <Row label={t('swap.route')}>
          <Text>{quote.path.length === 0 ? `${route} · ${t('swap.direct')}` : route}</Text>
        </Row>
        <Row label={t('swap.provider')}>
          <Text>{swapProviderName(quote)}</Text>
        </Row>
      </Section>
      <Gap />
      <PillButton name="confirm-swap" label={t('swap.confirm')} />
      <PillButton name="edit-swap" label={t('review.edit')} kind="secondary" />
    </Box>
  );
};
