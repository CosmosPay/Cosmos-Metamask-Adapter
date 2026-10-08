import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Banner, Box, Copyable, Field, Form, Icon, Input, Row, Section, Text } from '@metamask/snaps-sdk/jsx';

import type { NetworkConfig } from '@/config/networks';
import { formatAmount, formatStroops } from '@/domain/amounts';
import type { TransactionSummary } from '@/domain/transactions';
import { localizeNumber, t } from '@/i18n';
import { shorten } from '@/ui/format';
import { Gap, PillButton, ScreenHeader } from '@/home/components';

export const SignForm: SnapComponent<{ error?: string | undefined }> = ({ error }) => (
  <Box>
    <ScreenHeader title={t('sign.title')} />
    <Text color="alternative">{t('sign.hint')}</Text>
    <Form name="sign-form">
      <Field label={t('sign.xdr')} error={error}>
        <Input name="xdr" placeholder="AAAA…" />
      </Field>
      <Gap />
      <PillButton name="review-sign" label={t('send.review')} submit />
    </Form>
  </Box>
);

export const SignReview: SnapComponent<TransactionSummary & { network: NetworkConfig; signer: string }> = ({
  network,
  signer,
  source,
  fee,
  memo,
  operations,
}) => (
  <Box>
    <ScreenHeader title={t('sign.review.title')} back="edit-sign" />
    {source === signer ? null : (
      <Banner title={t('dialog.sourceMismatch.title')} severity="warning">
        <Text>{t('dialog.sourceMismatch.text')}</Text>
      </Banner>
    )}
    <Section>
      <Row label={t('review.network')}>
        <Text>{network.name}</Text>
      </Row>
      <Row label={t('dialog.signer')}>
        <Text>{shorten(signer)}</Text>
      </Row>
      <Row label={t('dialog.source')}>
        <Text>{shorten(source)}</Text>
      </Row>
      <Row label={t('dialog.maxFee')}>
        <Text>{`${localizeNumber(formatAmount(formatStroops(BigInt(fee))))} XLM`}</Text>
      </Row>
      {memo ? (
        <Row label={t('dialog.memo')}>
          <Text>{memo}</Text>
        </Row>
      ) : null}
    </Section>
    {operations.map((operation, index) => (
      <Section>
        <Text fontWeight="bold">{`${index + 1}. ${operation.type}`}</Text>
        {operation.details.map(([label, value]) => (
          <Row label={label}>
            <Text>{value}</Text>
          </Row>
        ))}
      </Section>
    ))}
    <Gap />
    <PillButton name="sign-submit" label={t('sign.submit')} />
    <PillButton name="sign-only" label={t('sign.only')} kind="secondary" />
  </Box>
);

export const Signed: SnapComponent<{ xdr: string }> = ({ xdr }) => (
  <Box>
    <ScreenHeader title={t('sign.done.title')} />
    <Box center>
      <Icon name="check" color="primary" />
      <Text alignment="center">{t('sign.done.text')}</Text>
    </Box>
    <Copyable value={xdr} />
    <Gap />
    <PillButton name="back" label={t('common.done')} />
  </Box>
);
