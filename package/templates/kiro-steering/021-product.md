---
inclusion: always
---

# Zero Two One — Product & Lifecycle

This project uses the Zero Two One agentic product framework. Work proceeds through a 3-phase lifecycle: **Planning → MVP Build → Growth**.

- The product definition lives in `PRODUCT.md` and `requirements/` (PRD, EDD, TDD, Roadmap, Backlog) — read them for *what* this project is and *why*.
- Check the current phase with `npm run 021-status`, or read `.zero-two-one.json` (the manifest records the lifecycle phase and tool stack) instead of inferring from directory contents.
- Project-level changes go through the refinement loop in `requirements/`; feature work uses the Spec Kit workflow under `.kiro/specs/`.
- Do not assume domain specifics — adapt to the project as defined in the key documents.
