#!/usr/bin/env node
'use strict';

/**
 * check-links.js — dev-only (r7): validate relative Markdown links across the
 * repo. Zero dependencies; used by CI (.github/workflows/ci.yml).
 *
 * Checks every `[text](target)` in tracked *.md files where target is a
 * relative path. External (http/https/mailto), pure-anchor (#...), and
 * absolute links are skipped. Anchors on relative links are stripped —
 * existence of the file is what's verified.
 *
 * Skipped trees: node_modules/, .git/, package/ (generated snapshot — root is
 * the source of truth and the sync drift check covers it), templates/
 * (template links are relative to where init INSTANTIATES them, not where
 * they live in-source, so they cannot resolve here by design), .ai/
 * (gitignored Speckit context bundles — generated on demand, absent in CI,
 * with links relative to the source spec dir, not the bundle location).
 * Skipped targets: paths containing `<` (placeholder convention, e.g.
 * `_releases/v1.x-<theme>.md`).
 *
 * Exit code 1 when any broken link is found.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', 'package', 'templates', '.ai']);

function mdFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) mdFiles(full, out);
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

const LINK_RE = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

const broken = [];
for (const file of mdFiles(rootDir)) {
  const text = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = LINK_RE.exec(text)) !== null) {
    const target = m[1];
    if (/^(https?:|mailto:|#|file:|\/)/.test(target)) continue;
    if (target.includes('<')) continue; // placeholder paths like v1.x-<theme>.md
    const cleaned = decodeURI(target.split('#')[0]);
    if (!cleaned) continue;
    const resolved = path.resolve(path.dirname(file), cleaned);
    if (!fs.existsSync(resolved)) {
      broken.push(`${path.relative(rootDir, file)} → ${target}`);
    }
  }
}

if (broken.length) {
  console.error(`❌ ${broken.length} broken relative link(s):`);
  for (const b of broken) console.error(`  - ${b}`);
  process.exit(1);
}
console.log('✅ All relative Markdown links resolve.');
