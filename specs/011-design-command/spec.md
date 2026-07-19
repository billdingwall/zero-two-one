---
status: Done
feature: Design-System Install Command (021-design)
release: mvp-5
branch: 011-design-command
created: 2026-07-18
---

# Feature Spec: Design-System Install Command (`021-design`)

*The second feature of [mvp-5 — Lifecycle Commands](../../requirements/_releases/mvp-5.md). Where [spec 010](../010-feedback-command/spec.md) shipped `021-feedback`, this ships `021-design`: the assistant-driven command that operationalizes the Design-System Selection workflow (`workflow/specific-workflows/design-system-selection.md`) over the §9.4 design adapter — landing a token mapping in `DESIGN.md`, importing exported artifacts, recording `tools.design`, and re-theming the prototype if one exists. Grounded in TDD §11 (Design-System Install Command) and §9.4 (design-system adapter contract).*

## Why

The design-system adapter (TDD §9.4), the `DESIGN.md` token-mapping template, the manifest `tools.design` field, and the DSS workflow all already exist as design canon — but there is **no command to operationalize them**. A user who wants to adopt Material 3 (or bring their own tokens) today has to hand-walk the workflow: edit `DESIGN.md`'s mapping table by hand, drop export files somewhere, and manually set `tools.design`. Nothing guides the *assess* decisions (component gaps vs the EDD, theming model, a11y defaults, export targets) or keeps the artifacts and the manifest in step. `021-design` closes that: one assistant command that walks select → assess → map → cascade, lands the result as structured tokens the rest of the framework consumes, and records the choice — so a design system is adopted **deliberately**, not as an ad-hoc edit.

## Users & Context

- **Primary user:** a developer adopting, switching, or removing a design system — typically during Planning (Phase 0) or via a refinement round; the system can also be pre-set at init (`--design`).
- **Trigger:** the user invokes the stack-rendered command (`/021-design` on `claude`; the `021-design` skill on `antigravity`; steering + the `021` agent on `kiro` — TDD §9.2). The assistant drives the judgement (assess/map); the mechanical layer records `tools.design` and scaffolds the artifact locations.
- **Builds on:** the §9.4 adapter contract; `templates/DESIGN-Template.md` → `DESIGN.md` (frontmatter tokens + "Design System Mapping" section); the manifest `tools.design` resolution (`scripts/init/index.js:44`); the DSS workflow (select/assess/map/cascade/review); the spec 006 renderer + spec 009 CLI (surface + mechanical entry); the [spec 010](../010-feedback-command/spec.md) pattern (LLM drives, a thin zero-dep script does the mechanical write).
- **Interacts with `021-prototype` (§12, spec 012, not yet built):** the cascade step re-themes `prototype/` from the exported CSS variables **when a prototype exists**; because the prototype is optional (r5), this is a conditional no-op when absent — `021-design` does not depend on `021-prototype` shipping.

## Clarifications

### Session 2026-07-18

- **Q: Mechanical split — CLI subcommand + script, or pure walkthrough?**
  A: **Thin script + CLI subcommand.** A `scripts/design.js` exposed as `021 design set <system>` records `tools.design` in the manifest and scaffolds `requirements/_design/tokens/`; the assistant walks assess/map and edits `DESIGN.md`. Mirrors [spec 010](../010-feedback-command/spec.md): the LLM drives the judgement, a thin zero-dep script does the deterministic write — `tools.design` is set **without** a full init re-run.
- **Q: `DESIGN.md` mapping edit — rewrite or merge?**
  A: **Replace the "Design System Mapping" section** each run (idempotent, deterministic), always **preserving the bespoke frontmatter token block** above it. A switch cleanly replaces the old mapping; `none` leaves only the bespoke block. A stable section marker bounds the replaced region.
- **Q: Prototype re-theme — direct write, or defer to `021-prototype`?**
  A: **`021-design` writes/updates the exported CSS-variables file** under `requirements/_design/tokens/` and, when `prototype/` exists, points it at those variables; it does **not** generate a prototype. When `prototype/` is absent the cascade is a clean **no-op**. No dependency on spec 012.
- **Q: Living docs — edit directly, or stage for a round?**
  A: **Edit directly + surface the round.** The command edits `DESIGN.md` and records `tools.design` directly (the deterministic parts) and does the EDD annotation as an **assistant-guided edit**; it then tells the user to record the change through a refinement round with a changelog entry. It does **not** auto-open/close the round.
- **Q: EDD cascade — automated or guided?**
  A: **Assistant-guided edit** (folded into the answer above) — the assistant annotates EDD scenarios the system's constraints affect; there is no automated EDD rewrite.
- **Q: material-3 import — which export formats?**
  A: **Material Theme Builder JSON + CSS variables** (JSON as the source-of-truth export; the CSS variables are what the prototype consumes). DSP export is optional/accepted-if-supplied. BYO accepts any user-supplied export mapped onto the framework roles.

## User Scenarios (Acceptance)

1. **Adopt Material 3** — *Given* a project on `design: none`, *when* the user runs `021-design` and selects Material 3, *then* the assistant walks the assess decisions, `DESIGN.md`'s "Design System Mapping" section is populated with project-role → `md.sys.*` assignments, and the manifest records `tools.design: material-3`.
2. **Bring your own** — *Given* a user-supplied token export, *when* the user selects BYO, *then* the export is mapped onto the framework's role assignments in `DESIGN.md` (no named-system assumptions) and `tools.design` records the system name.
3. **Import artifacts** — *Given* an exported token file (e.g. Material Theme Builder JSON / CSS variables), *when* the command runs, *then* the artifact is placed under `requirements/_design/tokens/` (created on first use) and referenced from `DESIGN.md` — artifacts are checked in, not regenerated ad hoc.
4. **Cascade to the prototype** — *Given* a `prototype/` exists, *when* a system is adopted or swapped, *then* the prototype re-themes from the exported CSS variables; *given* no prototype exists, *then* the cascade is a no-op (the prototype is optional).
5. **Switch systems** — *Given* a project already on Material 3, *when* the user switches to another system, *then* the mapping is redone with the new assignments, new artifacts land in `requirements/_design/tokens/`, and `tools.design` updates — components still consume tokens, never raw values.
6. **Remove a system** — *Given* a project on a named system, *when* the user removes it, *then* `DESIGN.md` reverts to its bespoke frontmatter tokens and `tools.design: none`.
7. **Deliberate, recorded change** — *Given* any adoption/switch/removal, *when* the command completes, *then* it surfaces that the change lands through a refinement round (DSS step 5) with matching changelog entries — the command does not silently mutate living docs outside that process.
8. **Cross-stack render** — *Given* a non-`claude` stack, *when* the framework is installed, *then* the design command is reachable in that stack's surface with identical behavior, because all stacks call the same `021` CLI (TDD §9.2).

## Functional Requirements

- **FR-001 — Stack-rendered command surface.** `021-design` is produced on each stack by the spec 006 renderer from a single source (claude command / antigravity SKILL / kiro via the `021` agent). Behavior is identical across renderings, all calling the same `021` CLI.
- **FR-002 — Mechanical layer: `021 design set <system>`.** A thin `scripts/design.js`, dispatched via a `021 design` subcommand (spec 009 pattern), performs the deterministic work: **record `tools.design`** in the manifest (without a full init re-run), **scaffold `requirements/_design/tokens/`** on first use, and **replace the `DESIGN.md` mapping section**. The assistant walks the judgement steps around it *(clarified 2026-07-18)*.
- **FR-003 — Select & assess.** The command walks the DSS *select* (name a system / BYO / stay bespoke) and *assess* steps — component availability vs the EDD's core scenarios, theming model, a11y defaults, export targets, licensing — surfacing unresolved items to `04-BACKLOG.md`'s Open Questions register (assistant-driven judgement).
- **FR-004 — Map into `DESIGN.md`.** The command expresses the project's decisions as **system-token role assignments** by **replacing** `DESIGN.md`'s "Design System Mapping" section (bounded by a stable marker; idempotent), always **preserving the bespoke frontmatter token block** above it *(clarified 2026-07-18)*. When the marker is absent the section is **appended**; when `DESIGN.md` itself is absent it is **created from the template first** (it is user-owned create-if-missing) *(analyze A2)*. Under `none`, only the bespoke block remains; a named system fills the mapping table without discarding it.
- **FR-005 — Import artifacts.** Exported token files are placed under `requirements/_design/tokens/` (created on first use) and referenced from `DESIGN.md`. Artifacts are checked in, not regenerated ad hoc.
- **FR-006 — Cascade (CSS-variables write; prototype optional).** The command writes/updates the exported **CSS-variables file** under `requirements/_design/tokens/`; when a `prototype/` exists it points the prototype at those variables (a swap re-themes without touching key docs); when absent this is a **no-op**. It does **not** generate a prototype (that is spec 012). EDD scenarios affected by the system's constraints are annotated as an **assistant-guided edit** *(clarified 2026-07-18)*.
- **FR-007 — Record `tools.design`.** The manifest's `tools.design` records the selected system (`none` | `material-3` | `<byo-name>`), consistent with the init `--design` resolution (`scripts/init/index.js`), so `021-status`/`021-doctor` and later renders see the choice.
- **FR-008 — `material-3` binding.** Roles map to `md.sys.*` tokens across the M3 tiers (`md.ref`/`md.sys`/`md.comp`; color/typography/shape/elevation/motion); **Material Theme Builder JSON + CSS variables** are the artifact source (JSON source-of-truth, CSS variables consumed by the prototype; DSP accepted if supplied) *(clarified 2026-07-18)*; M3 Expressive component/motion implications are surfaced.
- **FR-009 — Bring-your-own.** A user-supplied token export is mapped onto the framework's role assignments with no named-system assumptions; `tools.design` records the system's name.
- **FR-010 — Switch / remove.** Switching repeats the map with a new mapping and new artifacts; removing reverts `DESIGN.md` to bespoke tokens and sets `tools.design: none`. Both are deliberate operations, not ad-hoc edits.
- **FR-011 — Edit directly; surface the round.** The command edits `DESIGN.md` and records `tools.design` **directly**, and does the EDD annotation as a guided edit; it then **surfaces** that the change should be recorded through a refinement round (DSS step 5) with a changelog entry — it does **not** auto-open/close the round *(clarified 2026-07-18)*.
- **FR-012 — Zero runtime dependencies.** The mechanical parts (manifest write, `tokens/` scaffold, artifact file moves, `DESIGN.md` section replace) use built-ins only — no CSS parser, no design-tooling SDK.

## Key Entities

- **DesignSelection** — `{ system: 'none' | 'material-3' | '<byo>', artifacts: string[] }`; the choice + the imported export files.
- **TokenMapping** — the project-role → system-token assignments written into `DESIGN.md`'s "Design System Mapping" section (bespoke frontmatter tokens retained under `none`).
- **Token artifacts** — exported files under `requirements/_design/tokens/`, referenced from `DESIGN.md`; the prototype consumes their CSS variables.
- **`tools.design`** — the manifest field recording the active system; the audit trail for status/doctor and future renders.

## Acceptance Criteria

- Selecting Material 3 populates `DESIGN.md`'s mapping with `md.sys.*` role assignments and sets `tools.design: material-3`.
- BYO maps a user export onto the framework roles and records the system name; no `md.sys.*` assumptions leak into a BYO mapping.
- Imported artifacts land under `requirements/_design/tokens/` (dir created on first use) and are referenced from `DESIGN.md`.
- With a `prototype/` present, a system adoption/swap re-themes it from the CSS variables; with none present, the command completes with the cascade a no-op.
- Switching redoes the mapping and updates `tools.design`; removing reverts `DESIGN.md` to bespoke tokens and sets `none`.
- `tools.design` in the manifest matches the selection in every path; `021-status`/`021-doctor` reflect it.
- The command renders on all three stacks with identical behavior.
- `npm test` / `npm run lint` pass; no runtime dependency added.

## Out of Scope

- **Generating the prototype** — that is `021-prototype` (§12, spec 012); `021-design` only *re-themes* an existing one.
- **Automating the refinement round** — the change is framed as a living-doc update through the loop (DSS step 5); opening/closing the round stays the existing refinement process.
- **Shipping a component library or rendering UI** — the command lands tokens/mappings, not components; component generation remains `skills/generate-frontend-component.md`.
- **Design-tooling integration** (calling Material Theme Builder, Figma, etc.) — exports are user-supplied and checked in; the framework never calls external design tools.
- **Other mvp-5 commands** — `021-feedback` (spec 010, Done), `021-prototype` (spec 012), review-template wiring — separate specs.

## Dependencies & References

- TDD §11 (Design-System Install Command) and §9.4 (design-system adapter contract).
- [design-system-selection.md](../../workflow/specific-workflows/design-system-selection.md) — the DSS workflow (select/assess/map/cascade/review).
- `templates/DESIGN-Template.md` → `DESIGN.md` — the token frontmatter + "Design System Mapping" section.
- `scripts/init/index.js` — the `tools.design` resolution (`--design` → manifest).
- Spec 006 (renderer) / TDD §9.2 — cross-stack command rendering.
- Spec 009 (`021` CLI dispatcher) — the assistant-agnostic mechanical entry.
- Spec 010 (`021-feedback`) — the LLM-drives-plus-thin-script command pattern this mirrors.
- Spec 012 (`021-prototype`, not yet built) — the cascade re-theme target (optional; conditional no-op).

## Open Questions

*Resolved in the 2026-07-18 clarify session: (1) mechanical split = a thin `scripts/design.js` behind `021 design set <system>` (records `tools.design` without a full init, scaffolds `tokens/`, replaces the mapping section); (2) the `DESIGN.md` mapping section is **replaced** each run behind a stable marker, preserving the bespoke frontmatter block; (3) the cascade **writes the CSS-variables file** and re-points an existing `prototype/`, a no-op when absent — no dependency on spec 012; (4) EDD cascade is an assistant-guided edit; (5) the command edits living docs directly and **surfaces** the refinement round (does not auto-run it); (6) material-3 accepts Material Theme Builder JSON + CSS variables (DSP optional). No open items remain.*
