# r3 Research: Alternative Tools & Design System Landscape

**Date:** 2026-07-10
**Purpose:** Ground the r3 refinement round (pluggable tool init/migration + pluggable design system) in the actual configuration surfaces of the candidate tools. Feeds the adapter contracts in the r3 TDD plan.

## 1. Google Antigravity

**What it is:** Google's agent-first development platform. Launched 2025-11-18 as a VS Code-fork IDE powered by Gemini 3; **Antigravity 2.0** (2026-05-19, I/O) pivoted to a full platform — standalone Agent Manager app, desktop app, **CLI, and SDK** — with multi-agent orchestration as the core model. Current IDE line ~v1.20.x with MCP support and terminal sandboxing.

**Configuration surface (what an adapter must produce):**
- **Rules files:** `AGENTS.md` at the project root (supported v1.20.3+, alongside `GEMINI.md`) — persistent "constitution" instructions, always on. **Direct functional equivalent of `CLAUDE.md`.**
- **Global config:** `~/.gemini/config/` (`mcp_config.json`, global `skills/`).
- **Project config:** `<root>/.agents/` — notably `skills/` packages, each a directory with `SKILL.md` (metadata + instructions) plus optional `scripts/`, `references/`, `assets/`. **Maps well from our `skills/*.md` prompts.**
- **Work artifacts:** task lists, implementation plans, walkthroughs, diffs, screenshots — generated per task, reviewable (artifact review gate with an "Always Proceed" override). These are **session artifacts, not committed markdown specs**.

**Adapter implications:**
- *Assistant adapter:* straightforward — render the assistant-instructions template as `AGENTS.md`; convert skills to `.agents/skills/` packages; register MCP/tools in `~/.gemini/config/mcp_config.json`.
- *SSD adapter:* **hard.** Antigravity's plan/artifact model is not file-based spec state, so our pre-commit gate has nothing durable to read. Recommended posture: Antigravity as **assistant only**, paired with a file-based SSD engine (Spec Kit or Kiro specs). Revisit if the 2.0 SDK exposes artifact persistence.

## 2. Kiro (IDE + CLI)

**What it is:** AWS's agentic IDE built around **spec-driven development natively**, plus Kiro CLI (terminal agents; CLI 3.0 early access adds spec-driven development in the terminal, capability-based permissions, standalone-file hooks).

**Configuration surface:**
- **Specs:** `.kiro/specs/<feature>/` containing `requirements.md` (EARS notation: "WHEN … THE SYSTEM SHALL …"), `design.md` (architecture, sequence diagrams), `tasks.md` (trackable tasks; Kiro executes them in dependency "waves" with live status). Version-controlled in-repo. **Direct analogue of Spec Kit's `specs/NNN-feature/` — but no `status:` frontmatter natively**; task progress lives as checkbox state in `tasks.md`.
- **Steering:** `.kiro/steering/*.md` (workspace), `~/.kiro/steering/` (global; team distribution via MDM). Defaults: `product.md`, `tech.md`, `structure.md`. YAML frontmatter inclusion modes: `always`, `fileMatch` (glob-scoped), `manual` (`#name` reference), `auto` (matched by description). **Maps almost 1:1 onto our guiding-doc split: PRODUCT.md → product.md, CODE.md/TDD → tech.md, workflows/structure → structure.md.**
- **CLI agents:** JSON files in `.kiro/agents/` (local) / `~/.kiro/agents/` (global). Key fields: `prompt` (inline or `file://./path.md` — can point at our guiding docs), `tools`/`allowedTools`, `resources` (`file://` globs, `skill://` lazy-loaded skills, knowledge bases), `mcpServers`, `hooks` (`agentSpawn`, `userPromptSubmit`, `preToolUse`, `postToolUse`, `stop`).

**Adapter implications:**
- *Assistant adapter:* render assistant instructions as steering files (multi-file, frontmatter-scoped) instead of one `KIRO.md`; ship a `zero-two-one.json` CLI agent whose `prompt`/`resources` load the guiding + key docs.
- *SSD adapter:* Kiro specs replace `specs/NNN-*` + Spec Kit. Gate contract mapping needed: either inject `status:` frontmatter into Kiro spec files (Kiro tolerates extra frontmatter) or derive gate state from `tasks.md` checkbox progress + an approval marker. `spec:context`/`spec:verify` scripts need a Kiro backend.

## 3. Google Material Design (M3 / M3 Expressive)

**What it is:** Google's design system, current generation Material 3 with the **M3 Expressive** expansion (new components, motion, shapes) and I/O 2026 layout/component updates.

**Token system (what a design-system adapter consumes/produces):**
- Three tiers, dot-named: `md.ref.*` (reference palettes), `md.sys.*` (system roles — **theming happens here** by remapping sys → ref per context, e.g. light/dark), `md.comp.*` (component-level).
- Categories: color, typography, shape, elevation, motion — density & spacing tokens on the roadmap.
- **Tooling:** Material Theme Builder (web + Figma plugin) generates dynamic themes from brand palettes/images and **exports token artifacts as CSS variables, JSON, DSP** for Android/Kotlin, Flutter, React, and web.

**Adapter implications:**
- `DESIGN.md` becomes the mapping doc: project palette/type decisions expressed as `md.sys.*` role assignments, with the Theme Builder export (JSON/CSS vars) checked into `requirements/_design/` and referenced.
- The prototype consumes exported CSS variables directly — a design-system swap re-themes the prototype without touching key docs (confirms the r1 architecture proposal's assumption).
- The selection workflow must surface M3-specific implications: component availability, dynamic color, accessibility defaults, platform export targets.

## 4. Cross-Cutting Observations for the Adapter Contracts

1. **The assistant-instructions doc is the universal primitive** — every tool has one (`CLAUDE.md` / `AGENTS.md`+`GEMINI.md` / steering files). The template must become tool-neutral with per-adapter rendering (single file vs multi-file split).
2. **Skills are convergent**: our `skills/*.md` ↔ Antigravity `.agents/skills/*/SKILL.md` ↔ Kiro `skill://` resources. One source format, three renderers.
3. **SSD engines differ in state model**: Spec Kit (frontmatter status — our gate's native contract), Kiro (task checkboxes, no status field), Antigravity (ephemeral artifacts — no durable state). The gate contract from r2 (§ "status readable by `verify-spec-compliance.js`") needs a per-engine state-mapping layer, and Antigravity is assistant-only for now.
4. **`AGENTS.md` is emerging as a cross-tool convention** — worth making it the *neutral default* output name, with `CLAUDE.md`/steering as tool-specific renderings.
5. Everything maps into the `.zero-two-one.json` `tools` block (r2, TDD §7) without schema changes: `assistant: claude-code | antigravity | kiro`, `ssd: github-speckit | kiro-specs`, plus a new `design: material-3 | none | <system>` key (one-line schema addition — flag in r3 review).

## Sources

- [Google Antigravity](https://antigravity.google/) · [Google Developers Blog — Build with Google Antigravity](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/) · [Antigravity codelab](https://codelabs.developers.google.com/getting-started-google-antigravity) · [Antigravity 2.0 (Analytics Vidhya)](https://www.analyticsvidhya.com/blog/2026/05/google-antigravity-2-0/) · [Antigravity 2.0 platform (TNW)](https://thenextweb.com/news/google-antigravity-2-desktop-cli-sdk-io-2026) · [Setup guide 2026](https://petronellatech.com/blog/google-antigravity-ide-setup-guide-2026/) · [Complete guide](https://aicodingtools.im/blog/what-is-google-antigravity-complete-guide)
- [Kiro Specs docs](https://kiro.dev/docs/specs/) · [Kiro steering docs](https://kiro.dev/docs/steering/) · [Kiro CLI agent config reference](https://kiro.dev/docs/cli/custom-agents/configuration-reference/) · [Kiro CLI 3.0](https://kiro.dev/docs/cli/v3/) · [Kiro CLI intro](https://kiro.dev/blog/introducing-kiro-cli/) · [SDD tools comparison (Martin Fowler)](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)
- [M3 design tokens](https://m3.material.io/foundations/design-tokens/overview) · [M3 Expressive overview](https://supercharge.design/blog/material-3-expressive) · [Material 3 Design Kit (Figma)](https://www.figma.com/community/file/1035203688168086460/material-3-design-kit) · [Angular Material 3 theming tokens](https://konstantin-denerz.com/angular-material-3-theming-design-tokens-and-system-variables/)
