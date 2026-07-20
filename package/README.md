# Zero Two One

**An agentic product framework that takes new products from point 0 (idea) to point 1 (MVP) — and helps them grow and stabilize from there.**

Zero Two One turns any repository into a structured, agent-operable product workspace: living requirements documents, a project-level refinement loop, feature delivery through [GitHub Spec Kit](https://github.com/github/spec-kit), and a git `pre-commit` **refinement gate** that blocks implementation code until a feature's spec is human-approved. It renders per-stack surfaces for **Claude Code**, **Google Antigravity**, and **Kiro** from one tool-neutral core.

## Prerequisites

| Dependency | Version | Why |
|---|---|---|
| Node.js | ≥ 18 | All lifecycle scripts — **zero runtime dependencies** |
| Git | ≥ 2.30 | Branch↔spec mapping, the pre-commit gate |
| An AI assistant | — | Claude Code (default), Google Antigravity, or Kiro |
| [Spec Kit](https://github.com/github/spec-kit) (optional) | — | `/speckit-*` feature-delivery commands (Phase 1+) |

## Install

Init is **assistant-led** — the recommended path is to ask your assistant to run it and walk you through the setup. Or run the engine directly:

```sh
npx zero-two-one-init --dry-run     # print the classified action plan; write nothing
npx zero-two-one-init               # scaffold (fresh repo) or migrate (existing repo)
```

Useful flags:

```
--stack claude|antigravity|kiro    # tool stack (default: claude)
--design none|material-3|<system>  # design system (default: none)
--phase planning|mvp|growth        # lifecycle phase (scaffold default: planning)
--upgrade                          # refresh unmodified framework files; report conflicts
--force <path>                     # overwrite a user-owned file (repeatable; the only override)
--yes                              # accept inferred defaults (migrate)
```

Init is **non-destructive**: user-owned docs are create-if-missing, framework files are refreshed only when unmodified (hand-edits become reported conflicts), and an existing `pre-commit` hook is *chained*, never clobbered. Run `--dry-run` first on a working repo.

## Lifecycle commands

Once installed, the assistant-agnostic `021` CLI drives the lifecycle:

```sh
npx 021 status      # current lifecycle phase & health (manifest-first)
npx 021 qa          # run the phase-appropriate QA suite
npx 021 doctor      # workflow drift report
npx 021 spec …      # spec status / context / verify (Spec Kit delivery)
```

Stack-rendered commands (`/021-init`, `/021-status`, `/021-feedback`, `/021-design`, `/021-prototype`) are surfaced through your assistant — as slash commands on Claude Code, skills on Antigravity, and steering + the `021` agent on Kiro.

## The 3-phase lifecycle

**Planning → MVP Build → Growth.** Living requirements docs (`requirements/`) evolve through a refinement loop; features are delivered as specs through Spec Kit behind the refinement gate; QA is phase-appropriate. The `.zero-two-one.json` manifest records your phase, stack, and file inventory.

## Learn more

- **Getting-started guides** (per stack) and the full feature glossary ship in the repository under `getting-started/`.
- Source, issues, and contribution guide: <https://github.com/billdingwall/zero-two-one>
- File feedback from your installed project with `npx 021 feedback "…"`.

## License

MIT — see [LICENSE](LICENSE).
