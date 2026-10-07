const { installSnap } = require('@metamask/snaps-jest');
const { Keypair } = require('@stellar/stellar-sdk/base');
const { Wallet } = require('ethers');

// Fresh wallets, so accounts are never pre-funded on the public networks.
const install = (options = {}) =>
  installSnap({
    options: {
      secretRecoveryPhrase: Wallet.createRandom().mnemonic.phrase,
      locale: 'es',
      ...options,
    },
  });

const rendered = (response) => JSON.stringify(response.getInterface().content);

describe('home page', () => {
  it('shows balance, network selector and the Send / Receive / Fund buttons', async () => {
    const { onHomePage } = await install();
    const home = await onHomePage();
    const content = rendered(home);

    // MetaMask-style header: "Cuenta 1 ⌄" + address pill, network filter pill.
    expect(content).toContain('"name":"go-accounts"');
    expect(content).toContain('Cuenta 1');
    expect(content).toContain('"type":"Avatar"');
    expect(content).toContain('"color":"muted"');
    // No "Assets" tile next to Send / Receive.
    expect(content).not.toContain('"name":"go-assets"');
    expect(content).toContain('"name":"go-networks"');
    expect(content).toContain('Red: Stellar Testnet');
    expect(content).toContain('Enviar');
    expect(content).toContain('Recibir');
    expect(content).toContain('Fondear');
    // USD estimate (MetaMask price API); plain XLM only if prices are unreachable.
    expect(content).toMatch(/USD 0,00|0 XLM/u);
    // MetaMask-style action tiles and the "add funds" hero for new accounts.
    expect(content).toContain('rx=\\"12\\"');
    expect(content).toContain('Deposita fondos en tu cuenta Stellar');
    expect(content).toContain('Agregar fondos');
    // Unfunded test account: Fund goes straight to Friendbot.
    expect(content).toContain('"name":"friendbot"');
  });

  it.each([
    ['en', 'Send', 'Receive', 'Fund'],
    ['en_GB', 'Send', 'Receive', 'Fund'],
    ['pt_BR', 'Enviar', 'Receber', 'Adicionar'],
    ['fr', 'Send', 'Receive', 'Fund'],
  ])('follows the MetaMask language (%s)', async (locale, send, receive, fund) => {
    const { onHomePage } = await install({ locale });
    const content = rendered(await onHomePage());
    expect(content).toContain(`"${send}"`);
    expect(content).toContain(`"${receive}"`);
    expect(content).toContain(`"${fund}"`);
  });

  it('masks balances when "hide balances" is on in MetaMask', async () => {
    const { onHomePage } = await install({ hideBalances: true });
    expect(rendered(await onHomePage())).toMatch(/USD ••••••|•••••• XLM/u);
  });

  it('switches between the Tokens and Activity tabs', async () => {
    const { onHomePage } = await install();
    const home = await onHomePage();
    expect(rendered(home)).toContain('"name":"tab-activity"');

    await home.getInterface().clickElement('tab-activity');
    const content = rendered(home);
    expect(content).toContain('"name":"tab-tokens"');
    expect(content).not.toContain('"name":"tab-activity"');
  });

  it('adds, switches and removes accounts', async () => {
    const { onHomePage, request } = await install();
    const home = await onHomePage();
    const first = (await request({ method: 'stellar_getAddress' })).response.result.address;

    await home.getInterface().clickElement('go-accounts');
    await home.getInterface().clickElement('add-account');
    expect(rendered(home)).toContain('Cuenta añadida');
    expect(rendered(home)).toContain('Cuenta 2');
    // Switching back and forth through the account list.
    await home.getInterface().clickElement('go-accounts');
    await home.getInterface().clickElement('select-account:0');
    expect((await request({ method: 'stellar_getAddress' })).response.result.address).toBe(first);
    await home.getInterface().clickElement('go-accounts');
    await home.getInterface().clickElement('select-account:1');
    const second = (await request({ method: 'stellar_getAddress' })).response.result.address;
    expect(second).not.toBe(first);

    await home.getInterface().clickElement('go-accounts');
    const list = rendered(home);
    expect(list).toContain('"name":"select-account:0"');
    expect(list).toContain('"name":"account-menu:1"');
    expect(list).toContain('"type":"Avatar"');
    await home.getInterface().clickElement('account-menu:1');
    expect(rendered(home)).toContain(second);
    await home.getInterface().clickElement('remove-account:1');
    expect(rendered(home)).toContain('¿Eliminar Cuenta 2?');
    await home.getInterface().clickElement('confirm-remove-account:1');
    expect(rendered(home)).toContain('Cuenta eliminada');

    // Back on account 1; account 2 is no longer usable by dApps.
    expect((await request({ method: 'stellar_getAddress' })).response.result.address).toBe(first);
    expect(
      await request({ method: 'stellar_getAddress', params: { accountIndex: 1 } }),
    ).toRespondWithError(expect.objectContaining({ code: -32602 }));

    // Adding again restores the same account (same keys, same funds).
    await home.getInterface().clickElement('go-accounts');
    await home.getInterface().clickElement('add-account');
    expect((await request({ method: 'stellar_getAddress' })).response.result.address).toBe(second);
  });

  it('renames accounts', async () => {
    const { onHomePage, request } = await install();
    const home = await onHomePage();
    await home.getInterface().clickElement('go-accounts');
    await home.getInterface().clickElement('account-menu:0');
    await home.getInterface().typeInField('name', 'Ahorros');
    await home.getInterface().clickElement('rename:0');

    expect(rendered(home)).toContain('Cuenta renombrada');
    expect(rendered(home)).toContain('"alt":"Ahorros"');
    const { response } = await request({ method: 'stellar_getAccounts' });
    expect(response.result.accounts[0].name).toBe('Ahorros');
  });

  it('lets the user close notifications', async () => {
    const { onHomePage } = await install();
    const home = await onHomePage();
    await home.getInterface().clickElement('go-accounts');
    await home.getInterface().clickElement('add-account');
    expect(rendered(home)).toContain('Cuenta añadida');
    await home.getInterface().clickElement('dismiss');
    expect(rendered(home)).not.toContain('Cuenta añadida');
  });

  it('uses full-width drawn buttons instead of logo-stamped footers', async () => {
    const { onHomePage } = await install();
    const home = await onHomePage();
    // "Agregar fondos" is a full-width pill inside the hero card.
    let content = rendered(home);
    expect(content).not.toContain('"type":"Footer"');
    expect(content).toContain('"alt":"Agregar fondos"');
    expect(content).toContain('width=\\"1000\\"');
    await home.getInterface().clickElement('go-accounts');
    content = rendered(home);
    expect(content).not.toContain('"type":"Footer"');
    expect(content).toContain('"alt":"Agregar cuenta"');
  });

  it('never lets the last account be removed', async () => {
    const { onHomePage } = await install();
    const home = await onHomePage();
    await home.getInterface().clickElement('go-accounts');
    await home.getInterface().clickElement('account-menu:0');
    expect(rendered(home)).toContain('Necesitas al menos una cuenta');
  });

  it('shows a QR code and the address on Receive', async () => {
    const { onHomePage, request } = await install();
    const { response } = await request({ method: 'stellar_getAddress' });
    const home = await onHomePage();

    await home.getInterface().clickElement('go-receive');
    const content = rendered(home);
    expect(content).toContain('<svg');
    expect(content).toContain(response.result.address);

    await home.getInterface().clickElement('back');
    expect(rendered(home)).toContain('"name":"go-send"');
  });

  it('switches network from the dropdown and persists it', async () => {
    const { onHomePage, request } = await install();
    const home = await onHomePage();

    await home.getInterface().clickElement('go-networks');
    expect(rendered(home)).toContain('"name":"select-network:futurenet"');
    await home.getInterface().clickElement('select-network:mainnet');
    const content = rendered(home);
    expect(content).toContain('Red: Stellar Mainnet');
    // No Friendbot on mainnet: Fund explains how to buy XLM instead.
    expect(content).toContain('"name":"go-fund"');

    const { response } = await request({ method: 'stellar_getNetwork' });
    expect(response.result.network).toBe('mainnet');

    await home.getInterface().clickElement('go-fund');
    expect(rendered(home)).toContain('exchange');
  });
});

const live = process.env.STELLAR_LIVE === '1' ? describe : describe.skip;

live('testnet end-to-end (STELLAR_LIVE=1)', () => {
  it('funds with Friendbot and sends a payment using only the snap UI', async () => {
    const { onHomePage } = await install();
    const home = await onHomePage();

    await home.getInterface().clickElement('friendbot');
    expect(rendered(home)).toContain('Cuenta fondeada');
    // Funded: no more Fund tile or hero; the Assets tile appears instead.
    const funded = rendered(home);
    expect(funded).not.toContain('"name":"friendbot"');
    expect(funded).not.toContain('Agregar fondos');
    // Token list: official Stellar row, plus the "add asset" entry point.
    expect(funded).toContain('Stellar Lumens');
    // Testnet XLM is valued in USD using the mainnet price.
    expect(funded).toMatch(/USD [0-9.]+,[0-9]{2}/u);
    // Two wide, centered tiles once funded.
    expect(funded).toContain('width=\\"156\\"');
    expect(funded).toContain('"name":"go-assets"');

    const destination = Keypair.random().publicKey();
    await home.getInterface().clickElement('go-send');
    // MetaMask's card selector for the asset, not a browser <select>.
    expect(rendered(home)).toContain('"type":"Selector"');
    expect(rendered(home)).not.toContain('"type":"Dropdown"');
    const form = home.getInterface();
    await form.typeInField('destination', destination);
    await home.getInterface().typeInField('amount', '2,5');
    await home.getInterface().typeInField('memo', 'snap e2e');
    await home.getInterface().clickElement('review');

    const review = rendered(home);
    expect(review).toContain('Revisa el envío');
    expect(review).toContain('2,5 XLM');
    expect(review).toContain('Cuenta nueva');

    await home.getInterface().clickElement('confirm-send');
    const sent = rendered(home);
    expect(sent).toContain('Pago enviado');

    await home.getInterface().clickElement('back');
    expect(rendered(home)).toContain('Stellar Lumens');

    await home.getInterface().clickElement('tab-activity');
    const activity = rendered(home);
    expect(activity).toContain('Enviado');
    expect(activity).toContain('-2,5 XLM');
    expect(activity).toContain('Cuenta creada');

    // Trustlines: add the popular testnet USDC, then remove it.
    const USDC = 'USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
    await home.getInterface().clickElement('tab-tokens');
    await home.getInterface().clickElement('go-assets');
    const picker = rendered(home);
    // Cosmos Pay registry: issuer name instead of address, official logo inside the SVG.
    expect(picker).toContain('Circle');
    expect(picker).toContain('BlindPay');
    expect(picker).toContain('data:image/png;base64');
    expect(picker).not.toContain('Una trustline permite');
    await home.getInterface().clickElement(`add-trust:${USDC}`);
    const trustReview = rendered(home);
    expect(trustReview).toContain('Añadir USDC');
    expect(trustReview).toContain('Circle');
    await home.getInterface().clickElement('confirm-trust');
    expect(rendered(home)).toContain('Activo añadido');
    // Held USDC shows in the token list with its issuer, not its address.
    const withUsdc = rendered(home);
    expect(withUsdc).toContain('USD Coin');
    expect(withUsdc).toContain('Circle');
    // Ordered by value: XLM (worth USD) above the empty USDC trustline.
    expect(withUsdc.indexOf('"alt":"Stellar Lumens"')).toBeLessThan(withUsdc.indexOf('"alt":"USD Coin"'));
    // "change · issuer", and a flat 0,00% when there is no movement.
    expect(withUsdc).toContain(' · Circle');
    expect(withUsdc).toMatch(/>0,00%</u);

    await home.getInterface().clickElement('go-assets');
    await home.getInterface().clickElement(`remove-trust:${USDC}`);
    expect(rendered(home)).toContain('Eliminar USDC');
    await home.getInterface().clickElement('confirm-trust');
    expect(rendered(home)).toContain('Activo eliminado');

    const horizon = await fetch(`https://horizon-testnet.stellar.org/accounts/${destination}`);
    const account = await horizon.json();
    expect(account.balances.find((b) => b.asset_type === 'native').balance).toBe('2.5000000');
  }, 120_000);
});
