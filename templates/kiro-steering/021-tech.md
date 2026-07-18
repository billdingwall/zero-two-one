---
inclusion: always
---

# Zero Two One — Tech Conventions

- Follow the constraints in `CODE.md` and the technical design in `requirements/03-TDD.md`.
- **Do not write feature implementation code unless the feature's spec status is `Approved` or beyond** — the pre-commit gate enforces this. Spec state for this stack lives in `.kiro/specs/<feature>/requirements.md` (`status:` frontmatter).
- Framework-owned names in shared directories use the `021-` prefix; never clobber user files.
- Prefer zero-dependency, standard-library solutions consistent with the existing codebase; match the surrounding code's style and idioms.
- After generating code, run `npm run 021-spec:verify` and follow the verify-spec-compliance skill before marking work complete.
