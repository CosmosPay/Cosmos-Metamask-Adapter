# Stellar Snap

MetaMask ↔ Stellar/Soroban. The project is "hybrid":

- **Mainnet** goes to MetaMask's official Stellar support (`@metamask/connect-stellar`).
- **Testnet and futurenet** go to our Snap.

The whole wallet UX (send, receive, swap, sign, accounts, trustlines) lives inside the Snap's own UI in MetaMask. It is never a companion web page.

All documentation is in **English**: `README.md` (the product page), `docs/guide.md` (using the snap), `docs/integration.md` (adapter + JSON-RPC API), `docs/development.md` (commands, env vars, publishing) and the npm READMEs of `@cosmosapp/stellar-snap` and `@cosmosapp/stellar-metamask-adapter`. The images in `docs/images/` are screenshots of the English site (`/en/`); `banner.png` is `site/public/og/en.png`. Spanish exists only as one of the product's languages (site and snap translations).

## Layout (npm workspaces)

| Package | What | Build / test |
| --- | --- | --- |
| `packages/snap` | The MetaMask Snap: `stellar_*` JSON-RPC + home page UI | `mm-snap` (webpack) · jest (unit + snaps-jest integration) |
| `packages/adapter` | SEP-43 / Freighter-compatible adapter for dApps (official on mainnet, snap elsewhere) | `tsc` + `tsc-alias` · jest |
| `packages/site` | React site in 7 languages: landing (features, getting started, FAQ) + demo dApp, the changelog, and the privacy / terms / credits / contact pages | Vite + prerender (`scripts/prerender.mts`) |

## Commands

```bash
npm start                                   # snap :8080 (watch) + site :5173
npm test                                    # snap (builds first) + adapter
npm run typecheck                           # all packages
npm run format                              # prettier, uses .prettierrc.json (format:check: CI's check)
npm run test:unit -w packages/snap          # fast, no MetaMask
npm run test:integration -w packages/snap   # built bundle in simulated MetaMask
npm run test:live -w packages/snap          # real testnet (Friendbot, Horizon, Cosmos Pay)
npm run sync:registry -w packages/snap      # refresh bundled asset registry from the live API
npm run indexnow -w packages/site           # after a deploy: announce every page to IndexNow engines
npx changeset                               # a changelog entry for a change to the snap or the adapter
```

Build settings live in each package's `.env` (git-ignored); `packages/site/.env.example` and `packages/snap/.env.example` document every variable. Node scripts and `snap.config.ts` load `.env` with `process.loadEnvFile`; Vite reads the `VITE_` ones itself.

Integration tests run the **built bundle**, so the snap `test` scripts build first. Don't run jest directly after editing `src` without building.

The site type-checks against the adapter's **built** types (`packages/adapter/dist`), so its `prebuild` and `pretypecheck` build the adapter first; only Vite reads the adapter's sources.

## Conventions

- **Changesets:** every change to `packages/snap` or `packages/adapter` that their users would notice gets a changeset in the same change (`npx changeset`; `--empty` for internal ones), written in English for users, past tense, as `.changeset/README.md` says. It becomes the package's `CHANGELOG.md` entry, its GitHub release notes and the website's `/changelog/` page. Don't bump versions or edit `CHANGELOG.md` by hand for a release: the Version packages PR does it.

- **Imports:** use the `@/` alias (= the package's `src`), never `../`.
  - The snap also has `@locales/*` and `@test/*`.
  - Aliases are defined in each `tsconfig.json` `paths` and mirrored in:
    - `snap.config.ts` (webpack);
    - each `jest.config.ts` (`moduleNameMapper`);
    - `adapter` build (`tsc-alias` rewrites to relative `.js`);
    - `site/vite.config.ts` (`packageAlias` plugin). It resolves `@/` per importer, because the site compiles the adapter's sources directly.
- **No HTML, React only.** Avoid HTML at all costs: every page, view and piece of UI is a React component.
  - The site's pages are routes, not HTML files: `src/lib/router.ts` maps paths to pages, `App` renders the current one, and internal links use `components/Link`.
  - `site/index.html` is only Vite's bare entry shell. Don't add pages, content, styles or scripts to it; the pre-paint boot script (theme, saved-language redirect) and the head tags every page shares are injected from `vite.config.ts`.
  - No `dangerouslySetInnerHTML` or markup strings: logos are React components (`components/logos`), and the snap's SVG art enters the site only as `<img>` data URLs.
  - The HTML files in `dist/` are generated: `npm run build` prerenders every route in every language from the React tree (see below).
- **TypeScript only** (`.ts` / `.tsx` / `.mts` for node scripts).
  - The toolchain is TypeScript 7, which has no JS API, so **ts-jest does not work**. Tests are transformed with `@swc/jest`.
  - Jest loads `jest.config.ts` natively (Node type stripping).
- **Style:** Prettier (`singleQuote`, `printWidth: 120`). Comments explain *why*, JSDoc on exports. Match the surrounding density.
- **i18n:** every user-facing string goes through `t()` with keys in `packages/snap/locales/{en,es,pt}.json`.
  - All three files must have the same keys and placeholders. `test/unit/i18n.test.ts` enforces this.
  - Numbers go through `localizeNumber`, dates through `formatDate`.
  - The site has its own catalogs, `packages/site/src/i18n/messages/*.ts` (7 languages). `es.ts` defines the keys; the others are typed `Messages`, so a missing key fails the typecheck.

## Site: SEO and accessibility (`packages/site`)

- **One URL per page and language.** Spanish lives at the root (`/`, `/privacy/`), the rest under their code (`/en/privacy/`). The URL is the only source of the language (`useI18n` reads it from `useLocation`); build links with `pathFor(route, language)`, never switch language in place.
  - The language menu is real links (crawlable, works without JS). A choice is saved (`rememberLanguage`), and the boot script then sends unprefixed pages to it. Crawlers and first visits are never redirected; `LanguageSuggestion` only offers the browser's language.
- **Changelog page** (`/changelog/`, in the nav and the footer): `content/changelog.ts` reads both packages' `CHANGELOG.md` at build time (`@snap/…?raw`, `@adapter/…?raw`) and `lib/changelog.ts` parses Changesets' format; a `##` heading that isn't `<version> - <date>` fails the build. The notes are English (`lang="en"` on other pages), so its canonical and only indexed version is `/en/changelog/`.
- **Served from a folder too.** Our host serves the site at the root; the GitHub Pages fallback at `/Stellar-Snap/` (`BASE_PATH`, Vite's `base`). Code uses **site paths** (`/en/privacy/`, what `pathFor`/`locate` speak, and what canonical URLs and the sitemap use); `router.ts`'s `urlFor`/`sitePath` add or strip the folder at the browser's edge. Internal links go through `Link` with site paths; never read `location.pathname` directly. The web manifest's URLs are relative.
- **Prerendered.** `scripts/prerender.mts` builds `src/entry-server.tsx` for Node and writes `dist/<lang>/<page>/index.html`, `404.html` (noindex), `sitemap.xml`, `robots.txt`, `llms.txt` and `llms-full.txt`. `main.tsx` hydrates when `#root[data-path]` is the current page.
  - Render the same markup on the server and in the first client render. Browser-only state (theme, storage, `navigator`) goes through `useHydrated()` or a `getServerSnapshot`; the theme-dependent preview and icons are client-only or CSS-switched.
  - Never touch `window`/`document` at module scope (the prerender runs in Node).
- **Head per page** from `src/seo/head.ts`: title, description, canonical, `hreflang` (+ x-default = English), Open Graph / X cards and schema.org JSON-LD (Organization, WebSite, SoftwareApplication, WebPage/FAQPage, BreadcrumbList). The prerender writes it; `useDocumentHead` re-applies it on client navigation.
  - A new page needs a route, its i18n strings and its head. Documents also need a `description`.
  - `VITE_SITE_URL` sets the public origin for every absolute URL. Without it, `vite.config.ts` takes the host's production address (Vercel, Netlify, Cloudflare Pages, Render), and the prerender warns when there's neither. Optional search-console ownership tags: `VITE_{GOOGLE,BING,BAIDU,NAVER}_SITE_VERIFICATION`, `VITE_{YANDEX,SEZNAM}_VERIFICATION`.
  - `public/og/<lang>.png` are the 1200×630 cards: the wordmark over each language's `hero.title`. Redraw them when that title changes.
  - Home copy (features, steps, FAQ) is listed in `src/content/home.ts` and feeds the page, the JSON-LD and llms.txt. Keep it factual: no claim of MetaMask approval.
  - `INDEXNOW_KEY` makes the prerender publish `/<key>.txt`; `scripts/indexnow.mts` then posts the sitemap's URLs.
- **Optional features, all off unless configured** (`src/config.ts`):
  - Donations (`VITE_DONATION_ADDRESS`, a `G…` account on the public network, and/or `VITE_DONATION_URL`): the home page's last section. Its QR is the snap's own `qrSvg`, lazy-loaded.
  - Google Analytics 4 (`VITE_GA_MEASUREMENT_ID`): gtag.js loads **only after the visitor accepts** `AnalyticsConsent` (Accept and Decline look the same). It sends page views on client navigation and Core Web Vitals (`web-vitals`). The footer's "Measurement preferences" reopens the notice; declining sets gtag's opt-out flag and deletes `_ga` cookies.
  - The privacy policy (`content/privacy.ts`) describes analytics only when it's configured. Keep it in step with any new third-party service.
  - Floating notices (consent, language offer) share the `.notices` stack, bottom left; toasts are bottom right.
- **Entrances: every piece of the landing enters** (the user asked for all of them). Give it `className="reveal"` (`reveal-drop` to drop from above), plus `style={revealStep(i)}` for its place in the opening sequence (banner, hero).
  - A fresh page plays every entrance at once; `useReveal` (in `HomePage`) then hides what's off screen (`data-reveal="pending"`) and replays it as it scrolls in (`"in"`), pieces arriving together staggered by `--reveal-order`. Without JS nothing is hidden, and print shows everything.
  - Elements must be on the page when it mounts (put `reveal` on the box of something drawn later, like the preview and the astronaut). Don't nest `reveal`s.
  - Fill mode is `backwards` only, so nothing keeps a layer or stacking context once in. The header is `z-index: 1` so the language menu stays above the hero's cards.
- **Brand astronaut and code colors:**
  - `components/illustrations/Astronaut` draws the Cosmos character, only beside the donation card (the user's choice). Its pose in `illustrations/poses/` is path data generated from the brand kit's adult, black-line variant 6 (`Downloads/Cosmos-…/03_ILUSTRACIONES`). Lines are `currentColor` and the white details `--bg`, so it follows the theme; never the brand blue.
  - Each pose is its own lazy chunk, drawn after hydration inside a box sized by its viewBox: the prerendered HTML stays light and nothing shifts.
  - Code goes through `HighlightedCode` (`lib/highlight.ts`, a small TS/JSON lexer that renders the same on server and client). Syntax colors are the `--code-*` tokens, each ≥ 7:1 in both themes.
  - The developer example's card stretches to the copy beside it; keep its lines ≤ 76 characters so it doesn't scroll sideways on desktop.
- **Accessibility (WCAG 2.2 AA):**
  - Landmarks: banner `SiteHeader`, `main#main` (the skip link's target), footer. One `h1` per page with `tabIndex={-1}`: `usePageFocus` moves focus there after client navigation.
  - Outside links go through `ExternalLink` (announces the new tab). Decorative art is `aria-hidden`; icon-only controls have a label.
  - Text contrast is AAA (7:1) in both themes, `--muted` included; `prefers-contrast: more` darkens it further. Keep new text colors at 7:1.
  - Motion that starts by itself ends within 5 s (the preview bobs once); reduced motion is honoured except the entrances the user asked for (all of them: `.reveal`, the windows, the highlighter, cards, notices, toasts, menus). Toasts pause on hover/focus.
  - Lists styled with `list-style: none` get `role="list"` (Safari drops the semantics otherwise). Code is `translate="no"`; scrollable code is focusable.
  - Screen readers (verified with NVDA): don't make pieces of running text `inline-block` (they're read as separate lines), and give decorative pseudo-elements `content: ''; content: '' / '';` so they stay out of the accessibility tree.
  - Check with axe (headless Chrome over CDP) at desktop, phone and 320 px, light and dark, and without JavaScript.

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

## CI/CD (`.github/workflows`, GitHub repo `CosmosPay/Stellar-Snap`)

- `ci.yml` (every push and PR): `format:check`, `typecheck`, `npm test`, snap manifest unchanged by the build, site build.
- The site's home is **our own server** (`snap.cosmospay.lat`, nginx, shared with other Cosmos services), which deploys itself: `stellar-snap-web.timer` pulls `master` every 2 min and runs `deploy/update-snap-web.sh` (build with `/etc/stellar-snap-web.env`, release dir + atomic `current` swap, smoke test with rollback, IndexNow). Keep `deploy/` in step with what's installed. GitHub Pages is only a fallback.
- `website.yml` (master, site-related paths): builds the site with the repo's Actions **variables** (same names as `site/.env.example`) for Pages' folder (`BASE_PATH` from `configure-pages`) and deploys the fallback copy; canonical URLs stay on the main domain. With Pages off it only builds (a notice, not a failure).
- `version.yml` (master): while there are changesets, keeps the "Version packages" PR (`npm run version-packages` = `changeset version`, dated headings, snap rebuild for the manifest, lockfile). Needs "Allow GitHub Actions to create and approve pull requests".
- `release.yml` (master, `packages/snap|adapter`): publishes each package whose `version` isn't on npm (trusted publishing, else the `NPM_TOKEN` secret), with provenance, then a `<name>@<version>` GitHub release whose notes are the `CHANGELOG.md` entry (`scripts/release-notes.mts`; no entry, no publish). Its last job (`--sync`) rewrites any release whose notes differ from its entry: the changelogs are the source, releases and the website mirror them. `repository.url` must stay `https://github.com/CosmosPay/Stellar-Snap.git` or provenance fails.
- Releasing = merging the Version packages PR. By hand, `npm run version-packages` does the same (the snap build copies the version and the new shasum into `snap.manifest.json`).
- `.gitattributes` forces LF: the manifest's shasum covers `locales/*.json`, and a CRLF checkout (Windows `autocrlf`) gives a different shasum than CI.

## Related repos (siblings on the Desktop)

- `comos-pay-community-server`: NestJS swap server and source of the asset registry (`src/assets/assets.constants.ts`).
- `Cosmos-Pay-Developer-Platform`: APISIX gateway config (CORS in `src/utils/apisix.ts`).
