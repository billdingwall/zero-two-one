# Overview: Installing & Initializing zero-two-one in a Project

**Status:** Internal reference — describes actual behavior as implemented
**Sources:** `bin/init.js`, `package/package.json`, `package/.claude/commands/`, `hooks/pre-commit`, `requirements/03-TDD.md` §5 (Package Manifest)
**Date:** 2026-07-10

## 1. Installation Paths

There are three ways to get the initializer:

| Path | Command | Notes |
|---|---|---|
| One-shot (recommended) | `npx zero-two-one-init [target-dir]` | Downloads the package, runs `bin/init.js`, nothing stays installed |
| Global | `npm install -g zero-two-one` then `zero-two-one-init` | The `bin` field maps `zero-two-one-init` → `bin/init.js` |
| Claude Code | `/init` slash command | Just instructs the agent to run `npx zero-two-one-init` and walk the setup steps (see §6 gap: the command file itself is not installed into the user's repo by init) |

The published tarball (~57 files, `files` array in `package.json`) contains: `bin/`, `.ai/`, `.github/`, `.claude/`, `hooks/`, `prototype/`, `scripts/`, `skills/`, `specs/`, `templates/`, `workflow/`, `README.md`. It does **not** contain `requirements/` or the guiding docs directly — those are instantiated from `templates/` at init time (TDD §5, template → install mapping).

## 2. What `init.js` Does, Step by Step

`init.js` resolves the target as `argv[2]` or the current working directory, and the source as the installed package root. Then, in order:

### Step 1 — Copy the framework surface
Eight directories are copied recursively (overwriting same-named files, skipping `node_modules`/`.git`):
`prototype/`, `skills/`, `specs/`, `templates/`, `workflow/`, `.github/`, `scripts/`, `hooks/`

### Step 2 — Instantiate the requirements docs
Creates `requirements/` with `_refinement/`, `_design/`, `_notes/` subfolders, then copies each `templates/0N-*-Template.md` to `requirements/0N-*.md` (PRD, EDD, TDD, ROADMAP, BACKLOG).

### Step 3 — Instantiate the guiding docs
Copies `templates/{CLAUDE,README,CODE,PRODUCT,DESIGN}-Template.md` to root-level `CLAUDE.md`, `README.md`, `CODE.md`, `PRODUCT.md`, `DESIGN.md`.

### Step 4 — Provision AI artifact dirs & .gitignore
- Creates `.ai/context/` with a `.gitkeep` (Speckit context bundles are generated here).
- Appends a gitignore block (`.ai/context/*`, `!.ai/context/.gitkeep`, `node_modules/`) — **merge-safe**: only appended if `.ai/context/*` isn't already present; an existing `.gitignore` is preserved.

### Step 5 — Install the refinement gate
If `.git/hooks/` exists, copies `hooks/pre-commit` into it and marks it executable. If the target isn't a git repo yet, prints a note to `git init` and re-run.

The hook enforces: on `NNN-feature-name` branches, staged **implementation files** (anything outside the docs/spec/tooling surface that isn't `.md`) are blocked unless `node scripts/speckit/verify-spec-compliance.js --gate` passes, i.e. the matching spec in `specs/NNN-.../` is `Approved` or `Ready for Dev`. Docs and specs always pass. Direct commits to `main` get a warning (enforcement line present but commented out). Emergency bypass: `ZTO_SKIP_GATE=1 git commit ...`.

### Step 6 — Wire npm scripts
If `package.json` exists, adds these scripts **only where the name isn't already taken** (merge-safe, never overwrites the user's existing scripts):

| Script | Command |
|---|---|
| `status` | `node scripts/workflow-status.js` |
| `qa` | `sh scripts/run-qa.sh` |
| `spec:status` | `node scripts/speckit/spec-status.js` |
| `spec:context` | `node scripts/speckit/fetch-speckit-context.js` |
| `spec:verify` | `node scripts/speckit/verify-spec-compliance.js` |

If there's no `package.json`, prints a note to `npm init -y` and re-run.

### Step 7 — Dependency check
Reports readiness of `node` (>=18 required by `engines`), `git` (required), `uv` and `specify` (needed for Spec Kit, Phase 3+), with install pointers. Nothing is installed automatically. The framework itself has **zero runtime dependencies** (TDD §3) — everything runs on built-in Node modules and POSIX shell.

## 3. Resulting File Tree

```
target-repo/
├── CLAUDE.md                  # AI assistant instructions (from template)
├── CODE.md                    # Coding constitution (from template)
├── PRODUCT.md                 # Lifecycle workflow (from template)
├── DESIGN.md                  # Design tokens (from template)
├── README.md                  # Project readme (from template) ⚠ overwrites existing
├── .gitignore                 # Appended (merge-safe)
├── package.json               # Lifecycle scripts merged in (merge-safe)
├── .git/hooks/pre-commit      # Refinement gate ⚠ overwrites existing hook
├── .ai/context/.gitkeep       # Generated Speckit bundles land here (gitignored)
├── .github/ISSUE_TEMPLATE/    # Issue templates + _INDEX.md
├── hooks/pre-commit           # Source copy of the gate
├── prototype/_INDEX.md        # Empty scaffold for the Phase 2 static prototype
├── requirements/
│   ├── 01-PRD.md … 05-BACKLOG.md   # Instantiated from templates
│   ├── _refinement/           # r{n}-review.md rounds live here
│   ├── _design/               # Design assets
│   └── _notes/                # Unstructured research
├── scripts/
│   ├── workflow-status.js     # Phase detection
│   ├── run-qa.sh              # Phase-appropriate QA
│   ├── speckit/               # spec-status, fetch-speckit-context, verify-spec-compliance
│   └── _INDEX.md              # (sync-to-package.js is root-only and does NOT ship — TDD §5)
├── skills/                    # Agent prompts + tools.json schemas
├── specs/_INDEX.md            # Feature specs created here in Phase 3 via Spec Kit
├── templates/                 # All 14 templates kept for future doc creation
└── workflow/
    ├── workflows.md           # Canonical manifest + process reference
    ├── specific-workflows/    # product-lifecycle, refinement-loop, spec-driven-delivery,
    │                          # mvp-to-growth-transition, key-docs-to-*, review-to-ssd
    └── _personas/             # users / stakeholders / contributors
```

Not created in the target: `bin/` (the initializer itself), `.claude/commands/` (ships in the tarball but is not copied — see §6), `requirements/` content beyond the five docs, any node_modules.

## 4. Existing Projects: How "Migration" Is Handled Today

There is **no migration system yet** — behavior on a non-empty repo is a mix of merge-safe and clobbering operations:

**Merge-safe (existing content respected):**
- `.gitignore` — block appended only if absent.
- `package.json` — scripts added only for unused names; parse errors degrade to a warning with manual instructions.
- Directory copies merge file-by-file into existing folders.

**Clobbering (existing content overwritten without prompting):**
- The five guiding docs — an existing `README.md` (or `CLAUDE.md`, etc.) is **replaced with the template**.
- The five `requirements/` docs — **re-running init resets filled-in PRD/EDD/TDD/Roadmap/Backlog to blank templates**.
- `.git/hooks/pre-commit` — replaces any existing hook (husky users beware).
- Same-named files inside the eight copied directories.

**Practical guidance until this improves:** run init only on a clean working tree (`git status` clean) so every overwrite is reviewable as a diff, and restore anything unwanted with `git checkout -- <path>`. Treat re-running init on an initialized project as destructive.

**Planned (v2, backlog + architecture proposal):** an init-time configuration interview; detect existing artifacts and merge-don't-overwrite (import existing docs into `_notes/` and reference them); ask which lifecycle phase the project is realistically in (an already-shipped product may enter directly at Growth, scaffolding the roadmap/backlog in post-transition shape per `mvp-to-growth-transition.md`); a `--dry-run` flag listing what would be created/merged. See `.021-updates/framework-architecture-proposal.md` and `requirements/05-BACKLOG.md` (v2 item 4).

## 5. Getting-Started Steps (Phase by Phase)

1. **Scaffold:** `npx zero-two-one-init` in the repo (after `git init` and `npm init -y` if brand new; re-run init if either was missing, so the hook and scripts get wired).
2. **Orient:** read `README.md` and `workflow/workflows.md`; the 4-phase lifecycle is defined in `workflow/specific-workflows/product-lifecycle.md`.
3. **Phase 1 — Planning:** fill in `requirements/01-PRD.md` (what & why), `03-TDD.md` (architecture), `04-ROADMAP.md` (MVP milestones). Update `CLAUDE.md` with project context and `DESIGN.md` with design tokens. Exit gate: PRD, TDD, Roadmap complete.
4. **Verify:** `npm run status` (phase detection) and `npm run qa` (phase-appropriate checks). With Claude Code, `/status` wraps this plus a document-completeness review.
5. **Phase 2 — Pre-build:** draft `02-EDD.md`, build the static prototype in `prototype/`, and iterate via refinement rounds (`requirements/_refinement/r{n}-review.md`, using `templates/06-REVIEW-Template.md`; plans are human-approved before living docs change).
6. **Phase 3 — MVP Build:** install Spec Kit (`uv tool install specify-cli --from git+https://github.com/github/spec-kit.git`, then `specify init --here --ai claude`). Features flow: spec on an `NNN-feature-name` branch → user approves via `npm run spec:status -- set <spec> Approved` → `npm run spec:context` to generate `.ai/context/` bundles → implement → `npm run spec:verify`. The pre-commit gate blocks implementation code until the spec is approved.
7. **Phase 4 — Growth:** after the MVP ships and QA is green, follow `workflow/specific-workflows/mvp-to-growth-transition.md` — freeze the MVP roadmap, activate Releases, and prioritize the backlog by user value.
8. **Agent memory:** ask the AI assistant to record the current lifecycle phase in its memory and keep it updated.

## 6. Known Gaps & Observations (candidates for r2)

1. **Slash commands don't reach the user.** `.claude/commands/{init,status}.md` ship in the tarball but `init.js` never copies `.claude/` into the target, so `/init` and `/status` are not available in the initialized repo. Either copy them in step 1 or document that users must copy them manually.
2. **README clobber.** Overwriting an existing `README.md` with the template is the most likely first bad surprise for an existing project.
3. **Destructive re-run.** Re-running init resets `requirements/*.md`; there's no `--force`/`--skip-existing` distinction.
4. **Hook conflict.** Installing `.git/hooks/pre-commit` overwrites hook managers' hooks (husky, lefthook) with no chaining.
5. **No uninstall/upgrade path.** Nothing removes or versions the scaffolded surface; upgrading the framework in an initialized repo is undefined.
