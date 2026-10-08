import { Keypair } from '@stellar/stellar-sdk/base';

import { ValidationError } from '@/domain/errors';
import { assertAccountCanSwap, assertSwapRequest, assertSwapTransaction, SwapMismatchError } from '@/domain/swap';
import { horizonAccount, quote, randomAddress, swapTransaction, USDC, XLM } from '@test/unit/fixtures';

const fieldsOf = (fn: () => void) => {
  try {
    fn();
  } catch (error) {
    if (error instanceof ValidationError) {
      return error.fields;
    }
    throw error;
  }
  return null;
};

describe('assertSwapRequest', () => {
  it('accepts a positive amount between two assets', () => {
    expect(fieldsOf(() => assertSwapRequest({ from: XLM, to: USDC, amount: '10' }))).toBeNull();
  });

  it('rejects the same asset on both sides', () => {
    expect(fieldsOf(() => assertSwapRequest({ from: USDC, to: USDC, amount: '1' }))).toHaveProperty('to');
  });

  it.each(['0', '-1', 'abc', '1.12345678', ''])('rejects amount %j', (amount) => {
    expect(fieldsOf(() => assertSwapRequest({ from: XLM, to: USDC, amount }))).toHaveProperty('amount');
  });
});

describe('assertAccountCanSwap', () => {
  const address = randomAddress();

  it('needs an activated account', () => {
    expect(fieldsOf(() => assertAccountCanSwap(null, { from: XLM, to: USDC, amount: '1' }, 'Testnet'))).toHaveProperty(
      'amount',
    );
  });

  it('keeps the XLM reserve out of the spendable balance', () => {
    // 100 XLM with one trustline: 1.5 XLM reserved.
    const account = horizonAccount(address, { xlm: '100', usdc: '0' });
    expect(fieldsOf(() => assertAccountCanSwap(account, { from: XLM, to: USDC, amount: '98.5' }, 'T'))).toBeNull();
    expect(fieldsOf(() => assertAccountCanSwap(account, { from: XLM, to: USDC, amount: '98.6' }, 'T'))).toHaveProperty(
      'amount',
    );
  });

  it('needs a trustline for the asset bought', () => {
    const account = horizonAccount(address, { xlm: '100' });
    expect(fieldsOf(() => assertAccountCanSwap(account, { from: XLM, to: USDC, amount: '1' }, 'T'))).toHaveProperty(
      'to',
    );
  });
});

describe('assertSwapTransaction', () => {
  const keypair = Keypair.random();
  const address = keypair.publicKey();

  const mismatch = (tx: ReturnType<typeof swapTransaction>, overrides = {}) => {
    try {
      assertSwapTransaction(tx, quote(overrides), address);
      return null;
    } catch (error) {
      if (error instanceof SwapMismatchError) {
        return error.reason;
      }
      throw error;
    }
  };

  it('accepts exactly the reviewed swap', () => {
    expect(mismatch(swapTransaction(address))).toBeNull();
  });

  it('accepts a fee lower than quoted', () => {
    expect(mismatch(swapTransaction(address, { feeAmount: '0.1' }))).toBeNull();
  });

  it.each([
    ['another source account', () => swapTransaction(randomAddress()), 'source'],
    ['the fee to another wallet', () => swapTransaction(address, { feeWallet: randomAddress() }), 'fee wallet'],
    ['a fee above the quote', () => swapTransaction(address, { feeAmount: '0.16' }), 'fee amount'],
    ['two fee payments', () => swapTransaction(address, { extraFee: true }), 'operations'],
    ['a fee that is not a payment', () => swapTransaction(address, { feeAsPathPayment: true }), 'fee operation'],
    ['proceeds sent elsewhere', () => swapTransaction(address, { destination: randomAddress() }), 'destination'],
    ['a lower minimum received', () => swapTransaction(address, { destMin: '9.2' }), 'minimum received'],
    ['more sold than quoted', () => swapTransaction(address, { sendAmount: '9.9' }), 'send amount'],
  ])('refuses %s', (_label, build, reason) => {
    expect(mismatch(build())).toBe(reason);
  });

  it('refuses a fee the quote never announced', () => {
    expect(mismatch(swapTransaction(address), { fee: { amount: '0', bps: 0, wallet: null } })).toBe('fee wallet');
  });
});
