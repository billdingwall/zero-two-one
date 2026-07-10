# Technical Design Document (TDD): Zero Two One

## 1. System Architecture

The framework consists of three main technical components:
1. **The CLI Scaffolder (`bin/init.js`)**: A zero-dependency Node.js script that constructs the user workspace from clean templates.
2. **The Refinement Gate (`hooks/pre-commit`)**: A bash script installed into `.git/hooks/` that parses Markdown frontmatter in `specs/` to determine approval status.
3. **Lifecycle Tooling (`scripts/`)**: Node.js scripts for fetching context, verifying compliance, and determining project status.

## 2. Data Models
State is managed entirely in text files (Markdown frontmatter and JSON):
- `specs/*/spec.md`: Tracks feature lifecycle status (`status: Draft | In Review | Approved | Ready for Dev | In Progress | Done`).
- `.ai/context/*.json`: Derived artifacts combining spec criteria and gate state for AI consumption.

## 3. Technical Constraints & Decisions
- **Zero Runtime Dependencies**: The framework must run on built-in Node.js modules (`fs`, `path`, `child_process`) and standard POSIX shell utilities. We do not want to bloat the user's `node_modules` with framework tooling.
- **Dual-Workspace Dogfooding**: The repository maintains a boundary between internal development (root) and the distributable template (`package/`). A sync script (`scripts/sync-to-package.js`) bridges them and must implement the Package Manifest (section 5) — including excluding itself and any future dev-only scripts from `package/scripts/`. Any change to what ships requires updating the manifest first.

## 4. Claude Code Integration
- Uses `.claude/commands/` for custom slash commands (`/init`, `/status`).
- Uses `tools.json` (MCP or Anthropic tool schemas) mapped to local Node scripts for verifying specs and fetching context.

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

## Changelog
- **2026-07-10 (r1):** Added Package Manifest (section 5); amended Dual-Workspace Dogfooding constraint to bind the sync script to the manifest. Per [_refinement/r1-update-tdd.md](_refinement/r1-update-tdd.md).
