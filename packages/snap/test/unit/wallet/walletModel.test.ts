import type { SnapState } from '@/wallet/walletModel';
import {
  IMPORTED_BASE,
  isImported,
  LastAccountError,
  MAX_ACCOUNT_NAME,
  normalizeState,
  withAccountName,
  withDerivedAccount,
  withImportedAccount,
  withoutAccount,
} from '@/wallet/walletModel';

const state = (overrides: Partial<SnapState> = {}): SnapState => ({ ...normalizeState(null), ...overrides });

describe('normalizeState', () => {
  it('starts a new wallet on testnet with account 0', () => {
    expect(normalizeState(null)).toEqual({
      network: 'testnet',
      links: [],
      accounts: [0],
      selectedAccount: 0,
      accountNames: {},
      imported: {},
    });
  });

  it('repairs a selection that points to a removed account', () => {
    expect(normalizeState({ accounts: [2, 5], selectedAccount: 9 }).selectedAccount).toBe(2);
  });

  it('drops an unknown network', () => {
    expect(normalizeState({ network: 'devnet' as never }).network).toBe('testnet');
  });
});

describe('withDerivedAccount', () => {
  it('reuses the lowest free index, so a removed account comes back with its funds', () => {
    const { state: next, index } = withDerivedAccount(state({ accounts: [0, 2] }));
    expect(index).toBe(1);
    expect(next.accounts).toEqual([0, 1, 2]);
    expect(next.selectedAccount).toBe(1);
  });

  it('never collides with imported ids', () => {
    const { index } = withDerivedAccount(state({ accounts: [0, IMPORTED_BASE] }));
    expect(index).toBe(1);
    expect(isImported(index)).toBe(false);
  });
});

describe('withImportedAccount', () => {
  it('stores the key under a fresh imported id and selects it', () => {
    const first = withImportedAccount(state(), 'SECRET-A');
    const second = withImportedAccount(first.state, 'SECRET-B');
    expect(first.index).toBe(IMPORTED_BASE);
    expect(second.index).toBe(IMPORTED_BASE + 1);
    expect(second.state.imported).toEqual({ [IMPORTED_BASE]: 'SECRET-A', [IMPORTED_BASE + 1]: 'SECRET-B' });
    expect(second.state.selectedAccount).toBe(IMPORTED_BASE + 1);
    expect(isImported(second.index)).toBe(true);
  });
});

describe('withoutAccount', () => {
  it('refuses to remove the last account', () => {
    expect(() => withoutAccount(state(), 0)).toThrow(LastAccountError);
  });

  it('moves the selection when the selected account goes', () => {
    const next = withoutAccount(state({ accounts: [0, 1], selectedAccount: 1 }), 1);
    expect(next.accounts).toEqual([0]);
    expect(next.selectedAccount).toBe(0);
  });

  it('keeps the name of a hidden derived account (it can come back)', () => {
    const next = withoutAccount(state({ accounts: [0, 1], accountNames: { 1: 'Ahorros' } }), 1);
    expect(next.accountNames).toEqual({ 1: 'Ahorros' });
  });

  it('erases the key and name of an imported account', () => {
    const { state: imported, index } = withImportedAccount(state(), 'SECRET');
    const named = withAccountName(imported, index, 'Ledger');
    const next = withoutAccount(named, index);
    expect(next.imported).toEqual({});
    expect(next.accountNames).toEqual({});
  });
});

describe('withAccountName', () => {
  it('trims and caps the name', () => {
    const next = withAccountName(state(), 0, `  ${'x'.repeat(40)}  `);
    expect(next.accountNames[0]).toHaveLength(MAX_ACCOUNT_NAME);
  });

  it('caps by characters, not UTF-16 units', () => {
    const next = withAccountName(state(), 0, '🚀'.repeat(30));
    expect(Array.from(next.accountNames[0] ?? '')).toHaveLength(MAX_ACCOUNT_NAME);
  });

  it('restores the default name when empty', () => {
    const named = withAccountName(state(), 0, 'Ahorros');
    expect(withAccountName(named, 0, '   ').accountNames).toEqual({});
  });
});
