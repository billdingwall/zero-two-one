# Technical Design Document (TDD): Zero Two One

## 1. System Architecture

The framework consists of three main technical components:
1. **The CLI Scaffolder (`bin/init.js`)**: A zero-dependency Node.js script that constructs the user workspace from clean templates. It runs in one of two modes, decided at startup:
   - **Scaffold mode** — the target has no framework install and no meaningful pre-existing content in the paths init touches.
   - **Migrate mode** — auto-detected when any of the following exist: `README.md` or other guiding docs, `requirements/`, `.specify/` or a populated `specs/`, an existing `.git/hooks/pre-commit`, or a prior `.zero-two-one.json`. Migrate mode applies the ownership rules (§6) and runs the detection/interview flow (§8).
2. **The Refinement Gate (`hooks/pre-commit`)**: A bash script installed into `.git/hooks/` that parses Markdown frontmatter in `specs/` to determine approval status. Installation is conflict-aware:
   - No existing hook → install directly (current behavior).
   - Existing plain `pre-commit` → install the gate as `.git/hooks/pre-commit.zto` and append a guarded invocation line to the existing hook.
   - Hook manager detected (`.husky/`, `lefthook.yml`) → add the gate invocation to the manager's config instead of touching `.git/hooks/` directly.
   - Never silently overwrite; `--dry-run` shows which strategy will be used.
3. **Lifecycle Tooling (`scripts/`)**: Node.js scripts for fetching context, verifying compliance, and determining project status.

## 2. Data Models
State is managed entirely in text files (Markdown frontmatter and JSON):
- `specs/*/spec.md`: Tracks feature lifecycle status (`status: Draft | In Review | Approved | Ready for Dev | In Progress | Done`).
- `.ai/context/*.json`: Derived artifacts combining spec criteria and gate state for AI consumption.

## 3. Technical Constraints & Decisions
- **Zero Runtime Dependencies**: The framework must run on built-in Node.js modules (`fs`, `path`, `child_process`) and standard POSIX shell utilities. We do not want to bloat the user's `node_modules` with framework tooling.
- **Dual-Workspace Dogfooding**: The repository maintains a boundary between internal development (root) and the distributable template (`package/`). A sync script (`scripts/sync-to-package.js`) bridges them and must implement the Package Manifest (section 5) — including excluding itself and any future dev-only scripts from `package/scripts/`. Any change to what ships requires updating the manifest first.

## 4. Assistant Integration (default stack: `claude`)
The assistant role is stack-resolved (§9); this section documents the default `claude` binding.
- Uses `.claude/commands/` for custom slash commands (`/021-init`, `/021-status` — see the naming convention, §6). `init.js` copies `.claude/commands/` into the target repo, merge-safe: existing user commands with the same name win, and skips are reported.
- Uses `tools.json` (MCP or Anthropic tool schemas) mapped to local Node scripts for verifying specs and fetching context.
- **Spec Kit detection**: if `.specify/` or a spec-bearing `specs/` exists in the target, init validates spec frontmatter compatibility with the gate (a `status:` field readable by `verify-spec-compliance.js`), reuses the existing setup, and suppresses the `specify init` next-step guidance.

## 5. Package Manifest

The canonical contract for what crosses the root ↔ `package/` boundary. `scripts/sync-to-package.js` enforces this manifest.

### Ships in the package (synced from root)
| Path | Notes |
|---|---|
| `bin/` | CLI scaffolder (`init.js`) |
| `hooks/` | Refinement gate (`pre-commit`) |
| `templates/` | Starting-point templates, including guiding-doc templates |
| `workflow/` | Lifecycle, refinement, and SSD process docs |
| `skills/` | Agent prompts and `tools.json` |
| `scripts/` | Lifecycle tooling only — dev-only scripts are excluded (see below) |
| `specs/`, `prototype/` | Empty scaffolds with `_INDEX.md` |
| `.github/` | Issue templates |
| `README.md`, `.gitignore` | Starting-point files |

### Package-only (never overwritten by sync)
| Path | Notes |
|---|---|
| `package/package.json` | Publish config (`files`, `publishConfig`, cleaned scripts) |
| `package/.claude/` | Claude Code slash commands shipped to users |

### Root-only (development workspace, excluded from sync)
| Path | Notes |
|---|---|
| `requirements/` | This framework's own living docs |
| `.021-updates/` | Internal audits and proposals |
| `scripts/sync-to-package.js` | The bridge tool itself — users never sync a package |
| `CLAUDE.md`, `CODE.md`, `PRODUCT.md`, `DESIGN.md` | Root instances are dogfooding content; the package delivers their `templates/*-Template.md` counterparts instead |
| `.ai/` | Generated, gitignored artifacts |

### Template → install mapping
Guiding docs are delivered as templates and instantiated by `bin/init.js` in the user's repo:
`templates/CLAUDE-Template.md` → `CLAUDE.md` · `templates/CODE-Template.md` → `CODE.md` · `templates/PRODUCT-Template.md` → `PRODUCT.md` · `templates/DESIGN-Template.md` → `DESIGN.md` · `templates/README-Template.md` → `README.md` · `templates/0N-*-Template.md` → `requirements/0N-*.md`.

## 6. File Ownership & Merge Rules

The enforcement contract for both init modes. The Package Manifest (§5) defines what ships; this section defines how it lands.

| Class | Paths | Install | Re-run | Upgrade |
|---|---|---|---|---|
| **Framework-owned** | `scripts/`, `hooks/`, `skills/`, `workflow/`, `templates/`, `.github/`, `.claude/commands/` | copy | overwrite only if unmodified vs manifest hash; else report conflict | same |
| **User-owned, instantiated** | `CLAUDE.md`, `CODE.md`, `PRODUCT.md`, `DESIGN.md`, `README.md`, `requirements/*.md` | create-if-missing | never touch | never touch |
| **Merged** | `.gitignore`, `package.json` (scripts) | additive merge | idempotent | idempotent |
| **Generated** | `.ai/context/` | provision empty | leave | leave |

- `--force <path>` is the only way to overwrite user-owned files.
- `--dry-run` prints the classified action plan (create / skip / merge / conflict per file) and exits without changing anything.
- **Existing-doc import**: when a user-owned doc already exists, init writes `requirements/_notes/imported-docs.md` cataloging what was found (path + description slot), and the fresh templates link to it — existing content is referenced, never moved or rewritten.
- **Framework naming convention (r3)**: every framework-owned name installed into a shared namespace follows `021-<name>` (lowercase kebab-case after the prefix; `:` reserved for npm subcommand grouping, e.g. `021-spec:status`; bare `021` only where a tool requires a single identifier). The rule is authored in `CODE.md` §2 and enforced structurally here: in shared directories, framework-owned paths are **stack-resolved and 021-scoped** (`.claude/commands/021-*` for `claude`; `.agents/skills/021-*` for `antigravity`; `.kiro/steering/021-*` + `.kiro/agents/021.json` for `kiro`), so user files in the same directories are untouchable by definition. Lifecycle npm scripts: `021-status`, `021-qa`, `021-spec:status`, `021-spec:context`, `021-spec:verify`. `zero-two-one-init` and `.zero-two-one.json` already comply.

## 7. Install Manifest (`.zero-two-one.json`)

Written to the **target repo root** at install (user-visible state, not a generated artifact):

```json
{
  "version": "<package version>",
  "installedAt": "<ISO date>",
  "mode": "scaffold | migrate",
  "phase": "planning | prebuild | mvp | growth",
  "tools": {
    "stack": "claude | antigravity | kiro",
    "assistant": "claude-code | antigravity | kiro",
    "ssd": "github-speckit | kiro-specs",
    "design": "none | material-3 | <system>"
  },
  "files": { "<path>": "<sha256 at install>" }
}
```

- Basis for **idempotent re-runs** (skip anything present and unmodified), **`--upgrade`** (refresh framework-owned files whose hash still matches install; list conflicts otherwise), and a documented **uninstall** (delete files still matching their hash; list the rest for manual review).
- `workflow-status.js` reads `phase` from the manifest when present, instead of inferring from directory contents.
- `assistant`/`ssd` are **derived from `stack`** (kept for per-role tooling and r2 compatibility); `design` is chosen independently of the stack (§9.4). Additive since r2 — no schema break.

## 8. Migrate-Mode Detection & Phase Interview

- **Heuristics first**: tests + CI + release history → likely Growth; code present but no framework docs → likely mid-MVP; otherwise Planning/Pre-build.
- **Then confirm**: interactive prompt via `node:readline`, or `--phase <phase>` for non-interactive runs.
- **Stack detection (r3)**: existing tool surfaces propose the matching stack — `.claude/` → `claude`; `.agents/` or `AGENTS.md` → `antigravity`; `.kiro/` → `kiro`; `.specify/`/populated `specs/` confirms `github-speckit`. Conflicting surfaces (e.g. both `.claude/` and `.kiro/`) → the interview decides; detection lists what was found. Non-interactive: `--stack` and `--design` flags.
- **Growth entry** scaffolds `04-ROADMAP.md`/`05-BACKLOG.md` in post-transition shape per `workflow/specific-workflows/mvp-to-growth-transition.md` (Releases section active, MVP section historical) and records the phase in the manifest.
- Zero-runtime-dependency constraint holds throughout: hashing via `node:crypto`, prompts via `node:readline` — no new packages.

## 9. Adapter Architecture & Contracts

The framework runs on one of **three supported stacks** (free assistant × SSD pairing is out of scope — r3 stakeholder direction), plus an independent design-system role. Bindings here are normative; process docs (layer 3) reference roles only.

### 9.1 Source layer (tool-neutral)

`templates/ASSISTANT-Template.md` (generalized from `CLAUDE-Template.md`; **`AGENTS.md` is the neutral default output name**), `skills/*.md` prompts, the key docs, and `skills/tools.json` schemas. Renderers are template transforms in `bin/init.js` — built-in `fs`/`path` only, YAML frontmatter emitted as plain text (zero-dependency constraint holds).

### 9.2 Supported stacks

All command surfaces follow the naming convention (§6):

| Stack | Instructions | Skills/commands (021-namespaced) | SSD engine |
|---|---|---|---|
| `claude` (default) | `CLAUDE.md` | `skills/*.md` as-is; `.claude/commands/021-init.md`, `021-status.md` → `/021-init`, `/021-status` | `github-speckit` |
| `antigravity` | `AGENTS.md` (project root; `GEMINI.md` honored) | `.agents/skills/021-<name>/SKILL.md` (+ `scripts/`, `references/`, `assets/`); MCP via `~/.gemini/config/mcp_config.json`; artifact-review gate noted | `github-speckit` |
| `kiro` | `.kiro/steering/021-{product,tech,structure}.md` with YAML frontmatter inclusion modes (`always` for product/tech; `fileMatch` where scoped) | `skill://` resources; `.kiro/agents/021.json` CLI agent, invoked as `021` (`prompt: file://` → guiding docs, `resources` globs → key docs, lifecycle `hooks`) | `kiro-specs` |

Steering mapping for `kiro`: `PRODUCT.md` → `021-product.md`; `CODE.md` + TDD constraints → `021-tech.md`; `workflows.md` structure summary → `021-structure.md` — namespaced filenames so existing user steering is never clobbered.

### 9.3 SSD engine contract

Every engine must expose: (a) **durable committed spec state** readable by the gate, (b) a context source for `021-spec:context`, (c) a verify surface for `021-spec:verify`.

- `github-speckit`: `specs/NNN-*/spec.md` `status:` frontmatter — native. Serves the `claude` **and** `antigravity` stacks: Antigravity's task lists / implementation plans / walkthroughs are session artifacts, not durable spec state, so Spec Kit holds the gate-readable state while Antigravity drives.
- `kiro-specs`: `.kiro/specs/<feature>/{requirements,design,tasks}.md` (EARS notation); adapter injects `status:` frontmatter into `requirements.md` (Kiro tolerates extra frontmatter); task progress derived from `tasks.md` checkboxes; `scripts/speckit/*` gain an engine-dispatch layer (read engine from the manifest, resolve paths/state accordingly). Serves the `kiro` stack.

### 9.4 Design-system adapter contract (independent of stack)

`DESIGN.md` carries a structured **token mapping** section: project decisions expressed as system-token role assignments; exported artifacts checked into `requirements/_design/tokens/`; the prototype consumes the CSS variables, so a system swap re-themes without touching key docs.

- `none` (default): bespoke `DESIGN.md` tokens — current behavior.
- `material-3`: roles map to `md.sys.*` tokens (tiers `md.ref`/`md.sys`/`md.comp`; color/typography/shape/elevation/motion); Material Theme Builder exports (JSON/CSS variables/DSP) stored and referenced; M3 Expressive component/motion implications surfaced by the [design-system-selection workflow](../workflow/specific-workflows/design-system-selection.md).

## Changelog
- **2026-07-10 (r3):** §4 generalized to Assistant Integration (default stack `claude`); new §9 Adapter Architecture (three supported stacks, SSD engine contract, design-system adapter); §7 `tools` block gains `stack`/`design`; §8 stack detection; §6 framework naming convention (`021-`). Per [_refinement/r3-update-tdd.md](_refinement/r3-update-tdd.md).
- **2026-07-10 (r2):** Two-mode CLI (§1), conflict-aware hook install (§1), merge-safe `.claude/commands/` delivery + Spec Kit detection (§4), new §6 File Ownership & Merge Rules, §7 Install Manifest (root location confirmed), §8 Migrate-Mode Detection. Per [_refinement/r2-update-tdd.md](_refinement/r2-update-tdd.md).
- **2026-07-10 (r1):** Added Package Manifest (section 5); amended Dual-Workspace Dogfooding constraint to bind the sync script to the manifest. Per [_refinement/r1-update-tdd.md](_refinement/r1-update-tdd.md).
