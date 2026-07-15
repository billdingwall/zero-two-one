# Repository & Package Technical Audit

**Auditor:** Staff Engineer / Lead Architect review · **Date:** 2026-07-15 · **Commit:** `ace5b19` (branch `mvp-3-safe-install-and-manifest`)
**Scopes:** Part A = the publishable npm package (`package/`, published as `zero-two-one`). Part B = the full development repository (root).

---

## 1. Project Definition

- **What it is:** Zero Two One is an *agentic product framework* — a scaffold of Markdown process documents, templates, AI-assistant instructions, and zero-dependency Node/shell tooling that takes a product from idea (Planning) through MVP Build to Growth. Its differentiating mechanism is the **refinement gate**: a `pre-commit` hook that blocks implementation commits on feature branches until the matching Spec Kit spec is human-approved. The repo *dogfoods itself* — the framework's own PRD/EDD/TDD/Backlog/Roadmap in `requirements/` govern its development, while `package/` holds the clean publishable snapshot.
- **Target audience:** Founders/PMs and developers running AI-assisted development (Claude Code today; Antigravity and Kiro stacks designed in `requirements/03-TDD.md §9`, not yet built), plus the AI agents themselves as first-class "users" of the context files.
- **Tech Stack:** Node.js ≥18 (CommonJS, built-ins only — `fs`, `path`, `child_process`; zero runtime dependencies by explicit constraint, TDD §3), POSIX shell (`hooks/pre-commit`, `scripts/run-qa.sh`), Markdown-as-data (YAML frontmatter spec statuses), JSON state (`.zero-two-one.json` manifest), GitHub Spec Kit as the external SSD engine.

---

## 2. Part A: The Publishable Package Audit

### Package Scope
`package/package.json` publishes `zero-two-one@1.1.0` with a `files` whitelist: `bin/`, `.ai/`, `.github/`, `.claude/`, `hooks/`, `prototype/`, `scripts/`, `skills/`, `specs/`, `templates/`, `workflow/`, `README.md`. The single executable surface is `bin/init.js` (`npx zero-two-one-init`), which copies the framework into a target repo, instantiates the key docs and guiding files from `templates/`, installs the pre-commit gate, and merges five `021-*` npm scripts into the target's `package.json`. Everything else shipped is content the CLI copies or that the user's AI assistant reads.

### API/Export Surface
- **`bin` is the only real entry point** — appropriate for a scaffolder. However, both `package.json` files declare `"main": "index.js"` and **no `index.js` exists** in either the root or `package/`. Any `require('zero-two-one')` throws at resolution. Either ship a stub/API or remove `main` (and consider `"exports": {}` to make the no-API contract explicit).
- **CLI argument surface is dangerously naive.** `bin/init.js:25` does `path.resolve(process.argv[2] || process.cwd())` with zero flag parsing. There is no `--help`, `--version`, or `--dry-run` — and any flag is treated as a *target directory*. This was reproduced live during development: `node bin/init.js --help` **created and scaffolded a `--help/` directory**. For a tool whose brand promise is "safe, non-destructive install" (PRD F1, `README.md`), this is the package's worst defect. The docs are honest that Init v2 fixes this in release mvp-3 (`requirements/_releases/mvp-3.md`), and `CLAUDE.md` warns "until Init v2 ships, run only on a clean working tree" — but v1.1.0 is the code that would publish today.
- **`copyDir` overwrites unconditionally** (`bin/init.js:47-60` uses `fs.copyFileSync` with no existence check) for the eight `dirsToCopy`. Only the requirements/guiding docs get create-if-missing treatment implicitly (they don't — `fs.copyFileSync` at lines 81/89 also overwrites; there is **no** existence check on `CLAUDE.md`, `CODE.md`, etc.). Re-running init on a repo with a customized `CODE.md` silently clobbers it. This directly contradicts `README.md`/`CLAUDE.md` claims that "user files are create-if-missing, `--force` is the only override" — **the documented contract is ahead of the shipped code**.
- **Doc-vs-code drift on `.claude/`:** TDD §4 states "`init.js` copies `.claude/commands/` into the target repo, merge-safe." The actual `dirsToCopy` (`bin/init.js:33-42`) does **not** include `.claude`, so the slash commands ship in the tarball but are never installed. Users get `/021-init` and `/021-status` only if they copy the directory manually.

### Distribution Health
- **Zero runtime dependencies** — the standout distribution strength. No `dependencies`, no `devDependencies`, no lockfile needed for consumers, no supply-chain surface beyond npm itself and the `uv`/Spec Kit install command the CLI *recommends* (which pipes from `git+https://github.com/github/spec-kit.git` — an unpinned external trust decision worth a version pin in the guidance).
- **Ships junk artifacts:** `files` includes `.ai/`, and `package/.ai/context/` contains `001-dummy.md` and `001-dummy.json` — test/dummy bundles that will publish to npm. The root `.gitignore` excludes `.ai/context/*`, but `scripts/sync-to-package.js` copies `.ai` wholesale (`dirsToCopy` line 34) and the dummies are committed inside `package/`.
- **No `LICENSE` file** anywhere in the repo despite `"license": "ISC"` in both manifests. npm will publish it, but the legal terms are undiscoverable — a blocker for the mvp-6 publish milestone.
- **`author` is empty** in both manifests; `publishConfig.access: public` is correctly set in `package/` only, and the root manifest lacking `files`/`publishConfig` is a good accidental-publish guard — though an explicit `"private": true` on the root would make that guard deliberate (see Part B).
- **Version discipline:** `1.1.0` while the roadmap says publish happens only at mvp-6 after safe-install (mvp-3) lands. Nothing in the repo prevents a premature `npm run publish:package`; the guard is purely conventional.

### Package Strengths
- The **pre-commit refinement gate** (`hooks/pre-commit` + `scripts/speckit/verify-spec-compliance.js --gate`) is genuinely well-engineered: deterministic, offline, fails *open* with a clear warning if tooling is missing, has a documented escape hatch (`ZTO_SKIP_GATE=1`), scopes itself to `NNN-` branches, and blocks code — never docs. The block message includes the exact fix command. This is the product's core mechanism and it is solid.
- **`scripts/speckit/lib.js`** is clean, single-purpose shared logic: dual status formats (frontmatter + inline `**Status**:`), branch→spec resolution with prefix matching, and honest fallbacks. `verify-spec-compliance.js`'s tiered findings (G1–G3 gate / C1–C5 compliance, PASS/WARN/FAIL, `--json` for agents) show real design maturity.
- **`skills/tools.json`** maps agent tool schemas (Anthropic tool-use format) to local CLIs via `x_command` — a pragmatic, runtime-agnostic bridge.
- The **template surface** is complete and internally consistent post-r6: key docs, guiding files, persona templates, stage-specific review templates (`templates/reviews/06-REVIEW-{planning,mvp,growth}-Template.md`), release template.
- Merge behavior where it *does* exist is correct: npm-script injection (`bin/init.js:146-166`) is additive and skip-if-present; the `.gitignore` append (lines 107-118) is idempotent via a content check.

### Package Weaknesses & Tech Debt

> **Resolution (stakeholder, 2026-07-15):** all items below are **accepted for fixing** per the §5 recommendations and standard best practices — scoped into refinement round **r7** ([_refinement/r7-review.md](../_refinement/r7-review.md)).
1. **Init v1 is destructive** (unconditional copy, no dry-run, no arg validation) while the README markets non-destructive migrate mode — shipping this as-is would burn early adopters on exactly the promise the product makes. (Known; scheduled for mvp-3 — but it is *this* package's current behavior.)
2. **`main: index.js` dangles** (both manifests).
3. **`.ai/context/001-dummy.*` ships to npm.**
4. **No LICENSE file.**
5. **`.claude/` never installed by init** despite TDD §4 and the shipped directory.
6. **Hook install is last-writer-wins:** `bin/init.js:123-132` copies over any existing `.git/hooks/pre-commit` with no backup — the conflict-aware chaining (plain hook / husky / lefthook) exists only as TDD §1 design.
7. **`scripts/run-qa.sh` is partly theater in the package:** the a11y check is explicitly mocked (`echo "PASS: A11y checks completed (mocked)"` with `npx pa11y-ci` commented out), and the "Unit Tests" step runs `npm run test --if-present` — which in a scaffolded target repo is whatever the *user* defines, fine, but in this repo is itself not a test (see Part B).
8. **No `--version`:** a scaffolding CLI without version output makes support/feedback triage (the `021-feedback` design attaches manifest version) harder until the manifest write ships.

---

## 3. Part B: The Full Repository Audit

### Repository Structure
Dual-workspace: the **root is the living product** (self-governed by `requirements/`, `workflow/`, the refinement loop in `requirements/_refinement/` — six applied rounds r1–r6 with per-doc update plans) and **`package/` is a generated snapshot** produced by `scripts/sync-to-package.js` (whitelist copy, preserves `package/package.json` + `package/.claude/`, excludes dev-only content like `requirements/`, `.021-updates/`, and the sync script itself). The boundary contract is written down in TDD §5 (Package Manifest) and the sync script enforces it — an unusually disciplined arrangement for a solo project. State lives in `.zero-two-one.json` (`mode: source`, `phase: planning`), read by `scripts/workflow-status.js` with repo-inference fallback and a deliberate `prebuild → planning` back-compat alias (r6).

### Developer Experience (DX)
- **Setup is trivially light:** no `node_modules`, no lockfile, no build step. `npm run 021-status` works immediately. The `021-*` npm-script namespace is discoverable and documented in three coordinated places (`README.md`, `requirements/_design/command-design.md`, `workflow/workflows.md`).
- **Process DX is the repo's crown jewel:** every directory has an `_INDEX.md` manifest; every living doc has a Changelog; refinement rounds leave an auditable trail (`r{n}-review.md` → `r{n}-update-{doc}.md` → applied edits). The r6 round alone demonstrates the loop absorbing a whole structural migration (3-phase lifecycle, 04/05 numbering swap) without dangling references — verified by grep sweeps during the round.
- **No linting or formatting exists.** No ESLint/Prettier/EditorConfig config anywhere. For ~6 JS files this is survivable, but `CODE.md §3` instructs "verify changes through testing and linting before submitting" — an instruction that is currently impossible to follow. There is also no Markdown linting or **link checking**, which matters enormously in a repo whose product *is* cross-linked Markdown (the r6 rename churn was checked by hand/grep, not tooling).

### Infrastructure & CI/CD
- **There is none.** No `.github/workflows/` (root `.github/` holds only issue templates: `bug_report.md`, `feature_prd.md`). No test runner, no test files (`find` confirms zero `*.test.js`/`__tests__`). `"test"` in the root `package.json` is `spec-status.js list && workflow-status.js` — a smoke check of two CLIs, not a test suite. Automated tests for `bin/init.js` and `hooks/pre-commit` are correctly identified as mvp-6 backlog items (`requirements/04-BACKLOG.md`), but mvp-3's merge engine — the most correctness-critical code in the project — is scheduled to be built *before* the test milestone. That ordering is backwards for a "zero user-file overwrites" hard target (PRD §5).
- **Publish is one unguarded command:** `npm run publish:package` = sync + `cd package && npm publish`. No CI gate, no tag requirement, no provenance, no 2FA/OTP note, no pack-diff review step.
- **Found regression (r6 escaped defect): `scripts/run-qa.sh` was missed by the r6 phase renumbering.** It still branches on `PHASE = 1 / 1.5 / 2 / 3 / 4` with the old meanings: post-r6, MVP Build reports phase **2**, which `run-qa.sh` routes to the *old Pre-build* docs-check branch — so **full code QA (tests/a11y/spec-compliance) will never run during MVP Build**, and Growth (now 3) triggers what was written as the Phase-3/4 branch only by coincidence. Additionally, its phase detection (`grep "Current Phase" | awk '{print $3}'`) is coupled to the human-readable output format of `workflow-status.js` — a fragile contract that this very bug demonstrates. This is exactly the class of drift the framework exists to prevent, and it proves the need for the mechanical check layer (CI) the repo lacks.
- Minor same-class drift: the root `.gitignore` comment still says ``rebuild with `npm run spec:context` `` (pre-r3 name; actual script is `021-spec:context`).

### Repository Strengths
- **Docs-as-code discipline is exceptional.** The PRD/EDD/TDD/Backlog/Roadmap form a genuinely cohesive set; decisions carry round-tags (r2…r6); the `_releases/` files hold canonical release state with exit gates; `requirements/_design/{command,workflow}-design.md` map every surface. Traceability from any rule to the round that introduced it is near-total.
- **The dogfooding actually bites:** `.zero-two-one.json` at root is read by the status tooling; the phase rollbacks and r6 enum migration were executed through the same manifest users will have. The framework's own history (e.g., r5 fixing manifest/phase drift) is honest about its failures.
- **Zero-dependency discipline** is upheld everywhere — no drift toward convenience packages in six rounds of evolution.
- **Sync boundary enforcement:** `sync-to-package.js` codifies TDD §5 (clean-copy semantics, `scriptExclusions` for dev-only scripts, `preserveInPackage`), so the "what ships" question has a single mechanical answer.
- Sensible git hygiene: work on named branches (`mvp-3-safe-install-and-manifest`), hook warns on direct-to-main commits.

### Repository Weaknesses & Tech Debt

> **Resolution (stakeholder, 2026-07-15):** all items below are **accepted for fixing** per the §5 recommendations and standard best practices — scoped into refinement round **r7** ([_refinement/r7-review.md](../_refinement/r7-review.md)).
1. **No CI whatsoever** — for a framework whose thesis is *enforced process*, the absence of any mechanical enforcement on its own repo (even a 10-line workflow running `npm test` + a link checker + `sync:package --check`) is the biggest structural gap, and the `run-qa.sh` regression is the concrete cost.
2. **`run-qa.sh` phase mapping broken post-r6** (detailed above) — needs the 3-phase remap and ideally a machine-readable status output (`workflow-status.js --json`) to consume instead of `awk`.
3. **No sync-drift guard:** nothing verifies `package/` is current with root (a `sync:package --check` diff mode failing CI on drift would close the gap; `package/.claude/` is *preserved*, not synced, so it silently diverges from root `.claude/` unless manually copied — which happened twice this cycle by hand).
4. **Root manifest lacks `"private": true`**, relying on the missing `files` field to make an accidental root `npm publish` merely *messy* rather than impossible.
5. **`.021-updates/` is a shadow docs directory** (7 audit/proposal files) predating `requirements/_notes/` — same role, different home; content should migrate or the directory be tombstoned in an `_INDEX.md`.
6. **No CONTRIBUTING.md / CODEOWNERS**, and issue templates don't yet include the designed `021-feedback.yml` (scheduled mvp-5, fine — but `bug_report.md`/`feature_prd.md` reference no triage flow).
7. **Single-maintainer bus factor** is visible everywhere (empty `author`, one git identity); not fixable by tooling, but CI + tests are the mitigation.

---

## 4. Areas for Clarification — RESOLVED (stakeholder answers, 2026-07-15)

- **Is v1.1.0 already on npm?** ~~The repo cannot answer this.~~ **Resolved: NO.** Stakeholder confirmed nothing has been published; independently verified 2026-07-15 — `npm view zero-two-one` returns **404 Not Found** (name unclaimed on the registry). All package findings are pre-publish blockers, not live incidents.
- **`prototype/` in `files`:** ~~intentional landing spot or vestigial?~~ **Resolved: vestigial — do not ship.** The empty scaffold is dropped from the package; `021-prototype` generates the `prototype/` directory (including its `_INDEX.md`) on demand when a prototype is added. Remove `prototype/` from `package/package.json` `files` and from the init copy surface. → r7.
- **`kiro`/`antigravity` stacks:** **Resolved: all three stacks (Claude Code, Antigravity, Kiro) are MVP scope** — confirmed as mvp-4 deliverables and required for launch (mvp-6 field test already assumes them). Fix in two parts: (1) **add clarity in the requirements/docs now** so `package/README.md`'s three install prompts don't overpromise pre-mvp-4 (label the Antigravity/Kiro prompts as landing at mvp-4, or note `--stack` availability); (2) the implementation itself lands as part of MVP (mvp-4, per the roadmap). → r7 (docs) + mvp-4 (impl).
- **`workflow-status.js` "Phase N" numbering vs release history:** ~~confirm history policy.~~ **Resolved: fix everywhere.** Old 4-phase labels are r6-migration leftovers, not protected history — sweep the **whole repo and package, docs and implementations** (including `cli-walkthrough-demo.md`, `_releases/` remnants, and any remaining "Phase 2/3/4" old-model references). → r7.
- **`main`/API intent:** **Still open** (no stakeholder decision) — default per approved §5 Architectural recommendation #4: remove the dangling `main` now (Immediate Fix #3) and decide on a programmatic `exports` surface at **mvp-4** when the adapter seam lands. Carried as an open question in r7.

---

## 5. Strategic Recommendations

> **Resolution (stakeholder, 2026-07-15): ALL strategic recommendations approved** — Immediate Fixes (Package), Immediate Fixes (Repo), and Architectural Improvements. Scoped into r7 for doc/plan changes and the appropriate mvp releases for implementation ([_refinement/r7-review.md](../_refinement/r7-review.md)).
### Immediate Fixes (Package)
1. **Gate the CLI:** add minimal arg parsing to `bin/init.js` — reject unknown `--flags`, add `--help`/`--version`, and refuse to scaffold into a directory whose name starts with `-`. This is ~20 lines and removes the worst live footgun *before* the full mvp-3 engine lands.
2. **Add create-if-missing checks** for the guiding files and requirements docs in the current init (one `fs.existsSync` guard per copy) so v1 at least honors the documented non-destructive contract for user-owned docs, even before the full ownership engine.
3. **Remove `"main": "index.js"`** from both manifests (or ship a real entry); delete `package/.ai/context/001-dummy.*`; add a `LICENSE` file (ISC) at root and to `files`.
4. **Back up an existing pre-commit hook** (`pre-commit` → `pre-commit.backup`) before overwriting, pending the mvp-3 conflict-aware install.
5. Either add `.claude` to `dirsToCopy` (merge-safe per TDD §4) or amend TDD §4 — code and spec must agree before publish.

### Immediate Fixes (Repo)
1. **Fix `scripts/run-qa.sh` for the 3-phase model** (Planning=1 docs tier; MVP Build=2 full code QA; Growth=3 full QA + feedback checks), and give `workflow-status.js` a `--json` flag so consumers stop scraping human output.
2. **Add a minimal GitHub Actions workflow:** run `npm test`, `node bin/init.js` into a temp fixture dir (smoke), a Markdown link checker, and a `sync:package` drift check (`sync && git diff --exit-code package/`). This single file addresses weaknesses B1–B3.
3. **Add `"private": true`** to the root `package.json`.
4. Fix the stale `.gitignore` comment (`spec:context` → `021-spec:context`); fold or tombstone `.021-updates/`.

### Architectural Improvements
1. **Invert the test/build ordering:** pull the `bin/init.js` + `hooks/pre-commit` automated tests forward from mvp-6 into mvp-3's exit gate. The migration acceptance test ("zero user-file overwrites on a non-empty fixture") should be the *definition of done* for the merge engine, not a later milestone — the fixture-repo harness is also the natural home for the 3-stacks acceptance matrix in mvp-4.
2. **Make the manifest the QA contract:** once mvp-3's manifest write lands, `run-qa.sh` and the pre-commit hook should read phase/stack from `.zero-two-one.json` directly (one parser, in `lib.js`), eliminating the output-scraping class of bugs permanently.
3. **Design the Workflow Manager (TDD §13) as a read-only reporter first** — drift *detection* (backlog/roadmap/release status vs git state) with proposed diffs, before any auto-editing. Its "never auto-commits" guardrail is right; start it as `021-doctor`-style output to build trust.
4. **Programmatic API consideration:** `scripts/speckit/lib.js` is already a clean module; exposing it as the package's `main`/`exports` (`require('zero-two-one/speckit')`) would give agent runtimes a supported surface instead of the `x_command` shell bridge alone — worth deciding at mvp-4 when the adapter seam lands.
5. **Publish hardening for mvp-6:** publish from CI only (tag-triggered, `npm publish --provenance`), with a pre-publish check that fails on dangling `main`, missing LICENSE, or `.ai/context` dummies — encode this audit's package findings as the release pipeline's own gate.

---

*Audit based on repository contents at `ace5b19`; the init `--help` destructive behavior was reproduced empirically in a scratch run during this session. Updated 2026-07-15 with stakeholder resolutions (all weaknesses accepted, all recommendations approved, §4 clarifications answered) and registry verification (`npm view zero-two-one` → 404, unpublished). This audit feeds refinement round **r7**.*
