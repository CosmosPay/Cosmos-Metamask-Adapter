# @cosmosapp/stellar-metamask-adapter

**Conecta tu dApp de Stellar o Soroban con MetaMask usando una API estándar (SEP-43).** En mainnet
usa el soporte de Stellar integrado en MetaMask; en testnet y futurenet, el
[Stellar Snap](https://www.npmjs.com/package/@cosmosapp/stellar-snap).

```bash
npm install @cosmosapp/stellar-metamask-adapter
```

## SEP-43

```ts
import { HybridStellarAdapter } from '@cosmosapp/stellar-metamask-adapter';

const wallet = new HybridStellarAdapter();
const { address } = await wallet.requestAccess();
const { signedTxXdr } = await wallet.signTransaction(xdr, { networkPassphrase });
const { signedAuthEntry } = await wallet.signAuthEntry(preimageXdr, { networkPassphrase });
await wallet.switchNetwork('testnet');
wallet.onChange(({ address, network, backend }) => {
  /* … */
});
```

Todos los métodos devuelven `{ ...resultado, error? }` con los códigos de SEP-43: -1 wallet,
-2 servicio externo, -3 petición inválida, -4 rechazo del usuario.

## Stellar Wallets Kit

```ts
import { MetaMaskStellarModule } from '@cosmosapp/stellar-metamask-adapter';

StellarWalletsKit.init({ modules: [new MetaMaskStellarModule(), ...defaultModules()] });
```

## dApps hechas para Freighter

```ts
// src/freighter-metamask.ts
import { createFreighterApi } from '@cosmosapp/stellar-metamask-adapter';
const api = createFreighterApi();
export default api;

// vite.config.ts
resolve: { alias: { '@stellar/freighter-api': '/src/freighter-metamask.ts' } }
```

Arquitectura, vínculo `0x` ↔ `G` y la API JSON-RPC del Snap:
[documentación de integración](https://github.com/CosmosPay/Cosmos-Metamask-Adapter/blob/HEAD/docs/integracion.md).

> Stellar Snap es un producto independiente de Cosmos Pay y Cosmos: no está afiliado, patrocinado
> ni aprobado por MetaMask, Consensys ni la Stellar Development Foundation.

## Licencia

MIT © Cosmos Pay · [Repositorio](https://github.com/CosmosPay/Cosmos-Metamask-Adapter)
