# Stellar Snap

MetaMask ↔ Stellar/Soroban. The project is "hybrid":

- **Mainnet** goes to MetaMask's official Stellar support (`@metamask/connect-stellar`).
- **Testnet and futurenet** go to our Snap.

The whole wallet UX (send, receive, swap, sign, accounts, trustlines) lives inside the Snap's own UI in MetaMask. It is never a companion web page. User-facing docs are in `README.md` (Spanish).

## Layout (npm workspaces)

| Package | What | Build / test |
| --- | --- | --- |
| `packages/snap` | The MetaMask Snap: `stellar_*` JSON-RPC + home page UI | `mm-snap` (webpack) · jest (unit + snaps-jest integration) |
| `packages/adapter` | SEP-43 / Freighter-compatible adapter for dApps (official on mainnet, snap elsewhere) | `tsc` + `tsc-alias` · jest |
| `packages/site` | React demo dApp | Vite |

## Commands

```bash
npm start                                   # snap :8080 (watch) + site :5173
npm test                                    # snap (builds first) + adapter
npm run typecheck                           # all packages
npm run format                              # prettier, uses .prettierrc.json
npm run test:unit -w packages/snap          # fast, no MetaMask
npm run test:integration -w packages/snap   # built bundle in simulated MetaMask
npm run test:live -w packages/snap          # real testnet (Friendbot, Horizon, Cosmos Pay)
npm run sync:registry -w packages/snap      # refresh bundled asset registry from the live API
```

Integration tests run the **built bundle**, so the snap `test` scripts build first. Don't run jest directly after editing `src` without building.

## Conventions

- **Imports:** use the `@/` alias (= the package's `src`), never `../`.
  - The snap also has `@locales/*` and `@test/*`.
  - Aliases are defined in each `tsconfig.json` `paths` and mirrored in:
    - `snap.config.ts` (webpack);
    - each `jest.config.ts` (`moduleNameMapper`);
    - `adapter` build (`tsc-alias` rewrites to relative `.js`);
    - `site/vite.config.ts` (`packageAlias` plugin). It resolves `@/` per importer, because the site compiles the adapter's sources directly.
- **TypeScript only** (`.ts` / `.tsx` / `.mts` for node scripts).
  - The toolchain is TypeScript 7, which has no JS API, so **ts-jest does not work**. Tests are transformed with `@swc/jest`.
  - Jest loads `jest.config.ts` natively (Node type stripping).
- **Style:** Prettier (`singleQuote`, `printWidth: 120`). Comments explain *why*, JSDoc on exports. Match the surrounding density.
- **i18n:** every user-facing string goes through `t()` with keys in `packages/snap/locales/{en,es,pt}.json`.
  - All three files must have the same keys and placeholders. `test/unit/i18n.test.ts` enforces this.
  - Numbers go through `localizeNumber`, dates through `formatDate`.

## Snap architecture (`packages/snap/src`)

Layered. Dependencies point inward: `rpc`/`home` → `services` → `domain`, and `wallet` sits beside them.

```
index.ts            entry: onRpcRequest, onHomePage, onUserInput
config/             networks (NETWORKS registry)
domain/             pure rules, no I/O: amounts, balances, payments, trustlines, swap/{types,rules}, soroban, transactions
services/           I/O behind small interfaces: horizon, cosmosApi (CosmosClient), prices (PriceSource), assets (RegistrySource), swap (SwapProvider registry)
wallet/             keyring (SEP-0005 + imports), walletModel (pure state transitions), state (persistence), stateStore (Repository port)
rpc/                dApp API: methods/* registries + dialogs + superstruct schemas
home/               in-MetaMask UI: router, controllers/* (route tables), screens/*, components/*, viewModels/*
ui/                 shared view helpers: format, assetAvatar, graphics/{icons,qr,stellarMark}
```

### Extension points (add, don't edit a switch)

- **Home button or form.** Add a handler to a feature's route table in `home/controllers/<feature>.tsx` (`clicks` / `forms`). Names are `action` or `action:arg`.
  - A new feature's routes go into `combineRoutes(...)` in `home/index.ts`. Duplicates throw at load.
  - Slow screens get a skeleton: see `controllers/skeleton.tsx`.
- **RPC method.** Add it to a registry in `rpc/methods/*`, validate params with a superstruct schema in `rpc/schemas.ts`, and confirm with `confirm(<Dialog/>)`.
- **Swap venue.** Implement `SwapProvider` (`domain/swap/types.ts`) and register it in `services/swap/index.ts`.
  - The UI asks `swapsAvailable` / `swapProviderName` and never names a provider.
  - Quotes carry `provider`, and `executeSwap` uses the provider that priced them.
- **Price source.** Implement `PriceSource`, then compose it with `fallbackPriceSource` (chain) and `cachedPriceSource` (decorator) in `services/prices/index.ts`.
- **Asset registry source.** Implement `RegistrySource`. `createRegistry` adds the cache and the bundled fallback.
- **Network.** Add an entry in `config/networks.ts`, plus `network.*` / `networks.sub.*` i18n keys.
- **Tests inject dependencies:**
  - `useStateStore(new MemoryStateStore())`, `useSwapProviders([...])`, `usePriceSource(...)`;
  - `createCosmosClient({ fetch })`, `createRegistry(source, clock)`, `createAssetAvatar(loader)`.
  - Prefer these to `jest.mock`.

## Product rules that look like bugs (keep them)

- **Swaps go only through the Cosmos Pay community server** (`/v1/swaps*`), which charges the platform fee.
  - Never add a direct Horizon/DEX fallback: it would bypass the fee.
  - Before signing, the server-built XDR **must** pass `assertSwapTransaction`: our source, at most one fee payment to the quoted wallet, and a strict-send to us with at least `minimum`.
- **Cosmos Pay keys are scoped to a ledger.** The key's environment `dev` → testnet, `prod` → mainnet.
  - Never use a key on the other ledger.
  - Without build-time `COSMOS_API_KEY_*`, the shared key comes from `GET /v1/public-key` at runtime.
  - The gateway must allow CORS for origin `null` (snaps fetch from an opaque origin). Node tests don't see CORS.
- **Imported accounts:**
  - Only the derived `S…` secret is stored, in MetaMask-encrypted `snap_manageState`. Never store the phrase, never log secrets.
  - Ids are ≥ `IMPORTED_BASE`. Removing an imported account erases its key; removing a derived one only hides it.
- **Activity:** a payment leg of a multi-operation transaction is titled by the transaction memo (e.g. "Cosmos Swap Commission"). Plain payments keep Sent/Received with the memo as detail.

## MetaMask Snap UI constraints (learned the hard way)

- **SDK version:**
  - `@metamask/snaps-sdk` is pinned to `~12.0.1` and `platformVersion` to `12.0.1`, the max of stable MetaMask. Don't bump without checking.
  - `process` doesn't exist in the snap. Guard `process.env` reads, since unset vars aren't substituted.
- **Full-width drawing.** Buttons render as links and images as `<img style="max-width:100%">`, so "full-width" elements are SVGs drawn 1000 units wide (`pillButton`, `wideRow`, `spacer`).
  - A tall, narrow SVG scales to thousands of px. `spacer` keeps the full-width aspect ratio.
  - An image sharing a horizontal `Box` with another button needs its real width (`wideRow({ displayWidth })`). Otherwise flex shrinking squeezes the neighbour (e.g. the account ⋮).
- **Avoid these components:**
  - `Footer` buttons always show the snap logo.
  - `Selector` opens a centered modal (we use page lists).
  - `Link` appends an external-link icon that wraps under images, so list rows are `Button`s that open a detail screen with a text `Link`.
- **`Copyable`** can't be styled (always primary-muted). It is the only way to copy to the clipboard.
- **Images:** card images are cropped to a circle. SVG colors follow the OS `prefers-color-scheme`, not MetaMask's theme toggle.
- **Inputs:** re-rendering an `Input` without `value` keeps what the user typed, which the live swap estimate relies on. `snap_getInterfaceState` reads typed values before navigating away.
- **Build warning:** the `Math.random` warning comes from a dependency, not our code.

## Testing layout (`packages/snap/test`)

- `unit/`: jest `unit` project, node environment.
  - `setup.ts` makes `snap.request` throw, so stub it or inject a fake.
  - Shared fixtures are in `unit/fixtures.ts`.
- `integration/`: jest `integration` project (`@metamask/snaps-jest`). Helpers are in `helpers.ts`:
  - `installWithTestPhrase` (SEP-0005 vector) / `installFresh`;
  - `resultOf`, `answer` (approve/cancel a dialog), `rendered`, `capture`.
- `describe` blocks named `… (STELLAR_LIVE=1)` use `live(...)` and only run via `test:live`.
- The global `testTimeout` (30 s) is set in `jest.config.ts`, because preset options are lost inside `projects`.

## Related repos (siblings on the Desktop)

- `comos-pay-community-server`: NestJS swap server and source of the asset registry (`src/assets/assets.constants.ts`).
- `Cosmos-Pay-Developer-Platform`: APISIX gateway config (CORS in `src/utils/apisix.ts`).
