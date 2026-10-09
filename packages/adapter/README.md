# @cosmosapp/stellar-metamask-adapter

**Connect your Stellar or Soroban dApp to MetaMask with a standard API (SEP-43).** On mainnet it uses
MetaMask's built-in Stellar support; on testnet and futurenet, the
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

Every method returns `{ ...result, error? }` with the SEP-43 codes: -1 wallet, -2 external service,
-3 invalid request, -4 user rejected.

## Stellar Wallets Kit

```ts
import { MetaMaskStellarModule } from '@cosmosapp/stellar-metamask-adapter';

StellarWalletsKit.init({ modules: [new MetaMaskStellarModule(), ...defaultModules()] });
```

## dApps built for Freighter

```ts
// src/freighter-metamask.ts
import { createFreighterApi } from '@cosmosapp/stellar-metamask-adapter';
const api = createFreighterApi();
export default api;

// vite.config.ts
resolve: { alias: { '@stellar/freighter-api': '/src/freighter-metamask.ts' } }
```

Architecture, the `0x` ↔ `G` link and the Snap's JSON-RPC API:
[integration docs](https://github.com/CosmosPay/Cosmos-Metamask-Adapter/blob/HEAD/docs/integration.md).

> Stellar Snap is an independent product of Cosmos Pay and Cosmos: it isn't affiliated with,
> sponsored or endorsed by MetaMask, Consensys or the Stellar Development Foundation.

## License

MIT © Cosmos Pay · [Repository](https://github.com/CosmosPay/Cosmos-Metamask-Adapter)
