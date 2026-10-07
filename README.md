# Stellar | Cosmos Adapter — Stellar y Soroban en MetaMask

Conector "estilo Solflare" para que los usuarios de MetaMask usen dApps de
Stellar/Soroban sin instalar otra wallet.

## Arquitectura híbrida

```
dApp ──► HybridStellarAdapter (SEP-43) ─┬─ mainnet ──► MetaMask oficial (@metamask/connect-stellar)
         · Stellar Wallets Kit module   │               └─ si no está disponible ─┐
         · API compatible con Freighter └─ testnet / futurenet ──► Stellar Snap ◄──┘
```

- **Mainnet**: MetaMask ya trae soporte oficial de Stellar
  (`@metamask/stellar-wallet-snap` + `@metamask/connect-stellar`, Multichain API).
  El adaptador lo usa cuando existe y, si la versión de MetaMask no lo tiene, cae a
  nuestro Snap. Si el usuario **rechaza** la conexión oficial, no se cae al Snap.
- **Testnet / Futurenet**: el soporte oficial solo cubre `stellar:pubnet`, así que se usa
  nuestro Snap.
- Ambos derivan las claves con SEP-0005 (`m/44'/148'/n'`) desde la misma frase semilla.

| Paquete | Qué es |
| --- | --- |
| `packages/snap` | Stellar Snap (`@cosmospay/stellar-snap`). |
| `packages/adapter` | `@cosmospay/stellar-metamask-adapter`: adaptador SEP-43, módulo de Stellar Wallets Kit y API compatible con Freighter. |
| `packages/site` | dApp de demo. |

## Usar la wallet dentro de MetaMask

Todo se hace desde la pantalla del Snap: menú ⋮ → **Snaps** → **Stellar | Cosmos Adapter**.

- **Cuentas** (como en MetaMask): "Cuenta 1 ⌄" arriba con la dirección y su avatar; abre la
  lista de cuentas con saldo, menú ⋮ (usar, copiar dirección, eliminar) y "Agregar cuenta". Eliminar solo oculta la cuenta: las claves salen de la frase secreta, así que
  al añadir de nuevo vuelve la misma cuenta con sus fondos. Siempre queda al menos una. Las
  dApps firman con la cuenta seleccionada y no pueden usar cuentas eliminadas.
- **Red**: píldora "Red: Stellar Testnet" sobre la lista de tokens, que abre la lista de redes (Mainnet, Testnet, Futurenet). La elección se guarda.
- **Saldo** en XLM y lista de los demás activos (trustlines).
- **Enviar**: formulario → revisión (comisión, memo, aviso si se activa una cuenta nueva) →
  envío → enlace al explorador. Valida el saldo gastable, descontando la reserva mínima de
  Stellar.
- **Recibir**: QR y dirección para copiar.
- **Fondear**: solo aparece mientras la cuenta no está activada. En testnet/futurenet pide
  XLM gratis a Friendbot con un clic; en mainnet explica cómo retirar XLM desde un exchange.
- **Saldo y rendimiento**: en mainnet, valor total en la moneda de MetaMask con su variación
  de 24 h (`-USD 0,02 (-0,66 %)`); en redes de prueba, la variación del precio de XLM. Precios
  de la API de precios de MetaMask (`price.api.cx.metamask.io`) con CoinGecko como respaldo.
- **Tokens**: logo oficial (CDN de iconos de MetaMask) con un circulito del emisor en la
  esquina (Circle, Aquarius…). Los activos verificados muestran el emisor ("Circle") en vez de
  su dirección.
- **Activos (trustlines)**: selector con los activos del registro de Cosmos Pay (`+` para
  añadir, `✓` para quitar) y "Otro activo" para código + emisor. Eliminar exige saldo 0 y
  libera la reserva de 0,5 XLM.

### Registro de activos de Cosmos Pay

El Snap lee `GET https://api.cosmospay.lat/cosmos-api/v1/assets?network=public|testnet`
si se compila con la clave pública (`COSMOS_PUBLIC_API_KEY=… npm run build -w packages/snap`).
Sin clave, o si la pasarela no responde, usa la copia incluida del registro (versión 1),
igual que la wallet de Cosmos Pay. Para que el Snap pueda llamar a la API en vivo, la pasarela
tiene que permitir CORS para el origen `null` (los Snaps hacen `fetch` desde un origen opaco).
- **Idioma**: sigue el de MetaMask (`snap_getPreferences`): inglés, español y portugués;
  cualquier otro cae a inglés. Los números usan los separadores del idioma (`2,5` / `2.5`) y
  se respeta "ocultar saldos". Para añadir un idioma, copia `packages/snap/locales/en.json`,
  tradúcelo y regístralo en `src/i18n.ts` y en `source.locales` del manifiesto.

La pantalla imita la página principal de MetaMask: tarjetas Fondear / Enviar / Recibir,
bloque "Agregar fondos" para cuentas nuevas, pestañas Tokens / Actividad y valor en la moneda
de MetaMask (solo mainnet, y solo si el usuario tiene activados los precios externos; se usa
CoinGecko). Snaps no permite dar estilo a los botones, así que las tarjetas y la píldora son
SVG dentro de botones. Siguen el modo claro/oscuro del sistema o del navegador.

El logo es el monograma oficial de Stellar, extraído sin modificar del vector del press kit
de la Stellar Development Foundation (stellar.org/brand-resources, 2026), con sus colores
de marca (`#0F0F0F`).

## Integrar en una dApp

**Stellar Wallets Kit** (aparece "MetaMask" en el selector de wallets):

```ts
import { MetaMaskStellarModule } from '@cosmospay/stellar-metamask-adapter';

StellarWalletsKit.init({ modules: [new MetaMaskStellarModule(), ...defaultModules()] });
```

**SEP-43 directo:**

```ts
import { HybridStellarAdapter } from '@cosmospay/stellar-metamask-adapter';

const wallet = new HybridStellarAdapter();
const { address } = await wallet.requestAccess();
const { signedTxXdr } = await wallet.signTransaction(xdr, { networkPassphrase });
const { signedAuthEntry } = await wallet.signAuthEntry(preimageXdr, { networkPassphrase });
await wallet.switchNetwork('testnet');
await wallet.linkEvmAddress();          // vincula 0x… ↔ G…
wallet.onChange(({ address, network, backend }) => { /* … */ });
```

Todos los métodos devuelven `{ ...resultado, error? }` con los códigos de SEP-43:
-1 wallet, -2 servicio externo, -3 petición inválida, -4 rechazo del usuario.

**dApps hechas para Freighter**, sin tocar su código, con un alias del bundler:

```ts
// src/freighter-metamask.ts
import { createFreighterApi } from '@cosmospay/stellar-metamask-adapter';
const api = createFreighterApi();
export default api;
export const { isConnected, isAllowed, setAllowed, requestAccess, getAddress, getNetwork,
  getNetworkDetails, signTransaction, signAuthEntry, signMessage, addToken,
  WatchWalletChanges } = api;

// vite.config.ts
resolve: { alias: { '@stellar/freighter-api': '/src/freighter-metamask.ts' } }
```

## Snap: API JSON-RPC (`wallet_invokeSnap`)

Todos aceptan `network` (`mainnet` | `testnet` | `futurenet`) **o** `networkPassphrase`,
`accountIndex` y `address` (si se pasa y no coincide, error -32602). Sin red explícita se
usa la red guardada por el usuario; sin `accountIndex`, la cuenta seleccionada en el Snap.
Un `accountIndex` que el usuario no haya añadido (o haya eliminado) devuelve -32602.

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
decodificados. `signAuthEntry` acepta los preimages clásico y CAP-71 (*WithAddress*),
rechaza los de otra red y enseña el árbol completo de llamadas autorizadas, incluidas las
anidadas.

**Vínculo 0x ↔ G.** La cuenta EVM firma con `personal_sign` un mensaje determinista. El
Snap recupera la firma (secp256k1) y comprueba que corresponde a esa dirección; después
firma el mismo mensaje con la clave Stellar (SEP-53). Cualquiera puede verificar las dos
firmas.

## Desarrollo

Requisitos: Node 22.18+ (los tests del adaptador ejecutan TypeScript directamente) y
**MetaMask Flask** para cargar el Snap local.

```bash
npm install
npm start        # Snap en :8080 (watch) + dApp en :5173
npm test         # Snap (snaps-jest) + adaptador (node:test)
npm run test:live -w packages/snap   # E2E real en testnet: Friendbot + pago desde la UI
npm run build
```

## Publicación

1. Publica `packages/snap` y `packages/adapter` en npm.
2. El Snap necesita **auditoría y allowlist** de MetaMask para instalarse en la versión
   estable (usa `snap_getBip32Entropy`): https://docs.metamask.io/snaps/how-to/get-allowlisted/
3. `platformVersion` está fijado a `12.0.1` (la máxima de MetaMask estable); no subas
   `@metamask/snaps-sdk` sin comprobarlo.
