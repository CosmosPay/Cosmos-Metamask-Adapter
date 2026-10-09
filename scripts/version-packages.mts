/**
 * `npm run version-packages`: turns the pending changesets (.changeset/*.md) into new versions.
 * Changesets bumps each package.json and writes the entry into its CHANGELOG.md; then this dates
 * the new entries (`## 1.2.0` → `## 1.2.0 - 2026-10-09`, the website shows the date), rebuilds
 * the snap so its manifest carries the new version and bundle shasum, and brings
 * package-lock.json up to date. The Version workflow runs it for the "Version packages" pull
 * request; it works the same locally.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');

/** The published packages, by folder. */
const PACKAGES = ['snap', 'adapter'];

const run = (command: string) => execSync(command, { cwd: ROOT, stdio: 'inherit' });

run('npx changeset version');

const today = new Date().toISOString().slice(0, 10);
for (const name of PACKAGES) {
  const file = resolve(ROOT, 'packages', name, 'CHANGELOG.md');
  const changelog = readFileSync(file, 'utf8');
  writeFileSync(file, changelog.replace(/^## (\d+\.\d+\.\d+\S*)$/gmu, `## $1 - ${today}`));
}

run('npm run build -w packages/snap');
run('npm install --package-lock-only --ignore-scripts --no-audit --no-fund');
