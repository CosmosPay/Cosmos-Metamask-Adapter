# dApp integration

`@cosmosapp/stellar-metamask-adapter` connects any Stellar or Soroban dApp to MetaMask through a
standard API (SEP-43), a Stellar Wallets Kit module and a Freighter-compatible API.

```bash
npm install @cosmosapp/stellar-metamask-adapter
```

## Hybrid architecture

```
dApp ──► HybridStellarAdapter (SEP-43) ─┬─ mainnet ──► official MetaMask (@metamask/connect-stellar)
         · Stellar Wallets Kit module   │               └─ if it isn't available ─┐
         · Freighter-compatible API     └─ testnet / futurenet ──► Stellar Snap ◄──┘
```

- **Mainnet**: MetaMask already ships built-in Stellar support (`@metamask/stellar-wallet-snap` +
  `@metamask/connect-stellar`, Multichain API). The adapter uses it when it's there and, if the
  MetaMask version doesn't have it, falls back to the Stellar Snap. If the user **rejects** the
  connection, it doesn't fall back to the Snap.
- **Testnet / Futurenet**: the built-in support only covers `stellar:pubnet`, so the Stellar Snap
  (`npm:@cosmosapp/stellar-snap`) is used.
- Both derive keys with SEP-0005 (`m/44'/148'/n'`) from the same secret phrase.

## Stellar Wallets Kit

"MetaMask" shows up in the wallet picker:

```ts
import { MetaMaskStellarModule } from '@cosmosapp/stellar-metamask-adapter';

StellarWalletsKit.init({ modules: [new MetaMaskStellarModule(), ...defaultModules()] });
```

## SEP-43 directly

```ts
import { HybridStellarAdapter } from '@cosmosapp/stellar-metamask-adapter';

const wallet = new HybridStellarAdapter();
const { address } = await wallet.requestAccess();
const { signedTxXdr } = await wallet.signTransaction(xdr, { networkPassphrase });
const { signedAuthEntry } = await wallet.signAuthEntry(preimageXdr, { networkPassphrase });
await wallet.switchNetwork('testnet');
await wallet.linkEvmAddress(); // links 0x… ↔ G…
wallet.onChange(({ address, network, backend }) => {
  /* … */
});
```

Every method returns `{ ...result, error? }` with the SEP-43 codes: -1 wallet, -2 external service,
-3 invalid request, -4 user rejected.

## dApps built for Freighter

Without touching their code, through a bundler alias:

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

## The Snap's JSON-RPC API (`wallet_invokeSnap`)

Every method accepts `network` (`mainnet` | `testnet` | `futurenet`) **or** `networkPassphrase`,
`accountIndex` and `address` (if given and it doesn't match, error -32602). Without an explicit
network, the network the user saved is used; without `accountIndex`, the account selected in the
Snap. An `accountIndex` the user hasn't added (or has removed) returns -32602.

| Method | Params | Result |
| --- | --- | --- |
| `stellar_getAccounts` | — | `{ selectedAccount, accounts: [{ index, name, address }] }` |
| `stellar_getAddress` | — | `{ address }` |
| `stellar_getNetwork` | — | `{ network, sep43Name, networkPassphrase, horizonUrl, rpcUrl, chainId }` |
| `stellar_switchNetwork` | `network` | same as above (asks for confirmation, saved) |
| `stellar_getBalance` | — | `{ address, funded, balances }` |
| `stellar_signTransaction` | `xdr`, `submit?` | `{ signedTxXdr, signerAddress, hash? }` |
| `stellar_signAuthEntry` | `authEntry` (base64 `HashIdPreimage`) | `{ signedAuthEntry, signerAddress }` |
| `stellar_signMessage` | `message` | `{ signedMessage, signerAddress }` (SEP-53) |
| `stellar_sendPayment` | `destination`, `amount`, `assetCode?`, `assetIssuer?`, `memo?` | `{ hash, ledger, explorerUrl }` |
| `stellar_getLinkMessage` | `evmAddress` | `{ message }` |
| `stellar_linkEvmAddress` | `evmAddress`, `evmSignature` | `{ evmAddress, stellarAddress, message, evmSignature, stellarSignature }` |
| `stellar_getLinkedAddresses` | — | list of links |

**Soroban.** Before signing, the dialog shows the contract, the function and the decoded
arguments. `signAuthEntry` accepts both the classic and the CAP-71 (_WithAddress_) preimages,
rejects those for another network and shows the full tree of authorized calls, nested ones
included.

**0x ↔ G link.** The EVM account signs a deterministic message with `personal_sign`. The Snap
recovers the signature (secp256k1) and checks that it belongs to that address; then it signs the
same message with the Stellar key (SEP-53). Anyone can verify both signatures.
