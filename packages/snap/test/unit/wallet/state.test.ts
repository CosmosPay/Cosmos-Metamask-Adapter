import { addAccount, getState, importAccount, removeAccount, renameAccount, updateState } from '@/wallet/state';
import { MemoryStateStore, useStateStore } from '@/wallet/stateStore';
import type { StateStore } from '@/wallet/stateStore';

describe('wallet state persistence', () => {
  let store: MemoryStateStore;
  let previous: StateStore;

  beforeEach(() => {
    store = new MemoryStateStore();
    previous = useStateStore(store);
  });

  afterEach(() => {
    useStateStore(previous);
  });

  it('persists every transition through the injected store', async () => {
    expect(await addAccount()).toBe(1);
    const imported = await importAccount('SECRET');
    await renameAccount(1, 'Ahorros');
    await updateState({ network: 'futurenet' });

    expect(await store.read()).toMatchObject({
      network: 'futurenet',
      accounts: [0, 1, imported],
      selectedAccount: imported,
      accountNames: { 1: 'Ahorros' },
      imported: { [imported]: 'SECRET' },
    });

    await removeAccount(imported);
    expect((await getState()).accounts).toEqual([0, 1]);
  });

  it('returns copies, so callers cannot mutate what is stored', async () => {
    const state = await getState();
    state.accounts.push(7);
    expect((await getState()).accounts).toEqual([0]);
  });
});
