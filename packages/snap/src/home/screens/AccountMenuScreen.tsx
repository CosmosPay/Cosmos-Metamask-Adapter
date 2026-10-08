import type { SnapComponent } from '@metamask/snaps-sdk/jsx';
import { Box, Button, Copyable, Field, Form, Image, Input, Text } from '@metamask/snaps-sdk/jsx';

import { t } from '@/i18n';
import { identicon } from '@/ui/graphics/icons';
import { accountName } from '@/wallet/accountNames';
import { PillButton, ScreenHeader } from '@/home/components';

export const AccountMenu: SnapComponent<{
  index: number;
  address: string;
  selected: boolean;
  removable: boolean;
}> = ({ index, address, selected, removable }) => {
  const content = (
    <Box>
      <ScreenHeader title={accountName(index)} back="go-accounts" />
      <Box center>
        <Image src={identicon(address, 64)} alt="" />
      </Box>
      <Form name={`rename-form:${index}`}>
        <Field label={t('accounts.rename')}>
          <Input name="name" value={accountName(index)} placeholder={t('accounts.name', { n: index + 1 })} />
          <Button type="submit" name={`rename:${index}`}>
            {t('accounts.save')}
          </Button>
        </Field>
      </Form>
      <Text color="alternative">{t('accounts.copyHint')}</Text>
      <Copyable value={address} />
      <Button name={`remove-account:${index}`} variant="destructive" disabled={!removable}>
        {t('accounts.remove')}
      </Button>
      {removable ? null : <Text color="alternative">{t('accounts.remove.last')}</Text>}
    </Box>
  );
  return selected ? (
    content
  ) : (
    <Box>
      {content}
      <PillButton name={`select-account:${index}`} label={t('accounts.menu.use')} />
    </Box>
  );
};
