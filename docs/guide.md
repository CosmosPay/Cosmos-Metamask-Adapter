# User guide

Everything happens on the Snap's screen inside MetaMask: ⋮ menu → **Snaps** → **Stellar Snap**.

<p align="center"><img src="images/snap.png" alt="The Stellar Snap's Home and Receive screens" width="380"></p>

## The home screen

- **Accounts** (as in MetaMask): "Account 1 ⌄" at the top with the address and its avatar; it opens
  the account list with balances, a ⋮ menu (use, copy address, remove) and "Add account". Removing
  only hides the account: keys come from the secret phrase, so adding one again brings back the same
  account with its funds. At least one always remains. dApps sign with the selected account and
  can't use removed accounts.
- **Network**: the "Network: Stellar Testnet" pill above the token list opens the network list
  (Mainnet, Testnet, Futurenet). The choice is saved.
- **Balance** in XLM and a list of the other assets (trustlines).
- **Send**: form → review (fee, memo, a warning when it activates a new account) → submit → link to
  the explorer. It checks the spendable balance, minus Stellar's minimum reserve.
- **Receive**: QR code and an address to copy.
- **Fund**: shown only while the account isn't activated. On testnet/futurenet it asks Friendbot for
  free XLM in one click; on mainnet it explains how to withdraw XLM from an exchange.
- **Balance and performance**: on mainnet, the total value in MetaMask's currency with its 24 h
  change (`-USD 0.02 (-0.66%)`); on test networks, the change in the XLM price. Prices come from
  MetaMask's price API (`price.api.cx.metamask.io`) with CoinGecko as a fallback.
- **Tokens**: official logo (MetaMask's icon CDN) with a small issuer badge in the corner (Circle,
  Aquarius…). Verified assets show the issuer ("Circle") instead of its address.
- **Assets (trustlines)**: a picker with the assets in the Cosmos Pay registry (`+` to add, `✓` to
  remove) and "Other asset" for code + issuer. Removing one requires a zero balance and frees the
  0.5 XLM reserve.

The screen mirrors MetaMask's home page: Fund / Send / Receive tiles, an "Add funds" block for new
accounts, Tokens / Activity tabs and the value in MetaMask's currency (mainnet only, and only if
external prices are turned on). Snaps can't style buttons, so the tiles and the pill are SVGs inside
buttons. They follow the system's or the browser's light/dark mode.

## Importing accounts

In _Accounts → Import account_ you can paste a Stellar secret key (`S…`) or a 12/24-word BIP-39
recovery phrase (with an optional account number, derived at `m/44'/148'/{n}'` like any SEP-0005
wallet). Only the resulting secret key is stored, in the Snap's encrypted state
(`snap_manageState`); the phrase is never stored. Removing an imported account erases its key
(accounts derived from MetaMask are only hidden).

## Swapping (native Stellar swaps)

Same engine as Cosmos Wallet: the community server quotes (`POST /v1/swaps/quote`, a _strict-send_
route on the Stellar DEX/AMM + fee and slippage), builds the transaction (`POST /v1/swaps`) and
relays it (`POST /v1/swaps/:id/submit`). Before signing, the Snap checks that the server's XDR is
exactly the reviewed swap: source = your account, at most one fee payment to the announced wallet,
and a `pathPaymentStrictSend` to you with at least the quoted minimum; otherwise it signs nothing.
There's no direct fallback route to the DEX: a swap that skipped the server wouldn't charge the fee,
so if the gateway doesn't answer, the Snap shows that swaps are unavailable. Futurenet has no swaps
(the server doesn't serve it).

## Cosmos Pay asset registry

The main asset list comes from
`GET https://api.cosmospay.lat/cosmos-api/v1/assets?network=public|testnet`, with the shared public
key the Snap fetches at runtime from `GET /v1/public-key`. The gateway scopes each key to its
environment (`dev` → testnet, `prod` → mainnet), so swaps only use the key for their own network;
you can set one per network at build time (see [Development](development.md#environment-variables)).
If the gateway doesn't answer, it uses the bundled copy of the registry (version 2) and retries after
a minute, like the Cosmos Pay wallet. For the Snap to call the live API, the gateway must allow CORS
for the `null` origin (Snaps `fetch` from an opaque origin).

## Language

It follows MetaMask's (`snap_getPreferences`): English, Spanish and Portuguese; any other falls back
to English. Numbers use the language's separators (`2.5` / `2,5`), and "hide balances" is
respected. To add a language, copy `packages/snap/locales/en.json`, translate it and register it in
`src/i18n.ts` and in the manifest's `source.locales`.

## Logo

The logo is Stellar's official monogram, taken unmodified from the vector in the Stellar
Development Foundation's press kit (stellar.org/brand-resources, 2026), in its brand color
(`#0F0F0F`).
