# Development and publishing

Requirements: Node 22.18+ and **MetaMask Flask** to load the local Snap. Architecture, conventions
and extension points: [`CLAUDE.md`](../CLAUDE.md).

## Commands

```bash
npm install
npm start                # Snap on :8080 (watch) + website on :5173
npm test                 # Snap (unit + integration, builds first) + adapter
npm run typecheck        # TypeScript in all three packages
npm run format           # Prettier (.prettierrc.json); format:check only checks, as CI does
npm run test:unit -w packages/snap          # unit tests only (fast, no MetaMask)
npm run test:live -w packages/snap          # real end-to-end on testnet: Friendbot, payment and swap
npm run sync:registry -w packages/snap      # refresh the bundled copy of the asset registry
npm run build                               # Snap, adapter and website
npm run indexnow -w packages/site           # notify IndexNow search engines after a deploy
npx changeset                               # describe a change to the Snap or the adapter for the changelog
npm run version-packages                    # turn the pending changesets into versions (CI does it)
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
| `VITE_SITE_URL` | Public domain (canonical URLs, `hreflang`, sitemap, social cards). Detected automatically on Vercel, Netlify, Cloudflare Pages and Render; without it the build warns and uses `https://snap.cosmospay.lat`. |
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
| `BASE_PATH` | Folder the site is served from when it isn't a domain's root, such as `/Stellar-Snap` for the GitHub Pages fallback. Empty (the default) for a domain of its own. |
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

## Continuous integration and deployment

The website lives on our own server, `snap.cosmospay.lat`, which deploys `master` by itself (see
[Production server](#production-server)). GitHub Pages only keeps a fallback copy. The GitHub
Actions workflows in `.github/workflows/` all use the Node version in `.nvmrc`:

| Workflow | Runs on | What it does |
| --- | --- | --- |
| `ci.yml` | Every push and pull request | Formatting (`npm run format:check`), types, the Snap's and the adapter's tests, a Snap manifest that matches its bundle, and the adapter and website builds. On pull requests, a changeset for every change to the Snap or the adapter. |
| `version.yml` | Pushes to `master` | While there are changesets, keeps the **Version packages** pull request up to date: the next versions and their changelogs. |
| `website.yml` | Pushes to `master` that change the website, the adapter's sources or the Snap's art and strings; or by hand | Builds the website and deploys the fallback copy to GitHub Pages, at `cosmospay.github.io/Stellar-Snap/`. Its canonical URLs point at the main domain. With Pages off, it only builds. |
| `release.yml` | Pushes to `master` that change `packages/snap` or `packages/adapter`; or by hand | Publishes each package whose `version` isn't on npm yet: tests, build, `npm publish` with provenance, then a `<name>@<version>` tag and a GitHub release whose notes are its `CHANGELOG.md` entry. |

### Changelog and releases

Every change to the Snap or the adapter that their users would notice comes with a **changeset**: a
small file in `.changeset/` naming the package, the bump (`patch`, `minor` or `major`) and what
changed, in English and for users ([how to write one](../.changeset/README.md)).

```bash
npx changeset           # pick the package(s) and the bump, then describe the change
npx changeset --empty   # a change nobody using the packages would notice
```

1. Commit the changeset with the change. On `master`, `version.yml` opens (or updates) the
   **Version packages** pull request, which runs `npm run version-packages`: Changesets bumps each
   package and writes its `CHANGELOG.md` entry, the script dates it (`## 0.2.1 - 2026-10-12`),
   rebuilds the Snap so its manifest has the new version and shasum, and updates the lockfile.
2. Merge that pull request to release. `release.yml` publishes every version that isn't on npm yet,
   with its changelog entry as the GitHub release's notes; a version without an entry isn't published.
   Then it syncs every release with its entry (`node scripts/release-notes.mts --sync`), so
   correcting an entry in `CHANGELOG.md` corrects its release too.
3. The website's changelog page (`/changelog/`, in the nav) reads both `CHANGELOG.md` files when
   it's built, so it shows the new versions as soon as our server deploys `master`.

Each package's `CHANGELOG.md` also ships to npm. Edit an entry there by hand if needed: the page
reads `## <version> - <date>`, `### Major|Minor|Patch Changes` and `-` lists, as Changesets writes them.

### Production server

The server pulls, nothing pushes to it: `stellar-snap-web.timer` asks GitHub every 2 minutes
whether `master` moved and, if it did, runs [`deploy/update-snap-web.sh`](../deploy/update-snap-web.sh)
as the `snapweb` user. A run with nothing new is one `git ls-remote`.

1. It checks out the commit in `/opt/stellar-snap-web/src`, runs `npm ci` and builds the website
   with the settings in `/etc/stellar-snap-web.env` (same names as `packages/site/.env`). A commit
   whose site doesn't build is never published.
2. It copies the build to `/var/www/stellar-snap/releases/<time>-<commit>/` and points
   `/var/www/stellar-snap/current` (nginx's root) at it in one atomic swap.
3. It loads `/` and `/en/` and their script through nginx, and swaps back if they fail.
4. It keeps the last 5 builds and announces the pages to IndexNow.

```bash
journalctl -u stellar-snap-web -n 50          # what the last deploys did
sudo systemctl start stellar-snap-web         # deploy now instead of waiting
systemctl list-timers stellar-snap-web.timer  # when it checks next
```

To undo a change, revert it on `master`: the next run deploys the revert. In an emergency, stop
the timer (`sudo systemctl stop stellar-snap-web.timer`) and point `current` at an earlier
release. To set the server up again, install the script as `/usr/local/bin/update-snap-web.sh`,
the two units from `deploy/` in `/etc/systemd/system/` and
[`deploy/stellar-snap-web.env.example`](../deploy/stellar-snap-web.env.example) as
`/etc/stellar-snap-web.env`; create the `snapweb` system user, give it `/opt/stellar-snap-web` and
`/var/www/stellar-snap`, then `systemctl enable --now stellar-snap-web.timer`.

### One-time setup

1. **The GitHub Pages fallback.** In the repository's Settings → Pages, set the source to
   **GitHub Actions**, with no custom domain: `snap.cosmospay.lat` belongs to our host. The copy is
   built for its folder (`BASE_PATH=/Stellar-Snap`, from Pages itself). If our host goes down for
   a while, point the domain at Pages (custom domain in Settings → Pages, plus a `CNAME` record to
   `cosmospay.github.io`) and run `website.yml` again: it builds for the domain's root then.
2. **Website settings.** The fallback build reads the variables of
   [`packages/site/.env`](#website-packagessiteenv) from the repository's Actions **variables**
   (Settings → Secrets and variables → Actions → Variables), with the same names. They end up in the
   public site, so they're variables, not secrets. Without `VITE_SITE_URL`, URLs use the main
   domain.
3. **Version pull requests.** In Settings → Actions → General → Workflow permissions, turn on
   "Allow GitHub Actions to create and approve pull requests", so `version.yml` can open them.
   Pull requests opened with the workflow's token don't start other workflows: CI runs once the
   pull request is merged, and `release.yml` tests each package again before publishing it.
4. **npm.** The `@cosmosapp` scope must exist on npm. Publishing authenticates in one of two ways:
   - **Trusted publishing** (preferred, no secret): on npmjs.com, in each package's Settings →
     Trusted publishing, add GitHub Actions with organization `CosmosPay`, repository `Stellar-Snap`
     and workflow `release.yml`.
   - **An `NPM_TOKEN` secret**: a granular access token that can publish the `@cosmosapp` packages.
     A package's first version needs it, since npm only trusts a publisher for a package that
     exists. Once both packages are published and trusted publishing is set up, delete the secret.

   Provenance ties each version to this repository, so `repository.url` in both `package.json` files
   must stay `https://github.com/CosmosPay/Stellar-Snap.git`.

## Publishing

1. **npm.** `release.yml` publishes `packages/snap` (`@cosmosapp/stellar-snap`) and
   `packages/adapter` (`@cosmosapp/stellar-metamask-adapter`); see above. By hand, it's
   `npm publish -w <package>`. Both have `publishConfig.access: public`, which scoped packages need.
2. **MetaMask.** The Snap needs a MetaMask **audit and allowlisting** to install on stable MetaMask
   (it uses `snap_getBip32Entropy`): https://docs.metamask.io/snaps/how-to/get-allowlisted/.
   Meanwhile it installs on MetaMask Flask.
3. **SDK.** `platformVersion` is pinned to `12.0.1` (the highest in stable MetaMask); don't bump
   `@metamask/snaps-sdk` without checking.
4. **Website.** `npm run build -w packages/site` generates static HTML: one page per route and
   language (Spanish at `/`, the others under `/en/`, `/pt/`, `/fr/`, `/de/`, `/zh/`, `/hi/`), plus
   `404.html`, `sitemap.xml`, `robots.txt`, `llms.txt` and `llms-full.txt`. Serve
   `packages/site/dist` from any static host that answers unknown routes with `404.html`; our
   server deploys it by itself, and `website.yml` keeps the fallback copy on GitHub Pages.
5. **Search engines.** Verify the domain in Google Search Console and Bing Webmaster Tools (with the
   variables above, or a domain property), submit `https://your-domain/sitemap.xml` and, if you use
   IndexNow, run `npm run indexnow -w packages/site` after every deploy (our server does it).
