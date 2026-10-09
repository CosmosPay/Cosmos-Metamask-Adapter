<p align="center">
  <img src="https://raw.githubusercontent.com/CosmosPay/Stellar-Snap/HEAD/docs/images/banner.png" alt="Stellar Snap: your Stellar account, inside MetaMask" width="100%">
</p>

# Stellar Snap

**Stellar and Soroban accounts, payments, swaps and signatures inside MetaMask.** An open-source
MetaMask Snap with its own screen in the extension: ⋮ menu → **Snaps** → **Stellar Snap**.

<p align="center">
  <img src="https://raw.githubusercontent.com/CosmosPay/Stellar-Snap/HEAD/docs/images/snap.png" alt="The Stellar Snap's home screen in MetaMask" width="340">
</p>

- **Stellar accounts** derived from your MetaMask Secret Recovery Phrase (SEP-0005), or imported.
- **Send and receive** XLM and other assets, reviewing the fee and memo, with a QR code to receive.
- **Assets and trustlines** from the Cosmos Pay registry or by code and issuer.
- **Swaps** on the Stellar DEX with Cosmos Pay quotes, verified before signing.
- **Soroban**: contract authorizations with the contract, function and arguments decoded.
- **Messages** signed with SEP-53, and a verifiable **link** between your `0x` address and your Stellar account.
- **Mainnet, testnet and futurenet**, with free XLM from Friendbot on the test networks.

## Install

From the [Stellar Snap website](https://snap.cosmospay.lat/en/) (**Install in MetaMask** button) or
from your dApp:

```ts
await ethereum.request({
  method: 'wallet_requestSnaps',
  params: { 'npm:@cosmosapp/stellar-snap': {} },
});
```

To connect a dApp, use the SEP-43 adapter
[`@cosmosapp/stellar-metamask-adapter`](https://www.npmjs.com/package/@cosmosapp/stellar-metamask-adapter).
The full JSON-RPC API (`stellar_*`) is in the
[integration docs](https://github.com/CosmosPay/Stellar-Snap/blob/HEAD/docs/integration.md).

> Stellar Snap is an independent product of Cosmos Pay and Cosmos: it isn't affiliated with,
> sponsored or endorsed by MetaMask, Consensys or the Stellar Development Foundation.

## License

MIT © Cosmos Pay · [Repository](https://github.com/CosmosPay/Stellar-Snap)
