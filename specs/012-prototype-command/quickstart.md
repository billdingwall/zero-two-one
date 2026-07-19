# Quickstart: Optional Prototype Command (`021-prototype`)

*Manual end-to-end walkthrough validating [spec.md](spec.md) after implementation. Run from a test project (it writes under `prototype/`).*

## 1. Scaffold on a bare project

```bash
npx 021 prototype init
ls prototype/                       # index.html  styles.css  app.js  _INDEX.md
head -3 prototype/styles.css        # theme reference (@import or :root)
```

**Expect:** `prototype/{index.html,styles.css,app.js}` scaffolded; `index.html` links `styles.css`; the command prints next steps (build the real screens from the PRD/EDD). `prototype/` is created if it didn't exist.

## 2. Themed by the design system

```bash
# with a system set + a tokens CSS file present:
npx 021 design set material-3          # (spec 011) records tools.design + tokens dir
# …drop a tokens *.css export into requirements/_design/tokens/…
npx 021 prototype init --force
grep -n '@import' prototype/styles.css   # → imports the tokens CSS

# with design: none:
npx 021 design set none
npx 021 prototype init --force
grep -n ':root' prototype/styles.css     # → inline :root from DESIGN.md frontmatter
```

**Expect:** a system + tokens file → `styles.css` `@import`s it; `none` → inline `:root` block. A later `021-design` swap re-themes the prototype without changing its markup.

## 3. Non-destructive

```bash
npx 021 prototype init                 # over an existing prototype
```

**Expect:** it reports the prototype already exists and exits non-zero **without** overwriting; only `--force` overrides.

## 4. Emergent activation (QA tier)

```bash
npx 021 qa                             # Planning phase
```

**Expect:** with the prototype present, the QA prototype tier reports `PASS: Prototype assets present.` (it gated on `prototype/*.html`); with no prototype it reports the INFO skip. No file other than `prototype/` was touched to make this happen.

## 5. Optional — never a gate

```bash
rm -rf prototype/*.html && npx 021 status && npx 021 qa
```

**Expect:** nothing fails on a missing prototype; `021 status` does not gate Planning on one; the QA tier returns to the INFO skip.

## 6. Dispatch, cross-stack & regression

```bash
npx 021 prototype                       # usage + exit 1 (no leaf)
npx 021 prototype bogus                 # usage + exit 1

t=$(mktemp -d); node bin/init.js "$t" --stack claude >/dev/null
ls "$t/.claude/commands/021-prototype.md"
t=$(mktemp -d); node bin/init.js "$t" --stack antigravity >/dev/null
ls "$t/.agents/skills/021-prototype/SKILL.md"

npm test && npm run lint && node scripts/check-links.js && npm run sync:package -- --check
```

**Expect:** dispatch usage/exit correct; claude gets the command file, antigravity the rendered SKILL (kiro via the `021` agent); full suite green; no new dependency; links clean; `package/**` in sync; `claude-golden.json` unchanged.
