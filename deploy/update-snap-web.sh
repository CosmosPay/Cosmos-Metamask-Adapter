#!/usr/bin/env bash
# Keeps https://snap.cosmospay.lat on the latest commit of master.
#
# Pull, never push: the server asks GitHub (public repo, read-only, no credentials)
# whether master moved, and only then builds and publishes it. Nothing outside can
# connect in. Run every few minutes by stellar-snap-web.timer; a run with nothing
# new is one `git ls-remote` and exits.
#
# master, not tags: the site has no releases of its own. A commit whose site doesn't
# build (the build type-checks it) is never published, and a smoke test through
# nginx swaps back if the new pages or their script don't load.
#
# Layout: $ROOT/releases/<time>-<commit>/ per build, $ROOT/current -> the live one
# (nginx serves the site from $ROOT/current/). Publishing is one atomic symlink swap.
# After a deploy, the pages are announced to IndexNow when INDEXNOW_KEY is set.
#
# Usage: update-snap-web.sh             deploy master if it moved
#        update-snap-web.sh --force     rebuild and republish master anyway
#        update-snap-web.sh <commit>    publish that commit (manual pin / rollback)
set -euo pipefail

REPO_URL=${SNAP_WEB_REPO_URL:-https://github.com/CosmosPay/Stellar-Snap.git}
BRANCH=${SNAP_WEB_BRANCH:-master}
STATE=${SNAP_WEB_STATE:-/opt/stellar-snap-web}
ROOT=${SNAP_WEB_ROOT:-/var/www/stellar-snap}
SITE=${SNAP_WEB_SITE:-snap.cosmospay.lat}
KEEP=${SNAP_WEB_KEEP:-5}
SRC="$STATE/src"

# Build-time settings (packages/site/.env.example). Without the address, canonical
# URLs, the sitemap and social cards would point at config.ts's fallback.
: "${VITE_SITE_URL:?set it in /etc/stellar-snap-web.env}"

exec 9>"$STATE/.lock"
flock -n 9 || exit 0

case "${1:-}" in
  "" | --force) COMMIT=$(git ls-remote "$REPO_URL" "refs/heads/$BRANCH" | cut -f1) ;;
  *) COMMIT=$1 ;;
esac
[[ "$COMMIT" =~ ^[0-9a-f]{7,40}$ ]] || { echo "no commit for $BRANCH" >&2; exit 1; }

LIVE=$(readlink "$ROOT/current" 2>/dev/null || true)
if [ -z "${1:-}" ] && [[ "${LIVE##*/}" == *-"${COMMIT:0:12}" ]]; then exit 0; fi

[ -d "$SRC/.git" ] || git clone -q "$REPO_URL" "$SRC"
git -C "$SRC" fetch -q --force origin "$BRANCH"
git -C "$SRC" checkout -q --force --detach "$COMMIT"
git -C "$SRC" clean -qfdx -e node_modules
COMMIT=$(git -C "$SRC" rev-parse HEAD)
echo "deploying ${COMMIT:0:12} $(git -C "$SRC" log -1 --format=%s) (live: ${LIVE##*/})"

cd "$SRC"
npm ci --no-audit --no-fund --loglevel=error
# Our host serves the site at the domain's root (BASE_PATH is the GitHub Pages fallback's).
BASE_PATH= npm run build -w packages/site --silent >/dev/null

DIST="$SRC/packages/site/dist"
grep -q "<loc>$VITE_SITE_URL/</loc>" "$DIST/sitemap.xml" || { echo "sitemap isn't for $VITE_SITE_URL, not publishing" >&2; exit 1; }
grep -q 'src="/assets/' "$DIST/index.html" || { echo "build isn't at the domain's root, not publishing" >&2; exit 1; }
[ -f "$DIST/404.html" ] || { echo "404.html missing, not publishing" >&2; exit 1; }

NEW="$ROOT/releases/$(date -u +%Y%m%dT%H%M%SZ)-${COMMIT:0:12}"
mkdir -p "$ROOT/releases"
rm -rf "$NEW.tmp" && cp -a "$DIST" "$NEW.tmp" && chmod -R a+rX "$NEW.tmp"
mv "$NEW.tmp" "$NEW"
ln -sfn "$NEW" "$ROOT/current.tmp" && mv -T "$ROOT/current.tmp" "$ROOT/current"

# The home and an English page through nginx, and the script they load.
smoke() {
  local page html js=
  for page in / /en/; do
    html=$(curl -fsk --max-time 10 --resolve "$SITE:443:127.0.0.1" "https://$SITE$page") || return 1
    [[ $html =~ src=\"(/assets/index-[^\"]+\.js)\" ]] || return 1
    js=${BASH_REMATCH[1]}
  done
  curl -fsk --max-time 10 -o /dev/null --resolve "$SITE:443:127.0.0.1" "https://$SITE$js"
}
if ! smoke; then
  echo "smoke test failed, back to ${LIVE##*/}" >&2
  [ -n "$LIVE" ] && ln -sfn "$LIVE" "$ROOT/current.tmp" && mv -T "$ROOT/current.tmp" "$ROOT/current"
  exit 1
fi
echo "live: ${NEW##*/}"

# Keep the newest $KEEP builds, never the live one.
{ ls -1dt "$ROOT"/releases/*/ 2>/dev/null | sed 's#/$##' | grep -vxF "$NEW" || true; } \
  | tail -n +"$KEEP" | xargs -r rm -rf

# Tell the IndexNow search engines; a failure here doesn't undo the deploy.
if [ -n "${INDEXNOW_KEY:-}" ]; then
  node packages/site/scripts/indexnow.mts || echo "IndexNow announcement failed" >&2
fi
