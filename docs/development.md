# Development and publishing

Requirements: Node 22.18+ and **MetaMask Flask** to load the local Snap. Architecture, conventions
and extension points: [`CLAUDE.md`](../CLAUDE.md).

## Commands

```bash
npm install
npm start                # Snap on :8080 (watch) + website on :5173
npm test                 # Snap (unit + integration, builds first) + adapter
npm run typecheck        # TypeScript in all three packages
npm run format           # Prettier (.prettierrc.json)
npm run test:unit -w packages/snap          # unit tests only (fast, no MetaMask)
npm run test:live -w packages/snap          # real end-to-end on testnet: Friendbot, payment and swap
npm run sync:registry -w packages/snap      # refresh the bundled copy of the asset registry
npm run build                               # Snap, adapter and website
npm run indexnow -w packages/site           # notify IndexNow search engines after a deploy
```

## Environment variables

Each package reads its own `.env` (git-ignored). Copy the example and fill in what you need; every
variable is optional.

```bash
cp packages/site/.env.example packages/site/.env
cp packages/snap/.env.example packages/snap/.env
```

### Website (`packages/site/.env`)

`VITE_` variables end up in the public website: never put a secret in one.

| Variable | What for |
| --- | --- |
| `VITE_SITE_URL` | Public domain (canonical URLs, `hreflang`, sitemap, social cards). Detected automatically on Vercel, Netlify, Cloudflare Pages and Render; the build warns when it's missing. |
| `VITE_SNAP_ID` | Snap the install button installs. Default: the local Snap during development and `npm:@cosmosapp/stellar-snap` in a build. |
| `VITE_DONATION_ADDRESS` | Stellar account (`G…`, public network) that receives donations: turns on the Donate section with its QR code. |
| `VITE_DONATION_URL` | A page with other ways to donate (GitHub Sponsors, Open Collective…). |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 ID (`G-…`). It loads only if the visitor accepts the notice; it measures page views and Core Web Vitals, and the privacy policy describes it. |
| `VITE_GOOGLE_SITE_VERIFICATION` | Google Search Console verification. |
| `VITE_BING_SITE_VERIFICATION` | Bing Webmaster Tools verification. |
| `VITE_YANDEX_VERIFICATION` | Yandex Webmaster verification. |
| `VITE_BAIDU_SITE_VERIFICATION` | Baidu verification. |
| `VITE_NAVER_SITE_VERIFICATION` | Naver verification. |
| `VITE_SEZNAM_VERIFICATION` | Seznam verification. |
| `INDEXNOW_KEY` | IndexNow key (8 to 128 letters, digits or dashes). The build publishes `/<key>.txt`, and `npm run indexnow -w packages/site` announces every page to Bing, Yandex, Naver and Seznam. |

The verification tags aren't needed when a domain property verified by DNS already covers the site
(Bing can import it from Google Search Console).

### Snap (`packages/snap/.env`)

| Variable | What for |
| --- | --- |
| `COSMOS_API_KEY_TESTNET` | Cosmos Pay API `dev` key (testnet only). |
| `COSMOS_API_KEY_MAINNET` | Cosmos Pay API `prod` key (mainnet only). |

Without them, the Snap uses the shared public key it fetches at runtime. They're built into the
Snap's code, which anyone can read: use keys meant to be public.

## Publishing

1. **npm.** Publish `packages/snap` (`@cosmosapp/stellar-snap`) and `packages/adapter`
   (`@cosmosapp/stellar-metamask-adapter`) with `npm publish -w <package>`. They already have
   `publishConfig.access: public`, which scoped packages need.
2. **MetaMask.** The Snap needs a MetaMask **audit and allowlisting** to install on stable MetaMask
   (it uses `snap_getBip32Entropy`): https://docs.metamask.io/snaps/how-to/get-allowlisted/.
   Meanwhile it installs on MetaMask Flask.
3. **SDK.** `platformVersion` is pinned to `12.0.1` (the highest in stable MetaMask); don't bump
   `@metamask/snaps-sdk` without checking.
4. **Website.** `npm run build -w packages/site` generates static HTML: one page per route and
   language (Spanish at `/`, the others under `/en/`, `/pt/`, `/fr/`, `/de/`, `/zh/`, `/hi/`), plus
   `404.html`, `sitemap.xml`, `robots.txt`, `llms.txt` and `llms-full.txt`. Serve
   `packages/site/dist` from any static host, which must answer unknown routes with `404.html`.
5. **Search engines.** Verify the domain in Google Search Console and Bing Webmaster Tools (with the
   variables above, or a domain property), submit `https://your-domain/sitemap.xml` and, if you use
   IndexNow, run `npm run indexnow -w packages/site` after every deploy.
