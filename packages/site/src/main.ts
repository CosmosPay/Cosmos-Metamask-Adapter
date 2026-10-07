import { HybridStellarAdapter } from '@cosmospay/stellar-metamask-adapter';
import type { StellarNetwork } from '@cosmospay/stellar-metamask-adapter';
import {
  Address,
  authorizeInvocation,
  hash,
  nativeToScVal,
  StrKey,
  xdr,
} from '@stellar/stellar-sdk/base';

const adapter = new HybridStellarAdapter({
  snapId: import.meta.env.VITE_SNAP_ID ?? 'local:http://localhost:8080',
});

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const connectButton = $<HTMLButtonElement>('connect');
const networkSelect = $<HTMLSelectElement>('network');
const log = $<HTMLPreElement>('log');

let address = '';
let network: StellarNetwork = 'testnet';

function print(label: string, value: unknown) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  log.textContent = `${label}\n${text}`;
}

/** Runs an action, showing its result or SEP-43 error in the log. */
async function run(
  button: HTMLButtonElement | null,
  label: string,
  action: () => Promise<unknown>,
) {
  if (button) button.disabled = true;
  try {
    const result = (await action()) as { error?: { code: number; message: string } } | undefined;
    if (result?.error) {
      print(`Error ${result.error.code}: ${label}`, result.error.message);
    } else if (result !== undefined) {
      print(label, result);
    }
  } catch (error) {
    print(`Error: ${label}`, (error as Error).message ?? String(error));
  } finally {
    if (button) button.disabled = false;
  }
}

async function render() {
  const current = await adapter.getAddress();
  const details = await adapter.getNetworkDetails();
  address = current.address;
  network = (
    { PUBLIC: 'mainnet', TESTNET: 'testnet', FUTURENET: 'futurenet' } as const
  )[details.network as 'PUBLIC' | 'TESTNET' | 'FUTURENET'];

  networkSelect.value = network;
  $('address').textContent = address;
  $('backend').textContent =
    adapter.backend === 'official'
      ? 'MetaMask (soporte oficial de Stellar)'
      : 'Stellar Snap';

  $('balance').textContent = '—';
  $('fund').hidden = true;
  if (adapter.backend === 'snap') {
    const balance = await adapter.snap.getBalance({ network });
    const xlm = balance.balances.find((b) => b.asset_type === 'native');
    $('balance').textContent = balance.funded ? `${xlm?.balance ?? '0'} XLM` : 'Cuenta sin fondos';
    $('fund').hidden = network === 'mainnet' || balance.funded;
  }

  const { links } = await adapter.getLinkedAddresses();
  $('linked').textContent = links.map((link) => link.evmAddress).join(', ') || '—';
}

connectButton.addEventListener('click', () =>
  run(connectButton, 'Conectado', async () => {
    const result = await adapter.requestAccess();
    if (result.error) return result;
    for (const id of ['account', 'account-actions']) $(id).hidden = false;
    document.querySelectorAll<HTMLElement>('[data-connected]').forEach((el) => (el.hidden = false));
    networkSelect.disabled = false;
    connectButton.textContent = 'Conectado';
    adapter.onChange(() => void render());
    await render();
    return { address: result.address, backend: adapter.backend };
  }),
);

networkSelect.addEventListener('change', () =>
  run(null, 'Red cambiada', async () => {
    const result = await adapter.switchNetwork(networkSelect.value as StellarNetwork);
    await render();
    return result;
  }),
);

$('refresh').addEventListener('click', (e) =>
  run(e.currentTarget as HTMLButtonElement, 'Actualizado', async () => {
    await render();
    return $('balance').textContent;
  }),
);

$('fund').addEventListener('click', (e) =>
  run(e.currentTarget as HTMLButtonElement, 'Friendbot', async () => {
    const url =
      network === 'futurenet'
        ? `https://friendbot-futurenet.stellar.org/?addr=${address}`
        : `https://friendbot.stellar.org/?addr=${address}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Friendbot respondió ${response.status}`);
    await render();
    return 'Cuenta fondeada con XLM de prueba.';
  }),
);

$('link').addEventListener('click', (e) =>
  run(e.currentTarget as HTMLButtonElement, 'Cuentas vinculadas', async () => {
    const result = await adapter.linkEvmAddress();
    await render();
    return result;
  }),
);

$('auth').addEventListener('click', (e) =>
  run(e.currentTarget as HTMLButtonElement, 'Autorización Soroban firmada y verificada', async () => {
    const { networkPassphrase } = await adapter.getNetwork();
    const contract = StrKey.encodeContract(hash('demo-token'));
    const invocation = new xdr.SorobanAuthorizedInvocation({
      function: xdr.SorobanAuthorizedFunction.sorobanAuthorizedFunctionTypeContractFn(
        new xdr.InvokeContractArgs({
          contractAddress: Address.fromString(contract).toScAddress(),
          functionName: 'transfer',
          args: [
            nativeToScVal(address, { type: 'address' }),
            nativeToScVal(StrKey.encodeContract(hash('demo-recipient')), { type: 'address' }),
            nativeToScVal(10_000_000n, { type: 'i128' }),
          ],
        }),
      ),
      subInvocations: [],
    });

    // authorizeInvocation verifies the wallet's signature against the payload.
    const entry = await authorizeInvocation({
      invocation,
      networkPassphrase,
      publicKey: address,
      validUntilLedgerSeq: 1_000_000,
      signer: async (preimage) => {
        const result = await adapter.signAuthEntry(preimage.toXDR('base64'), {
          networkPassphrase,
          address,
        });
        if (result.error || !result.signedAuthEntry) {
          throw new Error(result.error?.message ?? 'Sin firma');
        }
        return {
          signature: Uint8Array.from(atob(result.signedAuthEntry), (c) => c.charCodeAt(0)),
          publicKey: result.signerAddress,
        };
      },
    });
    return { contract, signedEntryXdr: entry.toXDR('base64') };
  }),
);

$<HTMLFormElement>('payment').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const data = new FormData(form);
  const memo = String(data.get('memo') ?? '').trim();
  return run(form.querySelector('button'), 'Pago enviado', async () => {
    if (adapter.backend === 'official') {
      throw new Error('En mainnet usa el botón "Enviar" de MetaMask (soporte oficial).');
    }
    const result = await adapter.snap.sendPayment({
      network,
      destination: String(data.get('destination')).trim(),
      amount: String(data.get('amount')).trim(),
      ...(memo ? { memo } : {}),
    });
    await render();
    return result;
  });
});

$<HTMLFormElement>('message').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget as HTMLFormElement;
  const message = String(new FormData(form).get('message'));
  return run(form.querySelector('button'), 'Firma SEP-53', () => adapter.signMessage(message));
});
