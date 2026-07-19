---
status: Done
feature: Feedback Command (021-feedback)
release: mvp-5
branch: 010-feedback-command
created: 2026-07-18
---

# Feature Spec: Feedback Command (`021-feedback`)

*The first feature of [mvp-5 — Lifecycle Commands](../../requirements/_releases/mvp-5.md), the release that ships the assistant-driven lifecycle commands riding on the per-stack rendering from mvp-4. This command lets a user file feedback from their own installed repo straight into the framework's GitHub issues, carrying manifest context automatically. Grounded in TDD §10 (Feedback Command) and the command-design layering (`requirements/_design/command-design.md`).*

## Why

The framework's whole growth loop depends on feedback flowing back from real installs into refinement rounds (EDD feedback loop; Growth reviews promote issues to releases). Today there is no in-repo path: a user who hits friction has to leave their editor, find the repo, and hand-write an issue with none of the context that makes triage cheap. `021-feedback` closes that gap — one assistant command that files a well-shaped issue including the single most useful triage field (the install's framework `version` / `stack` / `phase`), attached automatically from the manifest. It keeps the zero-runtime-dependency and no-token promises: transport is either the user's own `gh` CLI or a pre-filled GitHub URL they open themselves, so the framework never touches auth.

## Users & Context

- **Primary user:** a developer with the framework installed in their repo who wants to report a bug, request a feature, or leave a note — without breaking flow.
- **Trigger:** the user invokes the stack-rendered command (`/021-feedback` on `claude`; the `021-feedback` skill on `antigravity`; steering + the `021` agent on `kiro` — TDD §9.2). The assistant drives; the mechanical layer resolves transport and shapes the payload.
- **Builds on:** the manifest reader (`.zero-two-one.json`, TDD §7 / spec 003 `lib.js`) for the context block; the `021` CLI dispatcher (spec 009) as the assistant-agnostic surface; the stack renderer (spec 006) for producing the command on each stack.
- **Destination:** issues in `billdingwall/zero-two-one` — a **build-time constant** baked into the command template, never user-supplied at call time.

## Clarifications

### Session 2026-07-18

- **Q: `gh`-present vs. fallback — who decides?**
  A: **`gh` on PATH *and* authenticated.** Use the `gh` transport only when the binary is on PATH **and** `gh auth status` succeeds; otherwise emit the pre-filled URL. This never produces a `gh` invocation that will fail on auth. The assistant reports which transport it took before acting.
- **Q: Does the command run `gh` itself, or hand off?**
  A: **Confirm-then-run.** On the `gh` path, the assistant shows the full title/body/context block and, on **explicit user confirmation**, runs `gh issue create` (ask-don't-assume, EDD §4). Without `gh`, it prints/opens the pre-filled URL for the user to submit. No issue is filed without user action, and framework code issues no HTTP of its own.
- **Q: What is in the auto-attached context block, and how is the repo link resolved?**
  A: **`version` / `stack` / `phase` + `origin` link.** The block carries the three manifest fields plus a link to the user's repo resolved from the `origin` remote **when available**; when there is no `origin`, the link is omitted with a short note. Nothing else is scraped from the environment.

## User Scenarios (Acceptance)

1. **`gh` available** — *Given* `gh` is on PATH and authenticated, *when* the user invokes `021-feedback` with feedback text, *then* the command produces a ready `gh issue create --repo billdingwall/zero-two-one` invocation (title + body incl. the manifest context block + repo link) and files it on user confirmation. No token is handled by the framework.
2. **`gh` absent** — *Given* `gh` is not installed or not authenticated, *when* the user invokes the command, *then* it produces a pre-filled GitHub new-issue URL (`.../issues/new?title=…&body=…`, query-param template) for the user to open — the same payload, different transport.
3. **Manifest context attached** — *Given* a `.zero-two-one.json` at the repo root, *when* feedback is filed by either transport, *then* the issue body includes a context block with the framework `version`, `stack`, and `phase` read from the manifest, not inferred.
4. **No manifest** — *Given* no manifest is present, *when* the command runs, *then* it still files feedback with the context block noting the manifest is absent (graceful degradation), rather than failing.
5. **Repo slug is fixed** — *Given* any invocation, *when* the destination is resolved, *then* it is always `billdingwall/zero-two-one` from the build-time constant; the command never targets a user-supplied repo.
6. **Issue shaping** — *Given* the framework ships `.github/ISSUE_TEMPLATE/021-feedback.yml`, *when* an issue arrives via the `gh`/URL path, *then* it lands in a shape that supports backlog triage (feedback category + the context fields).
7. **Cross-stack render** — *Given* a non-`claude` stack, *when* the framework is installed, *then* the feedback capability is reachable in that stack with **identical payload behavior**, because all stacks call the same `021 feedback` CLI (TDD §9.2). On **antigravity** the command renders to `.agents/skills/021-feedback/SKILL.md`; on **kiro** it is reached through the `021` agent's CLI wrapper — the same way existing `021-init`/`021-status` reach kiro (kiro renders no per-command skill for lifecycle commands) *(analyze A1)*.

## Functional Requirements

- **FR-001 — Stack-rendered command surface.** `021-feedback` is produced on each stack by the spec 006 renderer from a single neutral source: `/021-feedback` (claude), the `021-feedback` skill (antigravity), steering + agent (kiro). Payload and transport logic are identical across renderings.
- **FR-002 — Payload assembly.** The command assembles an issue payload of: user-supplied feedback text (title + body), a link to the user's repo resolved from the `origin` remote **when available** (omitted with a short note when there is no `origin`), and an auto-attached **manifest context block** (`version`, `stack`, `phase`) *(clarified 2026-07-18)*.
- **FR-003 — Manifest context (auto).** The context block is read from `.zero-two-one.json` via the existing manifest reader (spec 003 `lib.js`); it is never scraped from the environment or inferred. When the manifest is absent, the block records that explicitly rather than aborting.
- **FR-004 — Transport selection: `gh` on PATH *and* authenticated.** The `gh` transport is chosen only when the `gh` binary is on PATH **and** `gh auth status` succeeds; otherwise the command uses the URL fallback (FR-005). This never emits a `gh` invocation that would fail on auth *(clarified 2026-07-18)*. When chosen, transport is `gh issue create --repo billdingwall/zero-two-one …`; the framework issues no HTTP itself and auth stays entirely on GitHub's side.
- **FR-005 — Transport: pre-filled URL fallback.** When the `gh` transport is not selected, the command emits a pre-filled `https://github.com/billdingwall/zero-two-one/issues/new?…` URL carrying the same title/body via query params, for the user to open.
- **FR-006 — Confirm-then-run; no autonomous posting.** The command never files an issue without user action. On the `gh` path it presents the full payload and runs `gh issue create` **only on explicit user confirmation** (ask-don't-assume, EDD §4); on the URL path the user submits via the browser. It reports which transport it will use before acting.
- **FR-007 — Fixed destination.** The destination repo slug `billdingwall/zero-two-one` is a build-time constant in the command template — never a runtime parameter.
- **FR-008 — Issue template.** Ship `.github/ISSUE_TEMPLATE/021-feedback.yml` shaping feedback issues for backlog triage (category + context fields), so `gh`/URL submissions land ready for refinement-round pickup.
- **FR-009 — Zero runtime dependencies.** Transport detection and payload/URL assembly use built-ins only (`child_process` for `gh` detection, `fs`/`path`, URL encoding) — no HTTP client, no GitHub SDK, no token storage.

## Key Entities

- **FeedbackPayload** — `{ title, body, repoLink, contextBlock }`; the transport-independent content filed either way.
- **ManifestContextBlock** — `{ version, stack, phase }` from `.zero-two-one.json` (or an explicit "manifest absent" marker); the high-value triage field attached automatically.
- **Transport** — `gh | url`; chosen by `gh` availability + auth, reported before use.
- **021-feedback.yml** — the GitHub issue-form template that receives and shapes submissions.

## Acceptance Criteria

- With `gh` present+authed, the command yields a valid `gh issue create --repo billdingwall/zero-two-one` invocation whose body contains the manifest `version`/`stack`/`phase`; filing succeeds on confirmation.
- Without `gh`, the command yields a well-formed pre-filled issue URL with the same title/body; opening it lands on GitHub's new-issue form pre-populated.
- The context block matches the manifest values (asserted on a fixture manifest); absent-manifest case degrades gracefully with an explicit marker.
- The destination is `billdingwall/zero-two-one` in every path; no user-supplied repo can be targeted.
- `.github/ISSUE_TEMPLATE/021-feedback.yml` exists and validates as a GitHub issue form.
- The command renders on all three stacks with identical payload behavior.
- No autonomous network post occurs; the chosen transport is reported before action.
- `npm test` / `npm run lint` pass; no runtime dependency added.

## Out of Scope

- **Reading or triaging issues** back into the backlog — feedback pickup into refinement rounds is a human/Growth-review activity (EDD), not this command.
- **Authentication / token handling** — auth stays entirely on GitHub's side via `gh` or the browser; the framework never stores or transmits credentials.
- **Other framework commands** in mvp-5 (`021-design` §11, `021-prototype` §12, review-template wiring) — separate specs in this release.
- **Telemetry / analytics** — no usage data is collected; feedback is explicit and user-initiated only.

## Dependencies & References

- TDD §10 (Feedback Command) — payload, transport, repo-slug constant, issue template.
- Spec 003 (`lib.js` manifest reader) — the `version`/`stack`/`phase` source.
- Spec 006 (source-layer renderer) / TDD §9.2 — cross-stack command rendering.
- Spec 009 (`021` CLI dispatcher) — the assistant-agnostic command surface.
- `requirements/_design/command-design.md` — the CLI / skills / scripts layering.
- EDD §4 (ask-don't-assume interaction pattern).

## Open Questions

*Resolved in the 2026-07-18 clarify session: transport selection gates on `gh` being on PATH **and** `gh auth status` succeeding (else URL fallback); the `gh` path is **confirm-then-run** (assistant files the issue only on explicit confirmation); the context block carries manifest `version`/`stack`/`phase` plus an `origin`-derived repo link (omitted with a note when no `origin`). No open items remain.*
