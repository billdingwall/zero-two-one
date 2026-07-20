# Quickstart: CI Publish Pipeline & Pre-Publish Gate

*How to dry-run the release locally, and the real release ritual.*

## Gate the tree locally (same verdict as CI)

```sh
npm run prepublish:check
```

Expected on a clean tree:

```
✓ no dangling main
✓ LICENSE present
✓ no .ai/context bundle in tarball
✓ no broken links
✓ no spec/dev-file leak in tarball
✓ shipped README present and non-trivial
pre-publish gate: PASS
```

## Watch it catch a regression

The gate is **tarball-aware** — it inspects what `npm pack` would actually ship (the `files` whitelist is the first line of defense), so demonstrate with a file type that *is* shipped. `.ai/` ships as an empty scaffold, so a stray generated bundle would leak:

```sh
echo '# generated' > package/.ai/context/013-x.md
npm run prepublish:check          # → ✗ (c) .ai/context bundle would ship: .ai/context/013-x.md  → exit 1
rm -f package/.ai/context/013-x.md   # clean up
```

*(A stray `package/specs/099-x/spec.md` would **not** trip the gate — `specs/` isn't in the package `files` whitelist, so it never enters the tarball. The gate flags only what would truly ship; the `(e)` spec/dev-leak check guards against a misconfigured whitelist.)*

Other regressions it fails on: a dangling `main`, a missing `LICENSE`, an unresolved Markdown link, a dev-only file that would ship, or a missing/empty shipped `package/README.md`.

## Dry-run the publish (no registry write)

```sh
npm run sync:package -- --check           # drift guard
npm run prepublish:check                  # the gate
cd package && npm publish --dry-run       # shows exactly what would ship; publishes nothing
```

## The real release (maintainer)

**One-time setup (out of scope for the spec):** configure a **trusted publisher** for `zero-two-one` on npmjs.com (repo `billdingwall/zero-two-one`, workflow `publish.yml`) — or seed the first publish with `npm run publish:package`, then let CI take over.

**Each release:**

```sh
# bump the version in root package.json + package/package.json, commit, then:
git tag v1.1.0
git push --tags
```

The `Publish` workflow fires on the tag: `sync --check` → gate → `npm publish --provenance` from `package/`. The package lands on npm with a provenance attestation, installable via `npx zero-two-one-init` / `npx 021 …`.

## Manual fallback

`npm run publish:package` still works (sync + `cd package && npm publish`) for the rare case CI is unavailable — the documented exception, not the primary path.
