# @cosmosapp/stellar-metamask-adapter

Every version of the adapter, newest first. Entries come from changesets (see
`.changeset/README.md`); the website shows them at https://snap.cosmospay.lat/en/changelog/.

## 0.1.0 - 2026-10-09

### Minor Changes

- First public release: connect a Stellar or Soroban dApp to MetaMask with the standard SEP-43 API.
  - `HybridStellarAdapter` signs with MetaMask's built-in Stellar support on mainnet and with the Stellar Snap on testnet and futurenet.
  - `MetaMaskStellarModule` for Stellar Wallets Kit.
  - `createFreighterApi()`, a drop-in for `@stellar/freighter-api` in dApps built for Freighter.
  - SEP-43 error codes on every method: -1 wallet, -2 external service, -3 invalid request, -4 user rejected.
