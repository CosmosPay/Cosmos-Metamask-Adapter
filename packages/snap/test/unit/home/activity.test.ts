import { describeActivity } from '@/home/viewModels/activity';
import type { HorizonPayment } from '@/services/horizon';

const ME = 'GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6';
const OTHER = 'GBAW5XGWORWVFE2XTJYDTLDHXTY2Q2MO73HYCGB3XMFMQ562Q2W2GJQX';

const payment = (overrides: Partial<HorizonPayment>): HorizonPayment => ({
  id: '1',
  type: 'payment',
  created_at: '2026-10-07T12:00:00Z',
  transaction_hash: 'ab'.repeat(32),
  asset_type: 'native',
  amount: '2.5000000',
  ...overrides,
});

describe('describeActivity', () => {
  it('reads a plain payment as Sent / Received, with the memo as detail', () => {
    const sent = describeActivity(
      payment({ from: ME, to: OTHER, transaction: { memo_type: 'text', memo: 'rent', operation_count: 1 } }),
      ME,
    );
    expect(sent).toMatchObject({ title: 'Sent', detail: 'rent', value: '-2.5 XLM', outgoing: true });
    expect(describeActivity(payment({ from: OTHER, to: ME }), ME)).toMatchObject({
      title: 'Received',
      value: '+2.5 XLM',
    });
  });

  it("names a leg of a multi-operation transaction by the transaction's message", () => {
    const fee = describeActivity(
      payment({
        from: ME,
        to: OTHER,
        amount: '0.375',
        transaction: { memo_type: 'text', memo: 'Cosmos Swap Commission', operation_count: 2 },
      }),
      ME,
    );
    expect(fee.title).toBe('Cosmos Swap Commission');
  });

  it('reads a path payment back to ourselves as a swap, with what was sold', () => {
    const swap = describeActivity(
      payment({
        type: 'path_payment_strict_send',
        from: ME,
        to: ME,
        asset_type: 'credit_alphanum4',
        asset_code: 'USDC',
        amount: '23.2',
        source_amount: '25',
        source_asset_type: 'native',
        transaction: { memo_type: 'text', memo: 'Cosmos Swap Commission', operation_count: 2 },
      }),
      ME,
    );
    expect(swap).toMatchObject({ swap: true, outgoing: false, title: 'Swap', value: '+23.2 USDC', sold: '25 XLM' });
  });

  it('reads the funding of our account as "Account created"', () => {
    const created = describeActivity(
      payment({ type: 'create_account', funder: OTHER, account: ME, starting_balance: '10000' }),
      ME,
    );
    expect(created).toMatchObject({ title: 'Account created', value: '+10,000 XLM' });
  });
});
