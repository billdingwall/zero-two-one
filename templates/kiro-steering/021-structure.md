---
inclusion: always
---

# Zero Two One — Workflow & Structure

- **Feature lifecycle (Spec Kit):** specify → clarify → plan → tasks → analyze → implement, with a status gate before implementation.
- **Spec state for this stack** lives in `.kiro/specs/<feature>/{requirements,design,tasks}.md`; `status:` in `requirements.md` frontmatter gates implementation, and `tasks.md` checkboxes track progress.
- Run `npm run 021-spec:context -- <feature>` before implementing; `npm run 021-spec:verify -- <feature>` before marking work complete.
- **Two workflows:** project-level changes go through the refinement loop in `requirements/`; feature-level implementation uses the Spec Kit workflow above.
- See `workflow/workflows.md` for the canonical process (Discovery, Design, Refinement, Implementation, QA, Release).
