# Contributing to Zero Two One

Zero Two One dogfoods its own framework: the root repository is governed by the
same rules it ships. Contributions follow one of two tracks.

## 1. Project-level changes (docs, workflows, structure)

Changes to requirements, workflows, templates, or process go through the
**Refinement Loop** ([`workflow/specific-workflows/refinement-loop.md`](workflow/specific-workflows/refinement-loop.md)):

1. **Review** — capture feedback in `requirements/_refinement/r{n}-review.md` (use the
   stage-matched template from `templates/reviews/`, picked by the current phase).
2. **Synthesize** — draft `r{n}-update-{doc}.md` plans; a human approves them
   before any living doc is edited.
3. **Apply & cascade** — edit the key docs in dependency order (PRD → EDD → TDD →
   Backlog → Roadmap), logging each in the doc's Changelog.
4. **Constraint check** — amend `CODE.md` if core principles changed.
5. **Commit** — all affected docs together; run `npm run sync:package` so
   `package/` stays current.

## 2. Feature-level changes (implementation code)

Code flows through **Spec-Driven Delivery** and the **refinement gate**:

- Work on an `NNN-feature-name` branch matching a `specs/NNN-feature-name/` spec.
- The `hooks/pre-commit` gate **blocks implementation commits** until the spec is
  `Approved` or `Ready for Dev` (`npm run 021-spec:status -- set <spec> Approved`).
- Emergency bypass (hotfixes only): `ZTO_SKIP_GATE=1 git commit ...`.

## Local checks (zero dependencies)

Run before pushing — CI ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs the same:

```
npm run lint          # node --check + sh -n over the tooling
npm test              # spec list + lifecycle status smoke
npm run check:links   # relative Markdown links resolve
npm run 021-qa        # phase-appropriate QA suite
npm run sync:package -- --check   # package/ matches root
```

## Reporting issues

Use the templates in [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/)
(`bug_report.md`, `feature_prd.md`). In-product feedback via `021-feedback`
lands in mvp-5.

## Boundary reminder

Develop in the **root**. `package/` is a generated snapshot — never edit it by
hand; change the root and run `npm run sync:package`.
