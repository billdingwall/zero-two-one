# Coding Standards

## 1. Spec-Driven First
- **No code without an approved spec.** The pre-commit hook enforces this.
- If a requirement is ambiguous, update the spec in `specs/NNN-feature-name/spec.md` or ask the user. Do not invent requirements in code.

## 2. Modularity & Clarity
- Explain the "why" in comments, not the "what".
- Prefer clarity over cleverness.
- Do not edit build artifacts or generated bundles directly.

## 3. Refinement Loop
- Before implementing major architectural changes, discuss them in the refinement loop via `requirements/_refinement/`.
