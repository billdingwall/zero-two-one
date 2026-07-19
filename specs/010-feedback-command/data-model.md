# Data Model: Feedback Command (`021-feedback`)

*The concrete shapes behind [spec.md](spec.md)'s Key Entities, plus the dispatcher route, the issue-form fields, and the file inventory with ownership. No persistent store — everything is assembled per-invocation from the manifest and git, then handed to a transport.*

## Entities

### FeedbackPayload
The transport-independent content, filed identically by either path.

| Field | Type | Source | Notes |
|---|---|---|---|
| `title` | string | user (via the walkthrough) | issue title; the only required input |
| `body` | string | user + assembled | user detail, then `contextBlock`, then `repoLink` line |
| `repoLink` | string \| null | `git remote get-url origin` | omitted (with a note) when there is no `origin` (FR-002) |
| `contextBlock` | ManifestContextBlock | manifest | auto-attached (FR-002/003) |

### ManifestContextBlock
The high-value triage field, attached automatically (FR-003).

| Field | Type | Source | Absent-manifest |
|---|---|---|---|
| `version` | string | `readManifest(root).version` | — |
| `stack` | string | `manifestFacts(root).stack` | — |
| `phase` | string | `manifestFacts(root).phase` | — |
| `absent` | boolean | derived | `true` + explicit "manifest not found" marker when `.zero-two-one.json` is missing; the block degrades, the command does not abort (Scenario 4) |

> **Seam note.** `manifestFacts()` returns `stack`/`phase`/`ssd`/`mode` but **not `version`** (`scripts/speckit/lib.js:206`). `version` is read directly via the already-exported `readManifest()` — see [research.md](research.md) R1. Rendered as a fenced Markdown block so it survives both `gh --body` and URL query encoding.

### Transport
Chosen per-invocation; reported before any action (FR-004/006).

| Value | Chosen when | Action |
|---|---|---|
| `gh` | `gh` on PATH **and** `gh auth status` exit 0 | dry: print the exact `gh issue create --repo billdingwall/zero-two-one …`; `--submit`: run it (auth on GitHub's side) |
| `url` | otherwise (no `gh`, or present-but-unauthed) | print a pre-filled `https://github.com/billdingwall/zero-two-one/issues/new?title=…&body=…`; the user submits in the browser |

- `REPO = 'billdingwall/zero-two-one'` — module constant, never a parameter (FR-007).
- Never emits a `gh` invocation that would fail on auth (the `auth status` gate).

## Dispatcher route (`bin/021.js`, spec 009)

One added `resolve()` row — no logic in the dispatcher:

| Subcommand | Runner | File | Rest |
|---|---|---|---|
| `feedback` | `node` | `scripts/feedback.js` | pass-through (`"<title>" --body <text> [--submit]`) |

Plus a `feedback   file a feedback issue to the framework repo` line in `USAGE`.

## `scripts/feedback.js` — argument surface

| Arg | Meaning |
|---|---|
| `<title>` (positional) | issue title (required; usage + exit 1 if absent) |
| `--body <text>` | issue detail body (optional) |
| `--submit` | on the `gh` transport, actually run `gh issue create`; **default (absent) is dry** — assemble + print only, never post (FR-006) |

**Exit codes:** `0` success (dry render, or a successful `--submit`); `1` usage error / assembly failure; `gh issue create`'s own status propagated on `--submit`.

## Issue form — `.github/ISSUE_TEMPLATE/021-feedback.yml` (FR-008)

GitHub issue-form schema (the first `.yml` form alongside the existing `.md` templates):

| Element | Purpose |
|---|---|
| `name` / `description` | "021 Feedback" — framework feedback from an installed repo |
| `title:` prefix | e.g. `[feedback] ` — groups issues for triage |
| `labels: [feedback]` | default label so refinement rounds can filter |
| `body:` — feedback textarea | the user's report (required) |
| `body:` — context textarea | the auto-attached `version`/`stack`/`phase` (+ repo link) block |

> The URL fallback pre-fills plain `?title=&body=` (reliable across GitHub), not the form's field-id params; the form primarily shapes web-initiated reports and applies the label/prefix. See [research.md](research.md) R3.

## File inventory & ownership

| File | Kind | Ownership (TDD §6) | Manifest-tracked |
|---|---|---|---|
| `scripts/feedback.js` | new script | framework-owned | yes |
| `.claude/commands/021-feedback.md` | new command surface (claude) | framework-owned Layer-2 | yes |
| `.agents/skills/021-feedback/SKILL.md` | rendered surface (antigravity) | framework-owned Layer-2 (rendered) | yes (antigravity installs only) |
| `.github/ISSUE_TEMPLATE/021-feedback.yml` | new issue form | framework-owned | yes |
| `bin/021.js` | +1 route, +1 usage line | framework-owned | (bin/ excluded from install surface) |
| `scripts/_INDEX.md`, `.github/ISSUE_TEMPLATE/_INDEX.md` | index updates | framework-owned | yes |

The three new content files sync into `package/**` (`npm run sync:package -- --check` green).
