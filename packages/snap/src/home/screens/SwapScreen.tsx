import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Field, Form, Input, Row, Section, Text } from '@metamask/snaps-sdk/jsx';

import { t } from '@/i18n';
import { AssetField, Gap, PillButton, ScreenHeader } from '@/home/components';
import type { AssetOption, FieldErrors, SwapEstimate } from '@/home/types';

export const Swap: SnapComponent<{
  from: AssetOption;
  to: AssetOption | null;
  /** Undefined keeps whatever is typed (live re-render while typing). */
  amount?: string | undefined;
  available: string;
  estimate?: SwapEstimate | undefined;
  errors?: FieldErrors | undefined;
}> = ({ from, to, amount, available, estimate, errors }) => (
  <Box>
    <ScreenHeader title={t('swap.title')} />
    <Form name="swap-form">
      <Text fontWeight="bold">{t('swap.from')}</Text>
      <AssetField name="pick-asset:swap-from" option={from} />
      <Field label={t('swap.amount', { available })} error={errors?.amount}>
        <Input name="amount" placeholder="0" value={amount} />
      </Field>
      <Text fontWeight="bold">{t('swap.to')}</Text>
      {to ? (
        <AssetField name="pick-asset:swap-to" option={to} />
      ) : (
        <Text color="alternative">{t('swap.noAssets')}</Text>
      )}
      {errors?.to ? <Text color="error">{errors.to}</Text> : null}
      {to && estimate ? (
        estimate.error ? (
          <Text color="error">{estimate.receive}</Text>
        ) : (
          <Section>
            <Row label={t('swap.youGet')}>
              <Text fontWeight="bold">{estimate.receive}</Text>
            </Row>
            {estimate.fee ? (
              <Row label={t('swap.fee')}>
                <Text color="alternative">{estimate.fee}</Text>
              </Row>
            ) : null}
          </Section>
        )
      ) : null}
      <Gap />
      {to ? (
        <PillButton name="review-swap" label={t('swap.review')} submit />
      ) : (
        <PillButton name="go-assets" label={t('trust.title')} />
      )}
    </Form>
  </Box>
);
