const { installSnap } = require('@metamask/snaps-jest');
const {
  Account,
  Asset,
  Keypair,
  Networks,
  Operation,
  TransactionBuilder,
} = require('@stellar/stellar-sdk/base');

// Official SEP-0005 test vector 1.
// https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0005.md
const SRP = 'illness spike retreat truth genius clock brain pass fit cave bargain toe';
const ACCOUNT_0 = 'GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6';
const ACCOUNT_1 = 'GBAW5XGWORWVFE2XTJYDTLDHXTY2Q2MO73HYCGB3XMFMQ562Q2W2GJQX';

const install = () => installSnap({ options: { secretRecoveryPhrase: SRP } });

describe('stellar_getAddress', () => {
  it('derives SEP-0005 addresses', async () => {
    const { request, onHomePage } = await install();

    expect(await request({ method: 'stellar_getAddress' })).toRespondWith({
      address: ACCOUNT_0,
    });

    // Account #2 must be added by the user before dApps can use it.
    expect(
      await request({ method: 'stellar_getAddress', params: { accountIndex: 1 } }),
    ).toRespondWithError(expect.objectContaining({ code: -32602 }));

    const home = await onHomePage();
    await home.getInterface().clickElement('go-accounts');
    await home.getInterface().clickElement('add-account');

    expect(
      await request({ method: 'stellar_getAddress', params: { accountIndex: 1 } }),
    ).toRespondWith({ address: ACCOUNT_1 });
    // The newly added account becomes the default for dApps.
    expect(await request({ method: 'stellar_getAddress' })).toRespondWith({ address: ACCOUNT_1 });

    const accounts = await request({ method: 'stellar_getAccounts' });
    expect(accounts.response.result).toEqual({
      selectedAccount: 1,
      accounts: [
        { index: 0, name: 'Account 1', address: ACCOUNT_0 },
        { index: 1, name: 'Account 2', address: ACCOUNT_1 },
      ],
    });
  });

  it('rejects invalid params', async () => {
    const { request } = await install();
    const response = await request({
      method: 'stellar_getAddress',
      params: { accountIndex: -1 },
    });
    expect(response).toRespondWithError(expect.objectContaining({ code: -32602 }));
  });
});

describe('stellar_signTransaction', () => {
  const buildTx = () =>
    new TransactionBuilder(new Account(ACCOUNT_0, '100'), {
      fee: '100',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: ACCOUNT_1,
          asset: Asset.native(),
          amount: '12.5',
        }),
      )
      .setTimeout(0)
      .build();

  it('signs after user approval', async () => {
    const { request } = await install();
    const tx = buildTx();

    const response = request({
      method: 'stellar_signTransaction',
      params: { xdr: tx.toXDR(), network: 'testnet' },
    });
    const ui = await response.getInterface();
    await ui.ok();
    const result = await response;

    const { signedXdr } = result.response.result;
    const signed = TransactionBuilder.fromXDR(signedXdr, Networks.TESTNET);
    expect(signed.signatures).toHaveLength(1);
    const keypair = Keypair.fromPublicKey(ACCOUNT_0);
    expect(keypair.verify(signed.hash(), signed.signatures[0].signature)).toBe(true);
  });

  it('fails when the user rejects', async () => {
    const { request } = await install();
    const response = request({
      method: 'stellar_signTransaction',
      params: { xdr: buildTx().toXDR(), network: 'testnet' },
    });
    const ui = await response.getInterface();
    await ui.cancel();
    expect(await response).toRespondWithError(expect.objectContaining({ code: 4001 }));
  });

  it('rejects garbage XDR', async () => {
    const { request } = await install();
    const response = await request({
      method: 'stellar_signTransaction',
      params: { xdr: 'not-xdr' },
    });
    expect(response).toRespondWithError(expect.objectContaining({ code: -32602 }));
  });
});

describe('stellar_signMessage', () => {
  it('produces a verifiable SEP-53 signature', async () => {
    const { request } = await install();
    const response = request({
      method: 'stellar_signMessage',
      params: { message: 'Hola Stellar' },
    });
    const ui = await response.getInterface();
    await ui.ok();
    const { address, signature } = (await response).response.result;

    expect(address).toBe(ACCOUNT_0);
    expect(
      Keypair.fromPublicKey(ACCOUNT_0).verifyMessage(
        'Hola Stellar',
        Buffer.from(signature, 'base64'),
      ),
    ).toBe(true);
  });
});

describe('stellar_sendPayment', () => {
  it('validates the destination', async () => {
    const { request } = await install();
    const response = await request({
      method: 'stellar_sendPayment',
      params: { destination: 'GABC', amount: '1' },
    });
    expect(response).toRespondWithError(expect.objectContaining({ code: -32602 }));
  });
});
