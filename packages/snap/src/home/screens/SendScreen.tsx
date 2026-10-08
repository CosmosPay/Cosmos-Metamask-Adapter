import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Field, Form, Input, Text } from '@metamask/snaps-sdk/jsx';

import type { NetworkConfig } from '@/config/networks';
import { formatStroops } from '@/domain/amounts';
import { assetKey, spendableStroops } from '@/domain/balances';
import { localizeNumber, t } from '@/i18n';
import type { HorizonAccount } from '@/services/horizon';
import { networkLabel } from '@/ui/format';
import { AssetField, Gap, PillButton, ScreenHeader } from '@/home/components';
import type { AssetOption, FieldErrors, SendForm } from '@/home/types';

export const Send: SnapComponent<{
  network: NetworkConfig;
  account: HorizonAccount;
  option: AssetOption;
  form: SendForm;
  errors?: FieldErrors | undefined;
}> = ({ network, account, option, form, errors }) => {
  const selected = account.balances.find((balance) => assetKey(balance) === form.asset) ?? account.balances[0];
  const available = selected ? localizeNumber(formatStroops(spendableStroops(account, selected))) : '0';

  return (
    <Box>
      <Box>
        <ScreenHeader title={t('send.title', { network: networkLabel(network.id) })} />
        <Form name="send-form">
          <Field label={t('send.destination')} error={errors?.destination}>
            <Input name="destination" placeholder="G…" value={form.destination} />
          </Field>
          <Text fontWeight="bold">{t('send.asset')}</Text>
          <AssetField name="pick-asset:send" option={option} />
          {errors?.assetCode ? <Text color="error">{errors.assetCode}</Text> : null}
          <Field label={t('send.amount', { available })} error={errors?.amount}>
            <Input name="amount" placeholder="0" value={form.amount} />
          </Field>
          <Field label={t('send.memo')} error={errors?.memo}>
            <Input name="memo" placeholder={t('send.memo.placeholder')} value={form.memo} />
          </Field>
          <Gap />
          <PillButton name="review" label={t('send.review')} submit />
        </Form>
      </Box>
    </Box>
  );
};
