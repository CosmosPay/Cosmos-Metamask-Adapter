/**
 * Prints a package's CHANGELOG.md entry for the version in its package.json, without the
 * heading: the notes of its GitHub release (release.yml).
 *
 *   node scripts/release-notes.mts packages/snap
 *
 * Fails when there's no entry, so a version is never published without its notes.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dir = resolve(process.argv[2] ?? '.');
const { name, version } = JSON.parse(readFileSync(resolve(dir, 'package.json'), 'utf8')) as {
  name: string;
  version: string;
};
const changelog = readFileSync(resolve(dir, 'CHANGELOG.md'), 'utf8');

// `## 1.2.0 - 2026-10-09` (or a bare `## 1.2.0`) up to the next version's heading.
const entry = changelog
  .split(/^## /mu)
  .slice(1)
  .find((section) => section.split('\n', 1)[0]?.split(' ')[0] === version);

if (!entry) {
  console.error(`${name}: CHANGELOG.md has no entry for ${version}. Add a changeset (npx changeset).`);
  process.exit(1);
}
console.log(entry.slice(entry.indexOf('\n') + 1).trim());
