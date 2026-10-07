const { installSnap } = require('@metamask/snaps-jest');
const {
  Account,
  Address,
  authorizeInvocation,
  hash,
  Keypair,
  nativeToScVal,
  Networks,
  Operation,
  StrKey,
  TransactionBuilder,
  xdr,
} = require('@stellar/stellar-sdk/base');
const { Wallet } = require('ethers');

const SRP = 'illness spike retreat truth genius clock brain pass fit cave bargain toe';
const ACCOUNT_0 = 'GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6';
const ACCOUNT_1 = 'GBAW5XGWORWVFE2XTJYDTLDHXTY2Q2MO73HYCGB3XMFMQ562Q2W2GJQX';
const CONTRACT = StrKey.encodeContract(hash('demo-token'));

const install = () => installSnap({ options: { secretRecoveryPhrase: SRP } });
const resultOf = async (response) => (await response).response.result;
const rendered = (ui) => JSON.stringify(ui.content);

/**
 * Approves (or cancels) the next dialog and returns the RPC response.
 *
 * @param pending - The pending request.
 * @param approve - Whether to approve.
 * @returns The ui and the response.
 */
async function answer(pending, approve = true) {
  const ui = await pending.getInterface();
  await (approve ? ui.ok() : ui.cancel());
  return { ui, response: await pending };
}

const transferInvocation = () =>
  new xdr.SorobanAuthorizedInvocation({
    function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
      new xdr.InvokeContractArgs({
        contractAddress: Address.fromString(CONTRACT).toScAddress(),
        functionName: 'transfer',
        args: [
          nativeToScVal(ACCOUNT_0, { type: 'address' }),
          nativeToScVal(ACCOUNT_1, { type: 'address' }),
          nativeToScVal(1234567n, { type: 'i128' }),
        ],
      }),
    ),
    subInvocations: [],
  });

describe('networks', () => {
  it('defaults to testnet and persists switches after approval', async () => {
    const { request } = await install();

    expect(await resultOf(request({ method: 'stellar_getNetwork' }))).toMatchObject({
      network: 'testnet',
      networkPassphrase: Networks.TESTNET,
      rpcUrl: 'https://soroban-testnet.stellar.org',
    });

    const { ui, response } = await answer(
      request({ method: 'stellar_switchNetwork', params: { network: 'futurenet' } }),
    );
    expect(rendered(ui)).toContain('Stellar Futurenet');
    expect(response.response.result.network).toBe('futurenet');
    expect((await resultOf(request({ method: 'stellar_getNetwork' }))).network).toBe('futurenet');
  });

  it('keeps the network when the user rejects the switch', async () => {
    const { request } = await install();
    const { response } = await answer(
      request({ method: 'stellar_switchNetwork', params: { network: 'mainnet' } }),
      false,
    );
    expect(response).toRespondWithError(expect.objectContaining({ code: 4001 }));
    expect((await resultOf(request({ method: 'stellar_getNetwork' }))).network).toBe('testnet');
  });

  it('accepts SEP-43 networkPassphrase and rejects unknown ones', async () => {
    const { request } = await install();
    expect(
      (await resultOf(
        request({ method: 'stellar_getNetwork', params: { networkPassphrase: Networks.PUBLIC } }),
      )).network,
    ).toBe('mainnet');
    expect(
      await request({ method: 'stellar_getNetwork', params: { networkPassphrase: 'nope' } }),
    ).toRespondWithError(expect.objectContaining({ code: -32602 }));
  });

  it('rejects an address that is not the selected account', async () => {
    const { request, onHomePage } = await install();
    const home = await onHomePage();
    await home.getInterface().clickElement('go-accounts');
    await home.getInterface().clickElement('add-account');
    await home.getInterface().clickElement('go-accounts');
    await home.getInterface().clickElement('select-account:0');
    expect(
      await request({ method: 'stellar_getAddress', params: { address: ACCOUNT_1 } }),
    ).toRespondWithError(expect.objectContaining({ code: -32602 }));
    expect(
      await request({
        method: 'stellar_getAddress',
        params: { address: ACCOUNT_1, accountIndex: 1 },
      }),
    ).toRespondWith({ address: ACCOUNT_1 });
  });
});

describe('Soroban transactions', () => {
  it('shows contract, function and arguments before signing', async () => {
    const { request } = await install();
    const tx = new TransactionBuilder(new Account(ACCOUNT_0, '1'), {
      fee: '100000',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.invokeContractFunction({
          contract: CONTRACT,
          function: 'transfer',
          args: [
            nativeToScVal(ACCOUNT_0, { type: 'address' }),
            nativeToScVal(ACCOUNT_1, { type: 'address' }),
            nativeToScVal(50n, { type: 'i128' }),
          ],
        }),
      )
      .setTimeout(0)
      .build();

    const { ui, response } = await answer(
      request({
        method: 'stellar_signTransaction',
        params: { xdr: tx.toXDR(), networkPassphrase: Networks.TESTNET },
      }),
    );
    const content = rendered(ui);
    expect(content).toContain('Soroban contract call');
    expect(content).toContain(CONTRACT);
    expect(content).toContain('transfer');
    expect(content).toContain(ACCOUNT_1);
    expect(response.response.result.signerAddress).toBe(ACCOUNT_0);
  });
});

describe('stellar_signAuthEntry', () => {
  it.each([
    ['CAP-71 (authV2, with address)', true],
    ['legacy', false],
  ])('produces a signature the Stellar SDK accepts (%s)', async (_name, authV2) => {
    const { request } = await install();
    let ui;

    const entry = await authorizeInvocation({
      authV2,
      invocation: transferInvocation(),
      networkPassphrase: Networks.TESTNET,
      publicKey: ACCOUNT_0,
      validUntilLedgerSeq: 999_999,
      signer: async (preimage) => {
        const pending = request({
          method: 'stellar_signAuthEntry',
          params: { authEntry: preimage.toXDR('base64'), network: 'testnet' },
        });
        const answered = await answer(pending);
        ui = answered.ui;
        const { signedAuthEntry, signerAddress } = answered.response.response.result;
        return { signature: Buffer.from(signedAuthEntry, 'base64'), publicKey: signerAddress };
      },
    });

    // authorizeInvocation verifies the signature against the payload itself;
    // reaching here means the snap signed exactly sha256(preimage).
    expect(entry).toBeDefined();
    const content = rendered(ui);
    expect(content).toContain('transfer');
    expect(content).toContain(CONTRACT);
    expect(content).toContain('1234567');
  });

  it('refuses entries built for another network', async () => {
    const { request } = await install();
    const preimage = xdr.HashIdPreimage.envelopeTypeSorobanAuthorization(
      new xdr.HashIdPreimageSorobanAuthorization({
        networkId: hash(Networks.PUBLIC),
        nonce: 1n,
        signatureExpirationLedger: 100,
        invocation: transferInvocation(),
      }),
    );
    const response = await request({
      method: 'stellar_signAuthEntry',
      params: { authEntry: preimage.toXDR('base64'), network: 'testnet' },
    });
    expect(response).toRespondWithError(expect.objectContaining({ code: -32602 }));
  });

  it('refuses non-authorization payloads', async () => {
    const { request } = await install();
    const response = await request({
      method: 'stellar_signAuthEntry',
      params: { authEntry: Buffer.from('hola').toString('base64') },
    });
    expect(response).toRespondWithError(expect.objectContaining({ code: -32602 }));
  });
});

describe('EVM address linking', () => {
  const wallet = Wallet.createRandom();

  it('verifies the EVM signature, co-signs and stores the link', async () => {
    const { request } = await install();
    const { message } = await resultOf(
      request({ method: 'stellar_getLinkMessage', params: { evmAddress: wallet.address } }),
    );
    const evmSignature = await wallet.signMessage(message);

    const { response } = await answer(
      request({
        method: 'stellar_linkEvmAddress',
        params: { evmAddress: wallet.address, evmSignature },
      }),
    );
    const link = response.response.result;
    expect(link.evmAddress).toBe(wallet.address.toLowerCase());
    expect(link.stellarAddress).toBe(ACCOUNT_0);
    expect(
      Keypair.fromPublicKey(ACCOUNT_0).verifyMessage(
        message,
        Buffer.from(link.stellarSignature, 'base64'),
      ),
    ).toBe(true);

    expect(await resultOf(request({ method: 'stellar_getLinkedAddresses' }))).toEqual([link]);
  });

  it('rejects a signature from a different EVM account', async () => {
    const { request } = await install();
    const { message } = await resultOf(
      request({ method: 'stellar_getLinkMessage', params: { evmAddress: wallet.address } }),
    );
    const evmSignature = await Wallet.createRandom().signMessage(message);
    const response = await request({
      method: 'stellar_linkEvmAddress',
      params: { evmAddress: wallet.address, evmSignature },
    });
    expect(response).toRespondWithError(expect.objectContaining({ code: -32602 }));
  });
});
