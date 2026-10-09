# @cosmosapp/stellar-snap

Every version of the Stellar Snap, newest first. Entries come from changesets (see
`.changeset/README.md`); the website shows them at https://snap.cosmospay.lat/en/changelog/.

## 0.2.0 - 2026-10-09

### Minor Changes

- First public release: Stellar and Soroban accounts inside MetaMask, with the Snap's own screen in the extension.
  - Several Stellar accounts derived from the MetaMask Secret Recovery Phrase (SEP-0005), plus imported secret keys and recovery phrases.
  - Send and receive XLM and other assets, reviewing the fee and memo before signing; receive with a QR code.
  - Add assets from the Cosmos Pay registry, or any other by its code and issuer, and manage their trustlines.
  - Swaps on the Stellar DEX with Cosmos Pay quotes; the Snap checks every transaction before signing it.
  - Sign Soroban authorizations showing the contract, function and arguments, and messages with SEP-53.
  - Link an EVM `0x` address to the Stellar account with signatures anyone can verify.
  - Testnet and futurenet (with Friendbot funding); mainnet as a fallback for MetaMask versions without built-in Stellar support.
  - In English, Spanish and Portuguese.
