import { Keypair } from '@stellar/stellar-sdk/base';

import { getKeypair, ImportError, keypairFromImport } from '@/wallet/keyring';
import { IMPORTED_BASE } from '@/wallet/walletModel';
import { MemoryStateStore, useStateStore } from '@/wallet/stateStore';

// Official SEP-0005 test vectors.
const PHRASE_12 = 'illness spike retreat truth genius clock brain pass fit cave bargain toe';
const PHRASE_12_ACCOUNTS = [
  'GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6',
  'GBAW5XGWORWVFE2XTJYDTLDHXTY2Q2MO73HYCGB3XMFMQ562Q2W2GJQX',
];
const PHRASE_24 =
  'bench hurt jump file august wise shallow faculty impulse spring exact slush thunder author capable act festival slice deposit sauce coconut afford frown better';
const PHRASE_24_ACCOUNT_0 = 'GC3MMSXBWHL6CPOAVERSJITX7BH76YU252WGLUOM5CJX3E7UCYZBTPJQ';

const reason = async (promise: Promise<unknown>) =>
  promise.then(
    () => 'ok',
    (error: unknown) => (error instanceof ImportError ? error.reason : `unexpected: ${String(error)}`),
  );

describe('keypairFromImport', () => {
  it.each(PHRASE_12_ACCOUNTS.map((address, index) => [index + 1, address]))(
    'derives SEP-0005 account %i of a 12-word phrase',
    async (accountNumber, address) => {
      expect((await keypairFromImport(PHRASE_12, accountNumber as number)).publicKey()).toBe(address);
    },
  );

  it('derives a 24-word phrase', async () => {
    expect((await keypairFromImport(PHRASE_24)).publicKey()).toBe(PHRASE_24_ACCOUNT_0);
  });

  it('tolerates case and extra whitespace in a phrase', async () => {
    const messy = `  ${PHRASE_12.toUpperCase().split(' ').join('   \n')}  `;
    expect((await keypairFromImport(messy)).publicKey()).toBe(PHRASE_12_ACCOUNTS[0]);
  });

  it('accepts a secret key, in any case', async () => {
    const keypair = Keypair.random();
    expect((await keypairFromImport(` ${keypair.secret().toLowerCase()} `)).publicKey()).toBe(keypair.publicKey());
  });

  it('rejects a secret key with a bad checksum', async () => {
    const secret = Keypair.random().secret();
    const tampered = `${secret.slice(0, -1)}${secret.endsWith('A') ? 'B' : 'A'}`;
    expect(await reason(keypairFromImport(tampered))).toBe('secret');
  });

  it.each([['not a phrase'], ['illness spike retreat truth genius clock brain pass fit cave bargain bargain'], ['']])(
    'rejects an invalid phrase: %j',
    async (input) => {
      expect(await reason(keypairFromImport(input))).toBe('phrase');
    },
  );

  it.each([0, -1, 1001, 1.5])('rejects account number %p', async (accountNumber) => {
    expect(await reason(keypairFromImport(PHRASE_12, accountNumber))).toBe('account');
  });
});

describe('getKeypair', () => {
  it('reads imported accounts from the state store', async () => {
    const keypair = Keypair.random();
    const previous = useStateStore(
      new MemoryStateStore({ accounts: [0, IMPORTED_BASE], imported: { [IMPORTED_BASE]: keypair.secret() } }),
    );
    try {
      expect((await getKeypair(IMPORTED_BASE)).publicKey()).toBe(keypair.publicKey());
      await expect(getKeypair(IMPORTED_BASE + 1)).rejects.toThrow('Unknown imported account');
    } finally {
      useStateStore(previous);
    }
  });
});
