# Research & Decisions: Source Layer & Stack-Parameterized Renderer

*Rationale behind [plan.md](plan.md). The user-facing log is the spec's `## Clarifications`; this captures the why + rejected alternatives.*

## Resolved decisions

| # | Decision | Rationale | Rejected alternative |
|---|---|---|---|
| R1 | **Registry in a new `scripts/init/adapters.js`** | Both `classes.js` and `sources.js` need the stack→surface bindings; a sibling module they both import avoids a require cycle and gives 007/008 one obvious place to add a stack. Separates adapter *data* from ownership *logic*. | Put it in `classes.js` (grows the file, `sources.js` still imports it); put it in `lib.js` (widens the read-only manifest parser's role). |
| R2 | **Renderer in a new `scripts/init/render.js`** | A called module keeps TDD §9.1's intent ("transforms in `bin/init.js`") while staying unit-testable in isolation — which the golden-fixture regression needs. | Fold into `apply.js` (already busy; harder to test); put literal logic in `bin/init.js` (the thin CLI shell; can't unit-test without spawning). |
| R3 | **Drop `CLAUDE-Template.md`; render `CLAUDE.md` directly** | `ASSISTANT-Template.md` as the single source is the truest form of the §9.1 inversion and removes the two-files-in-sync drift W1 warns about. The `claude` transform is authored to be byte-identical to today's template, so nothing regresses. | Keep `CLAUDE-Template.md` as a **re-derived committed artifact** (repo-refactor §4.4 / r9-review §47) — reintroduces the exact sync surface the inversion targets. |
| R4 | **Golden fixture pins today's `CLAUDE.md` bytes** | The byte-identical guarantee needs a static reference independent of the template; committing the expected output makes any transform drift a test failure, not a silent change. | Compare against a live `CLAUDE-Template.md` (deleted in R3); trust code review (no automated guard). |
| R5 | **`classify()` returns `null` for a non-chosen stack's surface dirs** | "Un-chosen stacks install nothing" (FR-009) falls out of the existing ownership model: outside-the-managed-surface = never created/refreshed. No new class needed. | A new "inactive" class (more machinery); filter after classify (leaks non-chosen paths into the plan). |
| R6 | **Reuse `resolveTools()`'s stack; thread it through `classifyAll`** | The active stack is already resolved (`index.js:39`) from `opts.stack` / prev manifest / `claude` default. Threading that one value into `classes.js`/`sources.js` is the whole seam — no new resolution logic. | Re-read the manifest inside `classes.js` (duplicate resolution, couples ownership to manifest I/O). |
| R7 | **Entrypoint-only in 006; skills/steering deferred** | Keeps 006 a clean seam (source + renderer + parameterized resolution). The per-stack command/skill surfaces are substantial and belong with their adapters (007 Antigravity `SKILL.md`, 008 Kiro steering). | Render the Antigravity skills tree here too — balloons scope and couples 006 to 007's decisions. |

## Open (plan-level, decided here)

- **Layer-1 base** stays as an explicit `LAYER1_DIRS` in `classes.js` (`scripts`, `hooks`, `skills`, `workflow`, `templates`, `.github`); `FRAMEWORK_DIRS(stack) = [...LAYER1_DIRS, ...adapter.surfaceDirs]`.
- **`antigravity.surfaceDirs = []`** in 006 — the `AGENTS.md` entrypoint renders, but the `.agents/skills/` tree is spec 007's; 006 adds no `.agents/` paths.
- **Preamble preservation** reuses the ownership model's user-owned-content rule; the dogfood block is a marked local section the renderer carries through, not framework-managed text.
- **`kiro`** is intentionally absent from the registry in 006 (reserved slot). `getAdapter('kiro')` **throws** a clear "not yet supported — spec 008" error *(analyze A5)*, **not** a silent claude fallback: `bin/init` already accepts `--stack kiro` (it's in `STACKS`), so without the guard an interim run would record `tools.stack=kiro` yet render a `CLAUDE.md` tree — a mismatched half-state. Absent/unknown stacks still default to `claude` (FR-007 back-compat); only the known-but-unpopulated `kiro` throws. 008 removes the guard when it adds the entry + `kiro-specs` dispatch.

## Divergence from source material (recorded)

repo-refactor §4.4 and [r9-review](../../requirements/_refinement/r9-review.md) §47 assumed `CLAUDE-Template.md` would be **re-derived and kept**. The 2026-07-17 clarify decision is to **drop it** (R3). This is an intentional, documented departure — cleaner and drift-free — captured in the spec's clarify session so it reads as a decision of record, not an oversight.

## Zero-dependency confirmation

`fs`/`path` + string manipulation only; frontmatter emitted as plain text; no YAML/templating package. The manifest schema is unchanged (`tools.stack` already exists). `npm run lint` stays dependency-free.
