/**
 * GitHub release notes from the packages' CHANGELOG.md files: each release's notes are its
 * version's entry (without the heading), then links to npm and to the entry on the website's
 * changelog page. The changelog is the source; the releases mirror it.
 *
 *   node scripts/release-notes.mts packages/snap   print the notes for the version in package.json
 *   node scripts/release-notes.mts --sync          make every release that has an entry show it
 *
 * Printing fails when there's no entry, so release.yml never publishes a version without its
 * notes. Syncing (release.yml, after publishing) rewrites only the releases whose notes or title
 * differ, so an entry edited later reaches its release too; it needs the GitHub CLI (`gh`), with
 * GH_TOKEN or a login, and GH_REPO when the git remote isn't the repository.
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

/** The website's changelog page; each release has an anchor there (`#snap-0.2.0`). */
const CHANGELOG_PAGE = 'https://snap.cosmospay.lat/en/changelog/';

/** The published packages, by folder (also the page's anchor prefix). */
const PACKAGES = ['snap', 'adapter'];

type Package = { id: string; name: string; version: string; entries: Map<string, string> };

/** A package folder's name, version and changelog entries by version. */
function readPackage(dir: string): Package {
  const { name, version } = JSON.parse(readFileSync(resolve(dir, 'package.json'), 'utf8')) as {
    name: string;
    version: string;
  };
  const entries = new Map<string, string>();
  // `## 1.2.0 - 2026-10-09` (or a bare `## 1.2.0`) up to the next version's heading.
  for (const section of readFileSync(resolve(dir, 'CHANGELOG.md'), 'utf8').split(/^## /mu).slice(1)) {
    const end = section.indexOf('\n');
    entries.set(section.slice(0, end).split(' ')[0] ?? '', section.slice(end + 1).trim());
  }
  return { id: basename(resolve(dir)), name, version, entries };
}

const title = (pkg: Package, version: string) => `${pkg.name} ${version}`;

function notes(pkg: Package, version: string, entry: string): string {
  const npm = `https://www.npmjs.com/package/${pkg.name}/v/${version}`;
  return `${entry}\n\n---\n\n[${pkg.name}@${version} on npm](${npm}) · [Every version, on the website](${CHANGELOG_PAGE}#${pkg.id}-${version})`;
}

const gh = (...args: string[]) => execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });

/** Updates each existing release whose notes or title aren't its changelog entry's. */
function sync(): void {
  const scratch = mkdtempSync(join(tmpdir(), 'release-notes-'));
  for (const id of PACKAGES) {
    const pkg = readPackage(join(ROOT, 'packages', id));
    for (const [version, entry] of pkg.entries) {
      const tag = `${pkg.name}@${version}`;
      let release: { name: string; body: string };
      try {
        release = JSON.parse(gh('release', 'view', tag, '--json', 'name,body')) as typeof release;
      } catch {
        continue; // No release for this version (yet): release.yml creates it when it publishes.
      }
      const body = notes(pkg, version, entry);
      if (release.body.trim() === body && release.name === title(pkg, version)) continue;
      const file = join(scratch, `${id}-${version}.md`);
      writeFileSync(file, body);
      gh('release', 'edit', tag, '--title', title(pkg, version), '--notes-file', file);
      console.log(`${tag}: notes updated from CHANGELOG.md`);
    }
  }
}

if (process.argv[2] === '--sync') {
  sync();
} else {
  const pkg = readPackage(process.argv[2] ?? '.');
  const entry = pkg.entries.get(pkg.version);
  if (!entry) {
    console.error(`${pkg.name}: CHANGELOG.md has no entry for ${pkg.version}. Add a changeset (npx changeset).`);
    process.exit(1);
  }
  console.log(notes(pkg, pkg.version, entry));
}
