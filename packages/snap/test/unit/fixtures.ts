import { Account, Asset, Keypair, Networks, Operation, TransactionBuilder } from '@stellar/stellar-sdk/base';
import type { Transaction } from '@stellar/stellar-sdk/base';

import type { SwapQuote } from '@/domain/swap';
import type { HorizonAccount, HorizonBalance } from '@/services/horizon';

export const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
export const FEE_WALLET = 'GARMB7W3FCR3GKIM3FLWVJASC2PUZ4VHUJZTNJVWWKNTCJNKO6TBCT76';
export const USDC = { code: 'USDC', issuer: USDC_ISSUER };
export const XLM = { code: 'XLM', issuer: null };

/** A Horizon account with the given balances (XLM first). */
export function horizonAccount(
  address: string,
  { xlm = '100', usdc }: { xlm?: string; usdc?: string } = {},
): HorizonAccount {
  const balances: HorizonBalance[] = [{ asset_type: 'native', balance: xlm } as HorizonBalance];
  if (usdc !== undefined) {
    balances.push({
      asset_type: 'credit_alphanum4',
      asset_code: 'USDC',
      asset_issuer: USDC_ISSUER,
      balance: usdc,
    } as HorizonBalance);
  }
  return { id: address, sequence: '1', subentry_count: usdc === undefined ? 0 : 1, balances } as HorizonAccount;
}

/** What the Cosmos Pay server quotes for 10 XLM → USDC (1.5% fee). */
export const quote = (overrides: Partial<SwapQuote> = {}): SwapQuote => ({
  provider: 'cosmos',
  from: XLM,
  to: USDC,
  sendAmount: '10',
  fee: { amount: '0.15', bps: 150, wallet: FEE_WALLET },
  swapAmount: '9.85',
  estimated: '9.28',
  minimum: '9.23',
  slippageBps: 50,
  path: [],
  ...overrides,
});

/** The transaction the server is supposed to build for {@link quote}. */
export function swapTransaction(
  source: string,
  {
    feeWallet = FEE_WALLET,
    feeAmount = '0.15',
    destination = source,
    destMin = '9.23',
    sendAmount = '9.85',
    extraFee = false,
    feeAsPathPayment = false,
  }: Partial<{
    feeWallet: string;
    feeAmount: string;
    destination: string;
    destMin: string;
    sendAmount: string;
    extraFee: boolean;
    feeAsPathPayment: boolean;
  }> = {},
): Transaction {
  const usdc = new Asset('USDC', USDC_ISSUER);
  const builder = new TransactionBuilder(new Account(source, '1'), {
    fee: '100',
    networkPassphrase: Networks.TESTNET,
  });
  const fee = feeAsPathPayment
    ? Operation.pathPaymentStrictSend({
        sendAsset: Asset.native(),
        sendAmount: feeAmount,
        destination: feeWallet,
        destAsset: Asset.native(),
        destMin: feeAmount,
      })
    : Operation.payment({ destination: feeWallet, asset: Asset.native(), amount: feeAmount });
  builder.addOperation(fee);
  if (extraFee) {
    builder.addOperation(Operation.payment({ destination: feeWallet, asset: Asset.native(), amount: '0.01' }));
  }
  return builder
    .addOperation(
      Operation.pathPaymentStrictSend({
        sendAsset: Asset.native(),
        sendAmount,
        destination,
        destAsset: usdc,
        destMin,
      }),
    )
    .setTimeout(0)
    .build();
}

export const randomAddress = () => Keypair.random().publicKey();
