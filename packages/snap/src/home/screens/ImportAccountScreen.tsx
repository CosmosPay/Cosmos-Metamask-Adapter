import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Field, Form, Input, Text } from '@metamask/snaps-sdk/jsx';

import { t } from '@/i18n';
import { Gap, PillButton, ScreenHeader } from '@/home/components';

export const ImportAccount: SnapComponent<{ error?: string | undefined }> = ({ error }) => (
  <Box>
    <ScreenHeader title={t('import.title')} back="go-accounts" />
    <Form name="import-form">
      <Field label={t('import.secret')} error={error}>
        <Input name="secret" type="password" placeholder={t('import.secret.placeholder')} />
      </Field>
      <Field label={t('import.account')}>
        <Input name="accountNumber" type="number" placeholder="1" />
      </Field>
      <Text color="alternative" size="sm">
        {t('import.note')}
      </Text>
      <Gap />
      <PillButton name="import-account" label={t('import.submit')} submit />
    </Form>
  </Box>
);
