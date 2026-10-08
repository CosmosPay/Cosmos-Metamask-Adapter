import { NETWORKS } from '@/config/networks';
import { t } from '@/i18n';
import { accountName, refreshAccountNames } from '@/wallet/accountNames';
import { getKeypair, ImportError, keypairFromImport } from '@/wallet/keyring';
import { addAccount, getState, importAccount, removeAccount, renameAccount, updateState } from '@/wallet/state';
import { readString, show } from '@/home/interface';
import type { Routes } from '@/home/router';
import { AccountMenu } from '@/home/screens/AccountMenuScreen';
import { Accounts } from '@/home/screens/AccountsScreen';
import { ImportAccount } from '@/home/screens/ImportAccountScreen';
import { ConfirmRemoveAccount } from '@/home/screens/RemoveAccountScreen';
import { accountRows } from '@/home/viewModels/accounts';
import { showMain } from '@/home/controllers/main';

const indexOf = (arg: string) => Number(arg);

async function openAccounts(id: string) {
  const state = await getState();
  const network = NETWORKS[state.network];
  const rows = await accountRows(network, state.accounts);
  await show(id, <Accounts rows={rows} selected={state.selectedAccount} />);
}

async function openAccountMenu(id: string, index: number) {
  const state = await getState();
  if (!state.accounts.includes(index)) {
    await openAccounts(id);
    return;
  }
  await show(
    id,
    <AccountMenu
      index={index}
      address={(await getKeypair(index)).publicKey()}
      selected={state.selectedAccount === index}
      removable={state.accounts.length > 1}
    />,
  );
}

/**
 * Imports a secret key or recovery phrase typed in the import form.
 *
 * @param id - Interface id.
 * @param values - Form values.
 */
async function submitImport(id: string, values: Record<string, unknown>) {
  const secret = readString(values, 'secret');
  const accountNumber = Number(readString(values, 'accountNumber') || '1');
  let keypair;
  try {
    keypair = await keypairFromImport(secret, accountNumber);
  } catch (error) {
    const reason = error instanceof ImportError ? error.reason : 'phrase';
    await show(id, <ImportAccount error={t(`import.error.${reason}`)} />);
    return;
  }

  const { accounts } = await getState();
  const existing = await Promise.all(accounts.map(async (index) => (await getKeypair(index)).publicKey()));
  if (existing.includes(keypair.publicKey())) {
    await show(id, <ImportAccount error={t('import.error.duplicate')} />);
    return;
  }

  const index = await importAccount(keypair.secret());
  await refreshAccountNames();
  await showMain(id, {
    severity: 'success',
    title: t('import.done.title'),
    text: t('import.done.text', { name: accountName(index) }),
  });
}

export const accountRoutes: Routes = {
  clicks: {
    'go-accounts': async ({ id }) => openAccounts(id),
    'account-menu': async ({ id, arg }) => openAccountMenu(id, indexOf(arg)),
    'select-account': async ({ id, arg }) => {
      const index = indexOf(arg);
      const { accounts } = await getState();
      if (accounts.includes(index)) {
        await updateState({ selectedAccount: index });
      }
      await showMain(id);
    },
    'add-account': async ({ id }) => {
      const index = await addAccount();
      await showMain(id, {
        severity: 'success',
        title: t('accounts.added.title'),
        text: t('accounts.added.text', { name: accountName(index) }),
      });
    },
    'go-import': async ({ id }) => show(id, <ImportAccount />),
    'remove-account': async ({ id, arg }) => {
      const index = indexOf(arg);
      await show(id, <ConfirmRemoveAccount index={index} address={(await getKeypair(index)).publicKey()} />);
    },
    'confirm-remove-account': async ({ id, arg }) => {
      const index = indexOf(arg);
      await removeAccount(index);
      await showMain(id, {
        severity: 'info',
        title: t('accounts.removed.title'),
        text: t('accounts.removed.text', { name: accountName(index) }),
      });
    },
  },
  forms: {
    'rename-form': async ({ id, arg, values }) => {
      const index = indexOf(arg);
      await renameAccount(index, readString(values, 'name'));
      await refreshAccountNames();
      await showMain(id, {
        severity: 'success',
        title: t('accounts.renamed.title'),
        text: t('accounts.renamed.text', { name: accountName(index) }),
      });
    },
    'import-form': async ({ id, values }) => submitImport(id, values),
  },
};
