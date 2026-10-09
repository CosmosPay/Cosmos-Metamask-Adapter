# Changesets

Each file here is one change to a published package, waiting for its release. They become the
packages' `CHANGELOG.md`, their GitHub release notes and the website's changelog page
(`/changelog/`), so write them for the people who use the Snap or the adapter.

```bash
npx changeset           # pick the package(s) and the bump, then describe the change
npx changeset --empty   # a change nobody using the packages would notice (tests, refactors)
```

- **Bump:** `patch` fixes and small improvements, `minor` new features, `major` changes that break
  existing users (a dApp's calls to the adapter, the Snap's `stellar_*` API).
- **Text:** English, one sentence in the past tense saying what changed for the user, then details
  on indented lines or a list if needed. `code`, **bold** and [links](https://…) are fine.

On `master`, the Version workflow keeps a "Version packages" pull request with the next versions
and their changelogs. Merging it publishes them (`release.yml`).
