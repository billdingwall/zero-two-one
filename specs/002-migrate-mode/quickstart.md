# Quickstart / Validation: Migrate-Mode

*Manual validation walkthrough. Each step maps to an acceptance criterion in [spec.md](spec.md) and a fixture in [tasks.md](tasks.md). Run against a throwaway non-empty repo — never a real project.*

## Setup

```sh
WORK=$(mktemp -d); cd "$WORK"; git init -q
# make it look like a real, in-flight project:
mkdir -p src && echo "console.log('app')" > src/index.js
echo "# My Project" > README.md
mkdir -p requirements && echo "# my prd" > requirements/01-PRD.md
```

## Scenarios

### 1. Detected migrate (not scaffold)
```sh
zero-two-one-init --yes
```
Expect: reports **migrate** mode (non-framework content present), and prints detected phase/stack **before** writing.

### 2. Phase inference (strict growth)
- With only `src/` (no tests/CI/tags) ⇒ inferred `mvp` or `planning`, **not** `growth`.
- Add tests + `.github/workflows/ci.yml` + `git tag v1.0.0`, re-run in a fresh dir ⇒ inferred `growth`.
- `--phase planning` overrides either inference.

### 3. Stack detection
- `mkdir .kiro` ⇒ proposes `kiro`. Add `.claude/` too ⇒ conflicting surfaces reported; `--stack claude` resolves.

### 4. Existing doc — leave-alongside (import)
```sh
zero-two-one-init --dup requirements/01-PRD.md=leave --yes
```
Expect: `requirements/01-PRD.md` **byte-unchanged**; a row for it in `requirements/_notes/imported-docs.md`.

### 5. Duplicate — archive
```sh
zero-two-one-init --dup README.md=archive --yes
```
Expect: original README moved to `requirements/_notes/archive/README.md` + a pointer stub left; fresh template instantiated at `README.md`; nothing lost.

### 6. Duplicate — update (wrap)
```sh
zero-two-one-init --dup requirements/01-PRD.md=update --yes
```
Expect: `requirements/01-PRD.md` now has the template structure with the original content under a `## Imported content` section.

### 7. Guiding-doc coexistence
```sh
echo "# my claude" > CLAUDE.md
zero-two-one-init --dup CLAUDE.md=leave --yes
```
Expect: `CLAUDE.md` untouched **and** `CLAUDE.zero-two-one.md` written alongside; both cataloged.

### 8. Spec Kit reuse
```sh
mkdir -p specs/001-x && printf -- "---\nstatus: Approved\n---\n# x" > specs/001-x/spec.md
zero-two-one-init --yes
```
Expect: existing spec detected + frontmatter validated; Spec Kit setup skipped. A spec with a missing `status:` is **reported and skipped**, not modified.

### 9. Non-interactive completeness
Run any of the above with no TTY and no `--dup` ⇒ completes with **zero prompts**, `leave` defaults, exit 0.

### 10. Growth entry
With inferred/`--phase growth` ⇒ `05-ROADMAP.md`/`04-BACKLOG.md` scaffolded in post-transition shape (Releases active, MVP historical).

### 11. Idempotent re-run
Run migrate twice ⇒ the second run reads mode/phase/stack from the manifest, re-prompts nothing, adds no duplicate `imported-docs.md` rows, re-archives nothing.

## Done when
All scenarios pass as an automated `node:test` suite (incl. the **migration acceptance test**: non-empty fixture → zero user-file overwrites), `npm run lint` is green, and no runtime dependency was added.
