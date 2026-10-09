/**
 * Reads a package's CHANGELOG.md as Changesets writes it (.changeset/README.md):
 *
 *   ## 1.2.0 - 2026-10-09          a version, dated by scripts/version-packages.mts
 *   ### Minor Changes              its changes, grouped by the size of the bump
 *   - abc1234: What changed.       a change (the commit that brought it, then its text)
 *     More about it.               its details, indented: paragraphs (a blank line between
 *     - A detail.                  them) and lists
 *
 * Anything before the first version (the title and intro) is skipped. Texts come out in the
 * site's markup (lib/markup.ts), ready for RichText.
 */

/** The bump a group of changes made: `major` breaks existing users, `minor` adds, `patch` fixes. */
export type ChangeKind = 'major' | 'minor' | 'patch';

/** A paragraph, or a bulleted list. */
export type ChangeBlock = string | string[];

export type Change = { text: string; details: ChangeBlock[] };

/** `kind` is null for a heading Changesets doesn't write; `heading` keeps it as written. */
export type ChangeGroup = { kind: ChangeKind | null; heading: string; changes: Change[] };

/** `date` is an ISO day, or null when the heading has none. `notes` is text outside any group. */
export type Release = { version: string; date: string | null; groups: ChangeGroup[]; notes: string[] };

const VERSION_HEADING = /^## (\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)(?: - (\d{4}-\d{2}-\d{2}))?$/u;
const GROUP_HEADING = /^### (.+)$/u;
const KINDS: Record<string, ChangeKind> = {
  'Major Changes': 'major',
  'Minor Changes': 'minor',
  'Patch Changes': 'patch',
};

/** Markdown's inline syntax in the site's: **bold** → *bold*; code and links read the same. */
const toMarkup = (text: string) =>
  text.replace(
    /\*\*([^*]+)\*\*|__([^_]+)__/gu,
    (_match, stars?: string, underscores?: string) => `*${stars ?? underscores}*`,
  );

/** Changesets puts the commit that added a change before its text (`abc1234: `). */
const withoutCommit = (text: string) => text.replace(/^[0-9a-f]{7,40}: /u, '');

/** A package's releases, newest first as the file lists them. Throws on a `##` heading that isn't a version. */
export function parseChangelog(markdown: string): Release[] {
  const releases: Release[] = [];
  let release: Release | undefined;
  let group: ChangeGroup | undefined;
  let change: Change | undefined;
  /** What the next indented line continues: the change's text, a detail paragraph or list, or nothing (after a blank line). */
  let open: 'text' | 'paragraph' | 'list' | null = null;

  const append = (text: string) => {
    if (!change) return;
    const last = change.details.at(-1);
    if (open === 'text') change.text += ` ${text}`;
    else if (open === 'paragraph' && typeof last === 'string')
      change.details[change.details.length - 1] = `${last} ${text}`;
    else if (open === 'list' && Array.isArray(last)) last[last.length - 1] += ` ${text}`;
  };

  for (const raw of markdown.replace(/\r\n?/gu, '\n').split('\n')) {
    const line = raw.trimEnd();
    if (line.startsWith('## ')) {
      const match = VERSION_HEADING.exec(line);
      if (!match) throw new Error(`CHANGELOG.md: "${line}" isn't a version heading (## 1.2.3 - 2026-10-09)`);
      release = { version: match[1] ?? '', date: match[2] ?? null, groups: [], notes: [] };
      releases.push(release);
      group = change = undefined;
      open = null;
      continue;
    }
    if (!release) continue;
    if (line === '') {
      open = null;
      continue;
    }

    const heading = GROUP_HEADING.exec(line);
    const indent = line.length - line.trimStart().length;
    const text = line.trim();
    if (heading) {
      const name = heading[1] ?? '';
      group = { kind: KINDS[name] ?? null, heading: name, changes: [] };
      release.groups.push(group);
      change = undefined;
      open = null;
    } else if (indent === 0 && text.startsWith('- ') && group) {
      change = { text: toMarkup(withoutCommit(text.slice(2))), details: [] };
      group.changes.push(change);
      open = 'text';
    } else if (indent > 0 && change) {
      const last = change.details.at(-1);
      if (text.startsWith('- ')) {
        if (open === 'list' && Array.isArray(last)) last.push(toMarkup(text.slice(2)));
        else change.details.push([toMarkup(text.slice(2))]);
        open = 'list';
      } else if (open) {
        append(toMarkup(text));
      } else {
        change.details.push(toMarkup(text));
        open = 'paragraph';
      }
    } else {
      release.notes.push(toMarkup(text.replace(/^- /u, '')));
    }
  }
  return releases;
}
