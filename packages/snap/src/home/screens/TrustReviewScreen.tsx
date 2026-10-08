import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Banner, Box, Heading, Image, Row, Section, Text } from '@metamask/snaps-sdk/jsx';

import type { NetworkConfig } from '@/config/networks';
import { localizeNumber, t } from '@/i18n';
import { shorten } from '@/ui/format';
import { Gap, PillButton, ScreenHeader } from '@/home/components';

export const TrustReview: SnapComponent<{
  network: NetworkConfig;
  code: string;
  issuer: string;
  issuerName: string | null;
  avatar: string;
  domain: string | null;
  remove: boolean;
  feeXlm: string;
}> = ({ network, code, issuer, issuerName, avatar, domain, remove, feeXlm }) => (
  <Box>
    <Box>
      <ScreenHeader title={t('trust.title')} back="go-assets" />
      <Box center>
        <Image src={avatar} alt={code} />
        <Heading>{remove ? t('trust.review.remove', { asset: code }) : t('trust.review.add', { asset: code })}</Heading>
      </Box>
      <Section>
        <Row label={t('review.network')}>
          <Text>{network.name}</Text>
        </Row>
        <Row label={t('trust.review.issuer')}>
          <Text>{issuerName ?? shorten(issuer)}</Text>
        </Row>
        {domain ? (
          <Row label={t('trust.review.domain')}>
            <Text>{domain}</Text>
          </Row>
        ) : null}
        <Row label={t('trust.review.reserve')}>
          <Text>{remove ? t('trust.review.reserve.free') : t('trust.review.reserve.lock')}</Text>
        </Row>
        <Row label={t('review.fee')}>
          <Text>{`${localizeNumber(feeXlm)} XLM`}</Text>
        </Row>
      </Section>
      {!remove && !issuerName ? (
        <Banner title={t('trust.review.unverified.title')} severity="warning">
          <Text>{t('trust.review.unverified.text')}</Text>
        </Banner>
      ) : null}
    </Box>
    <Gap />
    <PillButton
      name="confirm-trust"
      label={remove ? t('trust.confirm.remove') : t('trust.confirm.add')}
      kind={remove ? 'danger' : 'primary'}
    />
    <PillButton name="go-assets" label={t('common.back')} kind="secondary" />
  </Box>
);
