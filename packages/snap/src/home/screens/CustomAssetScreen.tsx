import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Field, Form, Input } from '@metamask/snaps-sdk/jsx';

import { t } from '@/i18n';
import { PillButton, ScreenHeader } from '@/home/components';
import type { FieldErrors } from '@/home/types';

export const CustomAsset: SnapComponent<{
  errors?: FieldErrors | undefined;
  values?: { code: string; issuer: string } | undefined;
}> = ({ errors, values }) => (
  <Box>
    <Box>
      <ScreenHeader title={t('trust.otherAsset')} back="go-assets" />
      <Form name="trust-form">
        <Field label={t('trust.code')} error={errors?.code}>
          <Input name="code" placeholder="USDC" value={values?.code ?? ''} />
        </Field>
        <Field label={t('trust.issuer')} error={errors?.issuer}>
          <Input name="issuer" placeholder="G…" value={values?.issuer ?? ''} />
        </Field>
        <PillButton name="review-trust" label={t('send.review')} submit />
      </Form>
    </Box>
  </Box>
);
