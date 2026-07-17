---
status: Applied
round: 9
---

# r9 Update Plan: Package distribution & sync (Group A)

**Date:** 2026-07-16 · **Source:** [r9-review.md](r9-review.md) §A · [_notes/repo-refactor.md](../_notes/repo-refactor.md) P1/W2/W3
**Targets:** `scripts/sync-to-package.js` · `package/package.json` · `.gitignore` · `package/specs/` (removed)

## Intent
Stop shipping the framework's own internal feature specs (P1), make `.claude/commands` single-sourced from root (W2), and drop `.DS_Store` noise (W3).

## Applied edits
1. **P1** — `sync-to-package.js`: removed `specs` from `dirsToCopy`; added a `specs/` removal alongside the existing `prototype/` cleanup. `package/package.json` `files`: dropped `"specs/"`. `package/specs/` deleted. Result: tarball **128→90 files, 130→69 kB**; `npm pack` ships **0** internal spec files.
2. **W2** — `sync-to-package.js`: added `.claude/commands` to `dirsToCopy`; removed `.claude` from `preserveInPackage`; removed the now-redundant explicit `.claude/commands` drift-check (the general working-tree-vs-index diff covers it). Root is the single source; drift-check enforces it.
3. **W3** — `.gitignore` gains `.DS_Store`; the tracked root `.DS_Store` de-tracked (`git rm --cached`).

## Cascade
TDD §5 updated to match (see [r9-update-tdd.md](r9-update-tdd.md)); mvp-6 pre-publish gate gains a tarball-content regression check ([r9-update-releases.md](r9-update-releases.md)).
