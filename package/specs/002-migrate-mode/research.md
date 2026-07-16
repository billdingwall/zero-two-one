# Research & Decisions: Migrate-Mode

*Rationale behind [plan.md](plan.md). The user-facing decision log is the spec's `## Clarifications` (3 sessions); this captures the why and the rejected alternatives.*

## Resolved decisions

| # | Decision | Rationale | Rejected alternative |
|---|---|---|---|
| R1 | **Layer in front of the 001 engine**, don't fork it | Migrate is detection + interview + resolution; the merge is already solved and non-destructive. | Re-implement merge in migrate — duplicates logic and risks divergence. |
| R2 | **Migrate = any non-framework content** | Errs toward the non-destructive flow whenever there's anything to protect; simplest to reason about. | Require code / `--migrate` — risks blind-scaffolding a real project. |
| R3 | **Duplicate = exact-dest collision only** | Deterministic and testable; keeps the engine honest about what it can do without AI. | Role/content matching — fuzzy, non-deterministic → belongs to the AI-reconcile sibling. |
| R4 | **Safe defaults, proceed (no TTY)** | First-run CI adoption must not block; every default is non-destructive (`leave`, `claude`). | Fail-with-guidance — breaks unattended adoption. |
| R5 | **update-to-fit = wrap** | Deterministically preserves 100% of user content while adopting the template shape. | AI merge here — that's the sibling; prepend-only — awkward hybrids. |
| R6 | **Strict growth precedence** | `growth` is a strong claim; requiring all three signals avoids over-calling it on a repo that merely has CI. | Ranked/eager — over-calls growth. |
| R7 | **leave installs `<name>.zero-two-one.md` for guiding docs** | The router/instruction docs must be present for the framework to function even when the user keeps their own. | Write nothing — framework silently non-functional for that doc. |
| R8 | **Manifest-driven idempotency** | Recorded decisions are the source of truth; re-runs are boring and safe. | Re-evaluate every run — dup catalog rows, re-archiving edge cases. |
| R9 | **Re-run reads mode/phase/stack from manifest** | Detection is a first-pass concern; the recorded state is authoritative thereafter. | Always re-detect — redundant + risks re-classifying. |
| R10 | **Bad spec frontmatter → report + skip** | Non-destructive; surfaces the issue without touching the user's specs. | Auto-insert status — modifies user files; fail — blocks on a pre-existing problem. |
| R11 | **Release signal = git tags only** | An unambiguous, framework-neutral shipping signal. | `_releases/`/CHANGELOG — weak/noisy; a repo can have them without shipping. |

## Open (plan-level, decided here)

- **`--yes`** accepts inferred defaults non-interactively (mirrors no-TTY).
- **Namespaced name** = `<basename>.zero-two-one.<ext>` (e.g. `CLAUDE.zero-two-one.md`).
- **Archive collision** — if `_notes/archive/<path>` exists (not from a prior recorded run), suffix `-2`, `-3`, … (never overwrite).
- **imported-docs description slot** — left as a `—` placeholder for the user / AI-reconcile sibling.

## Zero-dependency confirmation

Prompts → `node:readline`; git tags → `node:child_process`; everything else reuses spec 001's built-in-only modules. No package added; `npm run lint` stays dependency-free.
