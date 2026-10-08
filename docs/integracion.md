# Integración para dApps

`@cosmosapp/stellar-metamask-adapter` conecta cualquier dApp de Stellar o Soroban con MetaMask a
través de una API estándar (SEP-43), un módulo de Stellar Wallets Kit y una API compatible con
Freighter.

```bash
npm install @cosmosapp/stellar-metamask-adapter
```

## Arquitectura híbrida

```
dApp ──► HybridStellarAdapter (SEP-43) ─┬─ mainnet ──► MetaMask oficial (@metamask/connect-stellar)
         · Stellar Wallets Kit module   │               └─ si no está disponible ─┐
         · API compatible con Freighter └─ testnet / futurenet ──► Stellar Snap ◄──┘
```

- **Mainnet**: MetaMask ya trae soporte de Stellar integrado
  (`@metamask/stellar-wallet-snap` + `@metamask/connect-stellar`, Multichain API). El adaptador lo
  usa cuando existe y, si la versión de MetaMask no lo tiene, cae al Stellar Snap. Si el usuario
  **rechaza** la conexión, no se cae al Snap.
- **Testnet / Futurenet**: el soporte integrado solo cubre `stellar:pubnet`, así que se usa el
  Stellar Snap (`npm:@cosmosapp/stellar-snap`).
- Ambos derivan las claves con SEP-0005 (`m/44'/148'/n'`) desde la misma frase secreta.

## Stellar Wallets Kit

"MetaMask" aparece en el selector de wallets:

```ts
import { MetaMaskStellarModule } from '@cosmosapp/stellar-metamask-adapter';

StellarWalletsKit.init({ modules: [new MetaMaskStellarModule(), ...defaultModules()] });
```

## SEP-43 directo

```ts
import { HybridStellarAdapter } from '@cosmosapp/stellar-metamask-adapter';

const wallet = new HybridStellarAdapter();
const { address } = await wallet.requestAccess();
const { signedTxXdr } = await wallet.signTransaction(xdr, { networkPassphrase });
const { signedAuthEntry } = await wallet.signAuthEntry(preimageXdr, { networkPassphrase });
await wallet.switchNetwork('testnet');
await wallet.linkEvmAddress(); // vincula 0x… ↔ G…
wallet.onChange(({ address, network, backend }) => {
  /* … */
});
```

Todos los métodos devuelven `{ ...resultado, error? }` con los códigos de SEP-43: -1 wallet,
-2 servicio externo, -3 petición inválida, -4 rechazo del usuario.

## dApps hechas para Freighter

Sin tocar su código, con un alias del bundler:

```ts
// src/freighter-metamask.ts
import { createFreighterApi } from '@cosmosapp/stellar-metamask-adapter';
const api = createFreighterApi();
export default api;
export const { isConnected, isAllowed, setAllowed, requestAccess, getAddress, getNetwork,
  getNetworkDetails, signTransaction, signAuthEntry, signMessage, addToken,
  WatchWalletChanges } = api;

// vite.config.ts
resolve: { alias: { '@stellar/freighter-api': '/src/freighter-metamask.ts' } }
```

## API JSON-RPC del Snap (`wallet_invokeSnap`)

Todos aceptan `network` (`mainnet` | `testnet` | `futurenet`) **o** `networkPassphrase`,
`accountIndex` y `address` (si se pasa y no coincide, error -32602). Sin red explícita se usa la
red guardada por el usuario; sin `accountIndex`, la cuenta seleccionada en el Snap. Un
`accountIndex` que el usuario no haya añadido (o haya eliminado) devuelve -32602.

| Método | Params | Respuesta |
| --- | --- | --- |
| `stellar_getAccounts` | — | `{ selectedAccount, accounts: [{ index, name, address }] }` |
| `stellar_getAddress` | — | `{ address }` |
| `stellar_getNetwork` | — | `{ network, sep43Name, networkPassphrase, horizonUrl, rpcUrl, chainId }` |
| `stellar_switchNetwork` | `network` | igual que arriba (pide confirmación, se persiste) |
| `stellar_getBalance` | — | `{ address, funded, balances }` |
| `stellar_signTransaction` | `xdr`, `submit?` | `{ signedTxXdr, signerAddress, hash? }` |
| `stellar_signAuthEntry` | `authEntry` (base64 `HashIdPreimage`) | `{ signedAuthEntry, signerAddress }` |
| `stellar_signMessage` | `message` | `{ signedMessage, signerAddress }` (SEP-53) |
| `stellar_sendPayment` | `destination`, `amount`, `assetCode?`, `assetIssuer?`, `memo?` | `{ hash, ledger, explorerUrl }` |
| `stellar_getLinkMessage` | `evmAddress` | `{ message }` |
| `stellar_linkEvmAddress` | `evmAddress`, `evmSignature` | `{ evmAddress, stellarAddress, message, evmSignature, stellarSignature }` |
| `stellar_getLinkedAddresses` | — | lista de vínculos |

**Soroban.** Antes de firmar, el diálogo muestra el contrato, la función y los argumentos
decodificados. `signAuthEntry` acepta los preimages clásico y CAP-71 (*WithAddress*), rechaza los
de otra red y enseña el árbol completo de llamadas autorizadas, incluidas las anidadas.

**Vínculo 0x ↔ G.** La cuenta EVM firma con `personal_sign` un mensaje determinista. El Snap
recupera la firma (secp256k1) y comprueba que corresponde a esa dirección; después firma el mismo
mensaje con la clave Stellar (SEP-53). Cualquiera puede verificar las dos firmas.
