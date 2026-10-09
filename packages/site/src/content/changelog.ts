import adapterChangelog from '@adapter/CHANGELOG.md?raw';
import snapChangelog from '@snap/CHANGELOG.md?raw';
import { ADAPTER_PACKAGE, REPO_URL, SNAP_PACKAGE } from '@/config';
import { parseChangelog, type Release } from '@/lib/changelog';

/**
 * The changelog page's releases: both published packages' CHANGELOG.md files
 * (written by Changesets, see .changeset/README.md), read at build time.
 */

export type ChangelogPackage = 'snap' | 'adapter';

/** npm name per package; the page names them in the reader's language. */
export const CHANGELOG_PACKAGES: Record<ChangelogPackage, string> = {
  snap: SNAP_PACKAGE,
  adapter: ADAPTER_PACKAGE,
};

export type PackageRelease = Release & {
  package: ChangelogPackage;
  /** Unique in the page, for anchors and keys: `snap-0.2.0`. */
  id: string;
  npmUrl: string;
  /** Its GitHub release, whose notes are this same entry (release.yml). */
  releaseUrl: string;
};

const releasesOf = (pkg: ChangelogPackage, markdown: string): PackageRelease[] =>
  parseChangelog(markdown).map((release) => {
    const name = CHANGELOG_PACKAGES[pkg];
    return {
      ...release,
      package: pkg,
      id: `${pkg}-${release.version}`,
      npmUrl: `https://www.npmjs.com/package/${name}/v/${release.version}`,
      releaseUrl: `${REPO_URL}/releases/tag/${encodeURIComponent(`${name}@${release.version}`)}`,
    };
  });

/** Every release of both packages, newest first; a package's releases keep their file order on the same day. */
export const RELEASES: PackageRelease[] = [
  ...releasesOf('snap', snapChangelog),
  ...releasesOf('adapter', adapterChangelog),
].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));

/** The newest release's day, for the page's dateModified and the sitemap. */
export const CHANGELOG_UPDATED = RELEASES.find((release) => release.date)?.date ?? undefined;

/** The repository's releases as an Atom feed, for readers who follow new versions. */
export const RELEASES_FEED = `${REPO_URL}/releases.atom`;
