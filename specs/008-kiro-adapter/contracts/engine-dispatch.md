# Contract: SSD Engine Dispatch

*API + guarantees for Part B (the `kiro-specs` vs `github-speckit` engine). The `github-speckit` engine is today's `lib.js` behavior extracted verbatim — it is the regression bar. Zero runtime dependencies.*

## `scripts/speckit/engines/<engine>.js`

Each module exports a `SpecEngine` (see [data-model §4](../data-model.md)):

```js
{ id, specsDir(root), listSpecs(root), specPath(name, root),
  docs: { primary, plan, tasks }, contextFiles, requiredArtifacts,
  readStatus(name, root), writeStatus(name, status, root) }
```

- **`github-speckit.js`** — `specsDir='specs'`; `listSpecs` = `NNN-*` dirs; `docs={primary:'spec.md',plan:'plan.md',tasks:'tasks.md'}`; `readStatus`/`writeStatus` = today's frontmatter/inline logic on `spec.md`. **Guarantee:** byte-for-byte the current behavior — extracted, not rewritten.
- **`kiro-specs.js`** — `specsDir='.kiro/specs'`; `listSpecs` = `.kiro/specs/*/` dirs (no `NNN-` filter); `docs={primary:'requirements.md',plan:'design.md',tasks:'tasks.md'}`; `readStatus`/`writeStatus` = the same frontmatter logic retargeted to `requirements.md`.

## `scripts/speckit/lib.js`

```js
manifestFacts(root)   // + ssd: (manifest.tools?.ssd) || 'github-speckit'
engineFor(root)       // ssd === 'kiro-specs' ? kiroSpecs : githubSpeckit
listSpecs, specPath, readStatus, writeStatus   // thin delegators to engineFor(root)
countTasks, extractCriteria, resolveSpec       // engine-agnostic — unchanged
```

- **Guarantee:** with `ssd` absent/`github-speckit`, `manifestFacts` and every delegator return exactly today's values (default resolution). `resolveSpec` works unchanged (built on `listSpecs`).
- **Guarantee:** `lib.js`'s public exports keep their signatures; new exports are additive (`engineFor`, `ssd` on facts).

## Consumer scripts (shape unchanged, engine-parameterized)

| Script | Change |
|---|---|
| `spec-status.js` | list/read/write via `lib` (delegates); "missing `spec.md`" wording → `engine.docs.primary`. |
| `fetch-speckit-context.js` | `FILE_ORDER` → `engine.contextFiles`; read `specDir/engine.docs.primary` (criteria) + `engine.docs.tasks`. |
| `verify-spec-compliance.js` | G2 reads `engine.docs.primary`; C1 required set → `engine.requiredArtifacts`; tasks file → `engine.docs.tasks`. |
| `doctor.js` | `specPath/spec.md` → `engine.docs.primary`; `tasks.md` → `engine.docs.tasks`. |

- **Guarantee:** under `github-speckit` the outputs are identical to today (same filenames resolved). Under `kiro-specs` the same checks run against `.kiro/specs/<feature>/{requirements,design,tasks}.md`.

## `hooks/pre-commit`

- Add `.kiro/` to the implementation-file exclude set (so kiro spec/steering edits are treated as docs, not implementation) and `.kiro/specs/` to the spec-change Notice.
- The gate still shells `verify-spec-compliance.js`, which now resolves the engine — so a `kiro-specs` repo is gated by its `.kiro/specs/<feature>` status with the same semantics.
- **Guarantee:** a `github-speckit` repo's gate behavior is unchanged.

## Notes

- *(analyze A6)* `fetch-speckit-context` writes the bundle to `.ai/context/<feature>.md` (engine-agnostic location). Under `kiro-specs` the bundle is drawn from `requirements.md`/`design.md`/`tasks.md` and the feature key is the Kiro feature name (no `NNN-`). Whether Kiro's agent consumes `.ai/context/*` or relies on its own `021.json` `resources` is a **follow-up** — 008 produces the bundle identically; wiring the kiro agent to it (if desired) is out of scope.

## Invariants

1. **`github-speckit` regression bar** — default resolution; the dogfood repo (`github-speckit`) sees zero behavior change across all scripts + the gate.
2. **One dispatch seam** — engine selection lives only in `lib.js engineFor`; consumers read `engine.docs`/metadata, never branch on `ssd` themselves.
3. **Status parity** — `kiro-specs` status has the same `STATUSES`/`GATE_PASSING` vocabulary and gate semantics as `github-speckit`; only the storage location differs (`requirements.md` vs `spec.md`).
