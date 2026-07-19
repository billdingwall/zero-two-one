#!/usr/bin/env node
'use strict';

/**
 * design.js — the mechanical layer behind `021 design set <system>` (spec 011,
 * TDD §11 / §9.4).
 *
 * Operationalizes the Design-System Selection workflow's deterministic parts:
 * record `tools.design` in the manifest, scaffold `requirements/_design/tokens/`,
 * and regenerate the marker-bounded "Design System Mapping" section of DESIGN.md.
 * The assistant-driven `/021-design` walkthrough does the judgement around it
 * (assess, the actual role→token values, importing the export, EDD annotation,
 * the prototype re-theme).
 *
 * Usage: node scripts/design.js set <system>     # system: none | material-3 | <byo>
 *
 * Node built-ins only (no dependencies).
 */

const fs = require('fs');
const path = require('path');
const lib = require('./speckit/lib.js');
const { loadManifest, writeManifest } = require('./init/manifest.js');

const MARK_START = '<!-- 021-design:mapping start -->';
const MARK_END = '<!-- 021-design:mapping end -->';
const HEADING = '## Design System Mapping';
const TEMPLATE = path.join(__dirname, '..', 'templates', 'DESIGN-Template.md');

/** A minimal bespoke DESIGN.md when neither the project doc nor the template exists. */
const MINIMAL_DESIGN = `---
colors:
  primary: "#000000"
  neutral: "#FFFFFF"
typography:
  fontFamily: "sans-serif"
---

# Design Tokens & System

Core design tokens for the project. Referenced when generating or styling components.
`;

/** The marker-bounded mapping section for a given system (heading included). */
function mappingBlock(system) {
  let body;
  if (system === 'none') {
    body = '## Design System Mapping\n\n*Bespoke project (`design: none`): the frontmatter tokens above are the source of truth — no system mapping.*\n';
  } else if (system === 'material-3') {
    body = [
      '## Design System Mapping',
      '',
      '*Material 3 (`tools.design: material-3`). Roles map to `md.sys.*` tokens; fill the assignments below and reference the Material Theme Builder export in `requirements/_design/tokens/`.*',
      '',
      '| Project role | System token (`md.sys.*`) | Notes |',
      '|---|---|---|',
      '| primary color | `md.sys.color.primary` | |',
      '| surface color | `md.sys.color.surface` | |',
      '| body typography | `md.sys.typescale.body-medium` | |',
      '| shape (md) | `md.sys.shape.corner.medium` | |',
      '| elevation | `md.sys.elevation.level1` | |',
      '| motion | `md.sys.motion.easing.standard` | M3 Expressive implications noted in the EDD |',
      '',
      '**Token artifacts:** Material Theme Builder JSON + CSS variables in `requirements/_design/tokens/`; the prototype consumes the CSS variables.',
    ].join('\n') + '\n';
  } else {
    // bring-your-own — generic project-role rows, no md.sys.* assumptions.
    body = [
      '## Design System Mapping',
      '',
      `*Bring-your-own (\`tools.design: ${system}\`). Map each project role to your system's token and reference the export in \`requirements/_design/tokens/\`.*`,
      '',
      '| Project role | System token | Notes |',
      '|---|---|---|',
      '| primary color | | |',
      '| surface color | | |',
      '| body typography | | |',
      '| spacing (md) | | |',
      '| radius (md) | | |',
      '',
      '**Token artifacts:** exported token files in `requirements/_design/tokens/`; the prototype consumes the CSS variables.',
    ].join('\n') + '\n';
  }
  return `${MARK_START}\n${body}${MARK_END}\n`;
}

/**
 * Replace/append/create the mapping section. Precedence:
 *   1. markers present → replace between them (inclusive).
 *   2. an unmarked "## Design System Mapping" heading (e.g. from the template) →
 *      replace from that heading to the next `## ` (or EOF).
 *   3. neither → append the block after the body.
 * The frontmatter token block is never touched.
 */
function applyMapping(content, block) {
  const s = content.indexOf(MARK_START);
  if (s !== -1) {
    const e = content.indexOf(MARK_END, s);
    if (e !== -1) {
      const after = content.slice(e + MARK_END.length).replace(/^\n/, '');
      return content.slice(0, s) + block + (after ? '\n' + after : '');
    }
  }
  const h = content.indexOf(HEADING);
  if (h !== -1) {
    const next = content.indexOf('\n## ', h + HEADING.length);
    const tail = next !== -1 ? content.slice(next + 1) : '';
    const head = content.slice(0, h).replace(/\n+$/, '\n\n');
    return head + block + (tail ? '\n' + tail : '');
  }
  const base = content.replace(/\n+$/, '');
  return base + '\n\n' + block;
}

function scaffoldTokens(root) {
  const dir = path.join(root, 'requirements', '_design', 'tokens');
  fs.mkdirSync(dir, { recursive: true });
  const index = path.join(dir, '_INDEX.md');
  if (!fs.existsSync(index)) {
    // Link-free by design so check-links stays clean (spec 011 analyze A3).
    fs.writeFileSync(
      index,
      '# Design Tokens\n\nExported design-system token artifacts (e.g. Material Theme Builder JSON / CSS variables) for this project. Referenced from DESIGN.md; the prototype consumes the CSS variables.\n'
    );
  }
}

function readOrCreateDesign(designPath) {
  if (fs.existsSync(designPath)) return fs.readFileSync(designPath, 'utf8');
  // User-owned create-if-missing (spec 011 analyze A2): seed from the template, else minimal.
  if (fs.existsSync(TEMPLATE)) return fs.readFileSync(TEMPLATE, 'utf8');
  return MINIMAL_DESIGN;
}

function usage(stream) {
  stream.write('Usage: 021 design set <system>   # system: none | material-3 | <byo-name>\n');
}

function main(argv) {
  const [verb, system] = argv;
  if (verb !== 'set' || !system) {
    usage(process.stderr);
    return 1;
  }

  const root = lib.repoRoot();

  // 1. Record tools.design (targeted write — no buildManifest rebuild).
  const manifest = loadManifest(root);
  if (!manifest) {
    process.stderr.write('No .zero-two-one.json found — run zero-two-one-init first.\n');
    return 1;
  }
  manifest.tools = manifest.tools || {};
  manifest.tools.design = system;
  manifest.updatedAt = new Date().toISOString();
  writeManifest(root, manifest);

  // 2. Scaffold the tokens dir.
  scaffoldTokens(root);

  // 3. Regenerate the DESIGN.md mapping section.
  const designPath = path.join(root, 'DESIGN.md');
  const next = applyMapping(readOrCreateDesign(designPath), mappingBlock(system));
  fs.writeFileSync(designPath, next);

  // 4. Next steps (the assistant-driven remainder).
  process.stdout.write(`Recorded tools.design = ${system}.\n`);
  process.stdout.write('DESIGN.md "Design System Mapping" section updated; tokens dir: requirements/_design/tokens/\n\n');
  process.stdout.write('Next (assistant-guided):\n');
  if (system !== 'none') {
    process.stdout.write('  - Fill the role → token assignments in the mapping table.\n');
    process.stdout.write('  - Import your token export into requirements/_design/tokens/ and reference it.\n');
    process.stdout.write('  - If a prototype/ exists, re-theme it from the tokens\' CSS variables.\n');
    process.stdout.write('  - Annotate affected scenarios in the EDD.\n');
  }
  process.stdout.write('  - Record this change through a refinement round with a changelog entry.\n');
  return 0;
}

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}

module.exports = { MARK_START, MARK_END, mappingBlock, applyMapping, scaffoldTokens, main };
