# Repo Refactor Plan: Working Repository & Delivered Package

*r9 research note. Reconciles [standards-audit.md](standards-audit.md) against the post-mvp-3 repo, reviews both surfaces (the working repo and the NPM package), and lays out a comprehensive improvement plan. Companion to TDD §9 (adapters), §7 (manifest), §13 (Workflow Manager).*

**The governing principle (normative for this plan):**

> The **working repo** is developed in **Claude Code** — it is the `claude`-stack dogfood and doesn't need to be tool-neutral itself.
> The **delivered package** is **assistant-agnostic**: a standardized, tool-neutral core that **adapts to the assistant's conventions at init** — supporting Claude Code, Kiro, and Google Antigravity as first-class stacks.

Everything below serves that split: neutral core in the package, per-stack rendering at install, Claude-native dogfooding at home.

---

## 1. Review of `standards-audit.md`

### 1.1 Inventory is stale — verify before acting on it

The audit's "Current State Inventory" (§2) describes a **pre-mvp-3 repo**, and in places one that never existed here: `scripts/init/021-init.js`, a `{{PLACEHOLDER}}` hydration engine in `021-templates.js`, `skills/refinement-loop.md`, release-notes v0.4–v0.6, and a `.zero-two-one.json` with "cycle count / directory map / script map." None of these match the repo today. What actually exists post-mvp-3:

- `bin/init.js` is a thin CLI over the **ownership-based engine** in `scripts/init/` (spec 001) with **migrate-mode** (002) — safe, idempotent, conflict-aware.
- `.zero-two-one.json` is the authoritative manifest (phase, `tools.{stack,assistant,ssd,design}`, file-hash inventory, `hook` strategy, `migrate` decisions), read through **one parser** (`lib.js manifestFacts`, spec 003).
- **`021-doctor`** (spec 004) is the read-only drift reporter — the Workflow Manager's first increment (TDD §13).
- The pre-commit gate installs **conflict-aware** (chaining/husky/lefthook, spec 005).

So the audit's *severity table* overstates several "critical" gaps: state does have gating (spec `status:` frontmatter + the pre-commit gate), there is a state reader contract (`manifestFacts`), and there is a reconciler (`021-doctor`). The audit's genuinely valid observations are the **platform gaps**: no `.kiro/`, no `.agents/`, no `AGENTS.md`, a Claude-only entrypoint, and no parameterized/scoped refinement instances.

### 1.2 Verdict per audit proposal

| Audit proposal | Verdict | Rationale |
|---|---|---|
| `.kiro/` + `.agents/` adapters; `AGENTS.md` neutral entry | **Adopt** (already planned — TDD §9, mvp-4) | Exactly the user-stated goal. The audit's per-tool conventions table (§1) is a useful cross-check for the mvp-4 adapter specs. |
| Slim `CLAUDE.md` to a router over a neutral source | **Adopt, inverted** | TDD §9.1 already defines it the right way round: `ASSISTANT-Template.md` is the neutral **source**; `CLAUDE.md`/`AGENTS.md`/steering are **renderings**. Don't make CLAUDE.md point at `.agents/AGENTS.md` — make both outputs of one template. |
| `.workflow/state.json` as a second state store | **Reject** | The framework already has two durable state stores with one reader: the manifest (project identity + lifecycle) and spec `status:` frontmatter (work-item state, gate-readable — TDD §9.3). A third, agent-writable JSON store reintroduces the split-brain drift that spec 003/004 just eliminated. Extend the manifest + doctor instead. |
| `HUMAN_REVIEW_PENDING` gating | **Adapt** | The concept exists as the spec-status vocabulary (`Draft → In Review → Approved …`) enforced by the pre-commit gate. What's missing is the same gate for **refinement rounds** — adopt as a lightweight `status:` frontmatter on `_refinement/rN-*.md` files that `021-doctor` reads (advisory), not a runtime write-blocker. |
| Root `Makefile` as the universal POSIX interface | **Reject, keep the intent** | The intent (one deterministic command surface for all three assistants) is right; `make` is the wrong vehicle — not present on Windows, a new toolchain dependency, and a *second* interface beside npm scripts. The package is installed via npm, so npm is guaranteed present, and all three assistants execute shell (`npm run 021-*` is a shell command). Deliver the intent as a **single `021` CLI binary** (§3.3) instead. |
| Parameterized scoped refinement loops (`init-loop.sh`, multi-tier `.workflow/`) | **Defer to Growth** | Real capability, but it serves multi-team/initiative scale — beyond the 0→1 MVP promise. Nothing in mvp-4–6 depends on it. Park as a Growth backlog candidate with the audit as its design note. |
| Sync/init scaffolding for the new adapter dirs | **Adopt** (mvp-4 mechanics) | Folded into §5 below. |

---

## 2. Repo Review — findings

### 2.1 Working repo (root)

| # | Finding | Severity |
|---|---|---|
| W1 | **`CLAUDE.md` claims to be a rendering of a neutral `AGENTS.md` source that doesn't exist yet.** The inversion is planned (TDD §9.1) but until mvp-4 the "source" is fictional; guidance-sync maintains the rendering directly. Acceptable interim — but the mvp-4 work must create `templates/ASSISTANT-Template.md` and re-derive `CLAUDE-Template.md` from it, or the drift risk becomes permanent. | Medium |
| W2 | **`package/.claude/` is preserved, not synced** (`preserveInPackage` in `sync-to-package.js`). Root `.claude/commands/` and `package/.claude/commands/` are two sources of truth that happen to be identical today; a root edit would silently not ship. | Medium |
| W3 | Root `package.json` `test`/`lint`/`sync` scripts are healthy post-mvp-3; no `Makefile` needed (§1.2). A root `.DS_Store` is committed noise — gitignore it. | Low |
| W4 | The working repo correctly keeps dev-only surfaces out of the package: `test/`, `prototype/`, `requirements/` (the framework's own), `.021-updates/`, CI workflows, `sync-to-package.js`, `check-links.js`. This boundary is working as designed (r7). | ✓ good |
| W5 | The dogfood loop is real: manifest is engine-generated (`mode: source`), the gate runs, `021-doctor` reconciles state. Keep it. | ✓ good |

### 2.2 Delivered package (`package/` → tarball)

| # | Finding | Severity |
|---|---|---|
| P1 | **The tarball ships the framework's own internal feature specs** — `specs/001-safe-install-engine` … `005-precommit-chaining`, 38 files. They are *never installed* (the engine excludes `specs/` from the install surface — spec 001, analyze A3), so they are pure tarball bloat and user confusion: a fresh `node_modules/zero-two-one/specs/` full of another project's development history. `package/package.json` `files` explicitly includes `"specs/"`. | **High** |
| P2 | **The install surface is hard-wired to the `claude` stack.** `classes.js FRAMEWORK_DIRS` unconditionally includes `.claude/commands`; `sources.js userDocMappings` unconditionally instantiates `CLAUDE.md`. A `--stack kiro` user still receives the Claude command surface and a `CLAUDE.md`. Known and scheduled (FR-017 deferral → mvp-4), but it is the central refactor this plan exists for. | High (mvp-4) |
| P3 | **No neutral entrypoint ships.** No `AGENTS.md`, no `ASSISTANT-Template.md`, no `.agents/`, no `.kiro/` anywhere in the tarball. Antigravity/Kiro users get zero assistant wiring. | High (mvp-4) |
| P4 | `skills/*.md` ship as a flat directory into user repos for every stack. As the **source layer** that's correct (TDD §9.1), but no stack consumes them natively yet — Claude needs them surfaced as commands/skills, Antigravity as `.agents/skills/021-*/SKILL.md`, Kiro via `skill://` resources. | Medium (mvp-4) |
| P5 | `README.md` shipped in the tarball is the *repo* README (11.3 kB, includes stack-availability caveats and contributor content). Fine near-term; at publish (mvp-6) the package README should be install-focused. | Low |
| P6 | Tarball hygiene otherwise good: 130 kB packed, zero runtime deps, no dev/test files, `LICENSE` present, `files` whitelist exists, provenance pipeline planned (TDD §14). | ✓ good |

---

## 3. Target Architecture

### 3.1 Three-layer model

```
Layer 1 — NEUTRAL CORE (ships, installs identically for every stack)
  requirements-structure, templates/ (incl. ASSISTANT-Template.md),
  workflow/ docs, skills/ (source prompts + tools.json),
  scripts/ engine + lifecycle tooling, hooks/pre-commit,
  .zero-two-one.json manifest, .ai/context/ scaffold

Layer 2 — STACK ADAPTERS (ship as templates/renderers; ONLY the chosen
  stack's surface is written at init; recorded in manifest tools.*)
  claude      → CLAUDE.md + .claude/commands/021-*.md          (+ github-speckit)
  antigravity → AGENTS.md + .agents/skills/021-*/SKILL.md      (+ github-speckit)
  kiro        → .kiro/steering/021-*.md + .kiro/agents/021.json (+ kiro-specs engine dispatch)

Layer 3 — WORKING-REPO ONLY (never ships)
  requirements/ (the framework's own), specs/ (internal feature specs),
  test/, prototype/, .021-updates/, CI workflows, sync/check scripts, package/
```

The user-repo tree after init, per stack (concretizing TDD §9.2 with the audit's §1 conventions table — vendor conventions to be re-verified during the mvp-4 spec's research pass):

| Installed | claude | antigravity | kiro |
|---|---|---|---|
| Entrypoint | `CLAUDE.md` | `AGENTS.md` (root; `GEMINI.md` honored) | `.kiro/steering/021-{product,tech,structure}.md` |
| Commands/skills | `.claude/commands/021-*.md` | `.agents/skills/021-<name>/SKILL.md` | `.kiro/agents/021.json` + `skill://` resources |
| SSD state | `specs/NNN-*/spec.md` frontmatter | `specs/NNN-*/spec.md` frontmatter | `.kiro/specs/<feature>/` + injected `status:` |
| Everything else | — identical neutral core: `requirements/`, `workflow/`, `skills/`, `templates/`, `scripts/`, `hooks/`, manifest — | | |

**Un-chosen stacks install nothing.** Switching stacks later = re-run init with `--stack` (the engine's ownership classes make this safe: the old adapter surface is framework-owned and refreshable, the new one renders alongside).

### 3.2 State model (settled — do not add a parallel store)

| Store | Owns | Written by | Read via |
|---|---|---|---|
| `.zero-two-one.json` | Project identity, lifecycle phase, tool stack, install inventory, hook strategy, migrate decisions | The engine only | `lib.js manifestFacts` / `node scripts/speckit/lib.js phase` |
| `specs/*/spec.md` `status:` | Work-item lifecycle (the gate's input) | `021-spec:status` (user-authorized) | `lib.js readStatus` |
| `_refinement/rN-*.md` `status:` *(new, small)* | Refinement-round state (`Draft / Pending approval / Applied / Closed`) | The round's author | `021-doctor` (new advisory check) |

This delivers the audit's "human review gate" for refinement with zero new machinery: rounds already carry a prose `**Status:**` line (see `r7-update-roadmap.md`); formalize it as frontmatter and teach the doctor to flag rounds applied-without-approval. Advisory, never in the commit path (TDD §13 guardrails).

### 3.3 Command surface: the `021` CLI (replaces the Makefile idea)

One deterministic, assistant-agnostic entry — a second `bin` in the package:

```
021 status      → workflow-status          021 spec status|context|verify …
021 qa          → run-qa                   021 doctor
021 phase       → lib.js phase (bare number, for scripts/hooks)
```

- Node built-ins only (dispatcher over the existing scripts — no logic moves).
- npm scripts stay as aliases; docs/steering/skills reference `npx 021 …` (or `021` when installed) so **all three stacks issue identical commands** — the audit's POSIX-contract intent without a `make` dependency, and Windows-safe.
- Adapters reference this CLI in their rendered instructions (steering files, SKILL.md, commands) — one contract, three renderings.

---

## 4. Improvement Plan — Working Repo

Ordered; W-numbers reference §2.1. All are small except W1.

1. **W3 hygiene (r9, minutes):** gitignore + de-track `.DS_Store`.
2. **W2 single-source `.claude` (r9, small):** move `.claude/commands` from `preserveInPackage` to the sync copy list in `sync-to-package.js` so root is the one source of truth; the drift-check then covers it.
3. **Refinement-round status frontmatter (r9, small):** add `status:` to the `_refinement` template/convention; retrofit is optional (historical rounds stay prose). New doctor check lands with it or in a follow-up spec (§3.2).
4. **W1 source-layer inversion (mvp-4, with spec 006):** when `ASSISTANT-Template.md` is created, re-derive `CLAUDE-Template.md` from it and re-render the root `CLAUDE.md` via guidance-sync — the working repo dogfoods the claude rendering of the neutral source. The working repo additionally keeps its dogfooding preamble (the "you are in the framework's own repo" block) as a clearly-marked local section the renderer preserves (it's user-owned content under the ownership model).
5. **Dogfood the `021` CLI (mvp-4):** once it exists, the working repo's own hooks/docs switch to it.

## 5. Improvement Plan — Delivered Package

P-numbers reference §2.2. Grouped by when they should land.

### 5.1 Now (r9 — quick wins, no behavior change)

1. **P1 — stop shipping internal specs:** remove `"specs/"` from `package/package.json` `files`; remove `specs` from `sync-to-package.js` `dirsToCopy`; delete `package/specs/`. A user repo still gets a `specs/` dir — created empty by Spec Kit setup / first spec, not by the tarball. (`specs/_INDEX.md` template, if we want to seed one, belongs in `templates/`.)
2. **P5 seed (r9, tiny):** note in the mvp-6 release file that the publish gate should check the shipped README is install-focused (add to its pre-publish checklist).

### 5.2 mvp-4 — the adapter release (already roadmapped; this section sharpens its spec cut)

Proposed spec cut for the release (each through the full Spec Kit workflow):

- **Spec 006 — Source layer & renderer** (P2/P3 first half, W1): `templates/ASSISTANT-Template.md` as the neutral source; renderer transforms in the init engine (`claude` → `CLAUDE.md` byte-identical to today — the regression bar; `antigravity` → `AGENTS.md`); `classes.js`/`sources.js` become **stack-parameterized** — `FRAMEWORK_DIRS`/`userDocMappings` resolve from the manifest's `tools.stack` instead of hard-wiring `.claude/commands` + `CLAUDE.md`. Un-chosen surfaces are not installed; `--upgrade` respects the recorded stack.
- **Spec 007 — Antigravity adapter** (P3/P4): render `skills/*.md` → `.agents/skills/021-<name>/SKILL.md`; `AGENTS.md` entrypoint; migrate-mode already detects `.agents/`/`AGENTS.md` (spec 002) — wire the proposal through.
- **Spec 008 — Kiro adapter + engine dispatch** (P3/P4): `.kiro/steering/021-*.md` rendering (PRODUCT→product, CODE+TDD→tech, workflows→structure — TDD §9.2 mapping); `.kiro/agents/021.json`; `kiro-specs` engine dispatch in `scripts/speckit/*` (read `tools.ssd` from the manifest — the `manifestFacts` seam from spec 003 is exactly where it plugs in).
- **Spec 009 — `021` CLI** (§3.3): the dispatcher `bin`; adapters emit instructions referencing it; README prompts updated; stack-availability labels removed (r7 item).
- **Acceptance matrix** (already in the release file): 3 stacks × {none, material-3}, gate green + `021 status`/`021 qa` in all six cells; **plus** the new neutral-core invariant: *diff the installed tree across stacks — only Layer-2 paths may differ.*

### 5.3 mvp-5 / mvp-6 (touched, not owned, by this plan)

- `021-feedback`/`021-design`/`021-prototype` render through the same adapter layer (skills → per-stack surfaces) — no new mechanism needed if 006–009 land clean.
- mvp-6 pre-publish review gains: tarball-content audit (no internal specs, no dev files — P1 regression check), install-focused README (P5), and a fresh-install smoke test per stack from the packed tarball.

### 5.4 Growth backlog candidates (from the audit, deliberately deferred)

- **Scoped refinement-loop instances** (multi-tier hydrated loops) — the audit §4.2 is the design note; revisit when multi-initiative repos are a real user profile.
- **Runtime write-guards** for non-git-hook assistants (Kiro `beforeFileWrite` hooks calling a guard script) — an adapter-level enforcement of the same spec-status gate; needs per-vendor hook APIs to stabilize first.
- **Doctor apply-mode** (TDD §13 second increment) — subsumes the audit's `transition.js`/`evaluate-next.js` ideas.

---

## 6. What this plan explicitly does *not* do

- No `.workflow/` state store, no `Makefile`, no second entrypoint hierarchy (§1.2 rationale).
- No renaming of `workflow/` (public human docs) — the audit agrees (§7.2).
- No breaking change to the manifest schema or the ownership model — every adapter change rides the existing engine (classes → classify → apply), which is precisely why mvp-3 was built first.

## 7. Open questions (for the r9 review / mvp-4 clarify passes)

1. **Adapter surface switching:** when a repo re-inits with a different `--stack`, should the old stack's rendered surface be removed (orphan-style report), left, or archived? (The engine's orphan mechanism from spec 001 likely covers it — confirm in spec 006 clarify.)
2. **`021` CLI name:** `021` as a bin name is unusual (leading digit is legal for npm bins but unusual in PATH usage); alternatives `zto` or `zero-two-one`. Decide at spec 009 clarify.
3. **Seeded `specs/_INDEX.md`:** after P1, should init seed an empty specs index into user repos (as a template-instantiated user-owned file), or leave `specs/` entirely to Spec Kit? Decide at spec 006 clarify.
4. **Package README split (P5):** separate `package/README.md` authored for installers vs the repo README — dedicated file or a sync-time transform? Decide in the mvp-6 publish spec.

## 8. Execution summary

| When | Items | Size |
|---|---|---|
| **r9 (this round)** | P1 tarball fix · W2 `.claude` single-source · W3 hygiene · round-status frontmatter convention · mvp-6 checklist notes | Small, mechanical |
| **mvp-4** | Specs 006–009: source layer + renderer, antigravity + kiro adapters, engine dispatch, `021` CLI, acceptance matrix + neutral-core invariant | The release |
| **mvp-6** | Publish-gate additions (tarball audit, README, per-stack smoke) | Checklist deltas |
| **Growth** | Scoped loops · runtime write-guards · doctor apply-mode | Backlog |
