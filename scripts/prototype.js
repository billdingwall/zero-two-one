#!/usr/bin/env node
'use strict';

/**
 * prototype.js — the mechanical layer behind `021 prototype init` (spec 012,
 * TDD §12).
 *
 * Scaffolds the OPT-IN static prototype: a bare themed skeleton under
 * `prototype/` (`index.html`, `styles.css`, `app.js`) that consumes the
 * design-system CSS variables, so a later `021-design` swap re-themes it. The
 * assistant-driven `/021-prototype` walkthrough fleshes out the real screens
 * from the PRD/EDD.
 *
 * The command writes ONLY under `prototype/`; the QA/refinement/design steps
 * activate by presence detection (`prototype/*.html`; `prototype/` > _INDEX.md)
 * — the wire-in is emergent, not a code change (FR-005).
 *
 * Usage: node scripts/prototype.js init [--force]
 *
 * Node built-ins only (no dependencies).
 */

const fs = require('fs');
const path = require('path');
const lib = require('./speckit/lib.js');
const { loadManifest } = require('./init/manifest.js');

const SCREENS_MARK = '<!-- 021-prototype: add screens below -->';

/** Files under prototype/ other than the _INDEX.md scaffold (the presence threshold). */
function existingContent(protoDir) {
  if (!fs.existsSync(protoDir)) return [];
  return fs.readdirSync(protoDir).filter((n) => n !== '_INDEX.md');
}

/** First *.css under requirements/_design/tokens/, or null (spec 011 seam). */
function tokensCssRel(root) {
  const dir = path.join(root, 'requirements', '_design', 'tokens');
  if (!fs.existsSync(dir)) return null;
  const css = fs.readdirSync(dir).filter((n) => n.endsWith('.css')).sort();
  if (!css.length) return null;
  // Prefer a conventional tokens.css when present.
  const pick = css.includes('tokens.css') ? 'tokens.css' : css[0];
  return `requirements/_design/tokens/${pick}`;
}

/**
 * Minimal, best-effort read of a DESIGN.md frontmatter's reliably-flat maps
 * (`colors:` / `spacing:`) into `--<map>-<key>` CSS vars. Key names vary across
 * DESIGN.md versions (`radii:` vs `rounded:`) and `typography:` is nested, so
 * we do NOT hardcode those — the assistant refines the rest (spec 012 A2).
 */
function inlineRootVars(root) {
  const p = path.join(root, 'DESIGN.md');
  const vars = [];
  if (fs.existsSync(p)) {
    const text = fs.readFileSync(p, 'utf8');
    const fm = text.match(/^---\n([\s\S]*?)\n---/);
    if (fm) {
      const lines = fm[1].split('\n');
      let map = null;
      for (const line of lines) {
        const top = line.match(/^([a-z][\w-]*):\s*$/i);
        if (top) {
          map = ['colors', 'spacing'].includes(top[1]) ? top[1] : null;
          continue;
        }
        const kv = line.match(/^\s{2}([\w-]+):\s*"?([^"\n]+?)"?\s*$/);
        if (map && kv) vars.push(`  --${map}-${kv[1]}: ${kv[2]};`);
      }
    }
  }
  const body = vars.length ? vars.join('\n') : '  --color-primary: #000;\n  --color-neutral: #fff;';
  return `:root {\n${body}\n  /* refine these in DESIGN.md; run 021-design to adopt a system */\n}`;
}

/** The theme reference at the top of styles.css (FR-004). */
function themeReference(root) {
  const manifest = loadManifest(root);
  const design = (manifest && manifest.tools && manifest.tools.design) || 'none';
  const rel = design !== 'none' ? tokensCssRel(root) : null;
  if (rel) return `@import '../${rel}';`;
  return inlineRootVars(root);
}

function indexHtml() {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Prototype</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="app-header"><h1>Prototype</h1></header>
  <main class="app-main">
    ${SCREENS_MARK}
    <section class="screen">
      <p>Starter screen — replace with the flows from the PRD/EDD.</p>
      <button class="btn">Primary action</button>
    </section>
  </main>
  <footer class="app-footer"><small>Zero Two One prototype</small></footer>
  <script src="app.js"></script>
</body>
</html>
`;
}

function stylesCss(themeRef) {
  return `${themeRef}

/* Base component styles consume the design-system variables so 021-design
   re-themes this prototype without touching the markup. */
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: var(--typography-fontFamily, system-ui, sans-serif);
  color: var(--colors-primary, #111);
  background: var(--colors-neutral, #fff);
}
.app-header, .app-footer { padding: var(--spacing-md, 16px); }
.app-main { padding: var(--spacing-lg, 24px); }
.screen { margin-block: var(--spacing-md, 16px); }
.btn {
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  border: 0;
  border-radius: 8px;
  background: var(--colors-primary, #111);
  color: var(--colors-neutral, #fff);
  cursor: pointer;
}
`;
}

function appJs() {
  return `'use strict';
// Minimal prototype script — the assistant wires up the real interactions.
document.addEventListener('DOMContentLoaded', () => {
  console.log('Prototype loaded.');
});
`;
}

const INDEX_MD = `# Prototype Overview

One cohesive prototype that aligns with the PRD and EDD. Static HTML/CSS/JS; themed by the design system (021-design) via CSS variables.

## Manifest

- \`index.html\`, \`styles.css\`, \`app.js\` — the prototype (scaffolded by \`021 prototype init\`).
`;

function usage(stream) {
  stream.write('Usage: 021 prototype init [--force]\n');
}

function main(argv) {
  const [verb, ...flags] = argv;
  if (verb !== 'init') {
    usage(process.stderr);
    return 1;
  }
  const force = flags.includes('--force');

  const root = lib.repoRoot();
  const proto = path.join(root, 'prototype');

  const content = existingContent(proto);
  if (content.length && !force) {
    process.stderr.write(
      `prototype/ already holds content (${content.join(', ')}). Re-run with --force to overwrite the starter.\n`
    );
    return 1;
  }

  fs.mkdirSync(proto, { recursive: true });
  const indexMd = path.join(proto, '_INDEX.md');
  if (!fs.existsSync(indexMd)) fs.writeFileSync(indexMd, INDEX_MD);

  const themeRef = themeReference(root);
  fs.writeFileSync(path.join(proto, 'index.html'), indexHtml());
  fs.writeFileSync(path.join(proto, 'styles.css'), stylesCss(themeRef));
  fs.writeFileSync(path.join(proto, 'app.js'), appJs());

  process.stdout.write('Scaffolded prototype/ (index.html, styles.css, app.js).\n');
  process.stdout.write(
    themeRef.startsWith('@import')
      ? 'Themed from the design-system tokens (021-design).\n'
      : 'Themed from DESIGN.md tokens inline — run 021-design to adopt a system.\n'
  );
  process.stdout.write('\nNext (assistant-guided): build the real screens/flows from the PRD/EDD, consuming the design-system CSS variables.\n');
  return 0;
}

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}

module.exports = { existingContent, tokensCssRel, inlineRootVars, themeReference, main, SCREENS_MARK };
