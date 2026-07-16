# Research & Decisions: Safe Install & Merge Engine

*Rolls up the design decisions behind [plan.md](plan.md). The user-facing decision log lives in the spec's `## Clarifications` (4 sessions); this captures the rationale and the rejected alternatives.*

## Resolved decisions

| # | Decision | Rationale | Rejected alternative |
|---|---|---|---|
| R1 | **Plan-then-apply** pipeline | A single classify pass makes `--dry-run` a free byproduct and keeps apply logic dumb. | Apply-as-you-go — makes dry-run a second code path that can drift. |
| R2 | **Hash-based modification detection** | The only way to tell "unmodified framework file" (safe to refresh) from "user-customized" (conflict) without a VCS assumption. | Mtime comparison — unreliable across clones/checkouts. |
| R3 | **LF-normalize before hashing** (FR-015) | Windows/`autocrlf` checkouts otherwise flag every framework file as modified → spurious conflicts. | Byte-exact hashing — precise but breaks cross-platform re-runs. |
| R4 | **Framework-owned-only `files{}`** (FR-009) | Conflict detection is only defined for framework files; user files are never touched, merged/generated churn. Smallest stable inventory. | Hash everything — noisy, perpetually "mismatched" generated files. |
| R5 | **Conflicts exit 0** (FR-013) | A customized framework file is a normal state on re-run; failing CI on it would punish expected use. | Non-zero exit — turns every customized-repo re-run into a red build. |
| R6 | **Preserve user value on `package.json` collision** (FR-005) | Script definitions a user wrote are user content; the never-touch-user ethos applies. | Framework-wins — silently rewrites user commands. |
| R7 | **Respect merged-entry deletions** via a `merged` contribution record (FR-005) | Distinguishes "never added" from "added then removed" so a deliberate deletion isn't undone. | Pure idempotent re-add — stateless but overrides user intent. |
| R8 | **Adopt current state on missing manifest** (FR-014) | Never overwrite without hash proof; a deleted/absent manifest must not become a clobbering event. | Re-assert framework files — risks destroying user edits. |
| R9 | **Preserve `installedAt`, add `updatedAt`** (FR-009) | Keeps the first-install date meaningful while recording last activity. | Overwrite `installedAt` — loses provenance. |
| R10 | **Keep upgrade orphans, report only** (FR-010) | Deleting a file the user may depend on is riskier than leaving cruft; uninstall is the delete path. | Auto-delete orphans — can remove customized files. |
| R11 | **Prerequisites are non-fatal** (FR-016) | Zero-config `npx` must work on a bare dir; create `package.json`, stage the hook for later `git init`. | Abort on missing prereq — breaks the happy path. |
| R12 | **Heuristic `mode: source` detection** (FR-011) | The maintainer dogfood case shouldn't need a flag; the signature (`sync-to-package.js` + `package/`) is unambiguous in practice. | Require `--source` — easy to forget, breaks the auto-dogfood. |

## Open (deferred, not blocking)

- **`--json` report emission** — should follow the repo's `workflow-status.js --json` machine-readable contract; specified when a consumer needs it.
- **Atomic apply / staging** — partial-write recovery currently relies on idempotent re-run; atomic staging is a later hardening (see plan Risks).
- **TDD §7 sync** — *done.* `updatedAt` + `merged` contribution record + framework-owned-only LF-normalized `files` are now reflected in `requirements/03-TDD.md` §7 (mvp-3 changelog entry).

## Zero-dependency confirmation

Every capability maps to a Node built-in: hashing → `node:crypto`; fs walk/copy/merge → `node:fs`/`node:path`; git presence → `node:child_process`; prompts (migrate only, out of scope) → `node:readline`; tests → `node:test`. No package is required, so `npm run lint`'s dependency-free assertion holds.
