# Quickstart: Design-System Install Command (`021-design`)

*Manual end-to-end walkthrough validating [spec.md](spec.md) after implementation. Run from a test project (or the dogfood repo — note it edits `DESIGN.md` and the manifest).*

## 1. Adopt Material 3

```bash
npx 021 design set material-3
```

**Expect:** the manifest's `tools.design` becomes `material-3` (other fields unchanged); `requirements/_design/tokens/` is created; `DESIGN.md` gains a marker-bounded "Design System Mapping" section with an `md.sys.*` role-row skeleton; the frontmatter token block is untouched. The command prints next steps (fill the mapping, import the export, annotate the EDD, record via a refinement round).

```bash
grep -n '"design"' .zero-two-one.json
grep -n '021-design:mapping' DESIGN.md
ls requirements/_design/tokens/
```

## 2. Import an export & map (assistant-driven)

Drop a Material Theme Builder export (JSON / CSS variables) into `requirements/_design/tokens/`, reference it from `DESIGN.md`, and fill the skeleton's role→token rows. The CSS-variables file is what a prototype would consume.

## 3. Cascade to a prototype (if present)

```bash
ls prototype/ 2>/dev/null && echo "prototype present" || echo "no prototype — cascade is a no-op"
```

**Expect:** with `prototype/` present, its theme is re-pointed at the tokens' CSS variables; with none present, nothing happens (the prototype is optional; `021-design` never generates one).

## 4. Switch systems

```bash
npx 021 design set some-other-system
grep -n '"design"' .zero-two-one.json          # → some-other-system
```

**Expect:** the mapping section is regenerated (replaced within the markers) with the new system's skeleton; `tools.design` updates; a second run is idempotent.

## 5. Remove (revert to bespoke)

```bash
npx 021 design set none
grep -n '"design"' .zero-two-one.json          # → none
```

**Expect:** `tools.design: none`; the mapping region collapses to a one-line bespoke note; the frontmatter tokens remain the source of truth.

## 6. Dispatch, cross-stack & regression

```bash
npx 021 design                                  # usage + exit 1 (no leaf)
npx 021 design bogus                            # usage + exit 1

# cross-stack render
t=$(mktemp -d); node bin/init.js "$t" --stack claude >/dev/null
ls "$t/.claude/commands/021-design.md"
t=$(mktemp -d); node bin/init.js "$t" --stack antigravity >/dev/null
ls "$t/.agents/skills/021-design/SKILL.md"

npm test && npm run lint && node scripts/check-links.js && npm run sync:package -- --check
```

**Expect:** dispatch usage/exit correct; claude gets the command file, antigravity the rendered SKILL (kiro via the `021` agent); full suite green; no new dependency; links clean; `package/**` in sync; `claude-golden.json` unchanged.
