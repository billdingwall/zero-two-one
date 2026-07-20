#!/usr/bin/env node
'use strict';

/**
 * prepublish-gate.js — dev-only (spec 014, TDD §14): the pre-publish gate.
 *
 * Fails the build (non-zero, naming the check) before anything reaches npm, on
 * any r7/r9 package-hygiene regression. Tarball-aware: the (c)/(e)/(f) checks
 * read the real `npm pack --json --dry-run` file list from package/, so they
 * catch what would actually ship. Zero dependencies; child_process/fs/path only.
 *
 * Run:   npm run prepublish:check        (CI publish.yml runs this before publish)
 * Never ships — excluded from package/ via sync-to-package.js scriptExclusions.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

/** Dev-only files that must never appear in the tarball (regression guard). */
const DEV_FILE_DENYLIST = new Set([
  'scripts/sync-to-package.js',
  'scripts/check-links.js',
  'scripts/prepublish-gate.js',
  'CONTRIBUTING.md',
  '.editorconfig',
]);

/** The packed file list from `npm pack --json --dry-run` (no tgz written). */
function tarballPaths(packageDir) {
  const r = spawnSync('npm', ['pack', '--json', '--dry-run'], { cwd: packageDir, encoding: 'utf8' });
  if (r.status !== 0) {
    throw new Error(`npm pack failed in ${packageDir}:\n${r.stderr || r.stdout}`);
  }
  const parsed = JSON.parse(r.stdout);
  return (parsed[0].files || []).map((f) => f.path);
}

/** Default link check: run the repo's check-links.js (scans its own repo root). */
function defaultCheckLinks(root) {
  const r = spawnSync('node', [path.join(root, 'scripts', 'check-links.js')], { cwd: root, encoding: 'utf8' });
  return { ok: r.status === 0, detail: (r.stderr || r.stdout || '').trim() };
}

function readJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return null; }
}

/**
 * Run the pre-publish gate. Returns { ok, failures[] }.
 *  root        — repo root (default: this repo). LICENSE + link check read here.
 *  packageDir  — the shippable package/ dir (default: root/package). Tarball read here.
 *  checkLinks  — injectable () => { ok, detail } for testing (analyze A7).
 */
function prepublishGate({
  root = REPO_ROOT,
  packageDir = path.join(root, 'package'),
  checkLinks = () => defaultCheckLinks(root),
} = {}) {
  const failures = [];
  const paths = tarballPaths(packageDir);

  // (a) No dangling `main` — strip a leading `./` before comparing to bare
  //     tarball paths (analyze A2).
  for (const mf of [path.join(root, 'package.json'), path.join(packageDir, 'package.json')]) {
    const m = readJson(mf);
    if (m && typeof m.main === 'string' && m.main) {
      const target = m.main.replace(/^\.\//, '');
      if (!paths.includes(target)) {
        failures.push(`(a) dangling main: "${m.main}" in ${path.relative(root, mf) || mf} is not in the tarball`);
      }
    }
  }

  // (b) LICENSE present at root and in the tarball.
  if (!fs.existsSync(path.join(root, 'LICENSE'))) failures.push('(b) missing LICENSE at repo root');
  if (!paths.includes('LICENSE')) failures.push('(b) LICENSE not in the tarball');

  // (c) No generated `.ai/context` bundle (the empty-scaffold .gitkeep is fine).
  for (const p of paths) {
    if (/^\.ai\/context\/.+/.test(p) && path.basename(p) !== '.gitkeep') {
      failures.push(`(c) .ai/context bundle would ship: ${p}`);
    }
  }

  // (d) No broken Markdown links.
  const links = checkLinks();
  if (!links.ok) failures.push(`(d) broken Markdown links${links.detail ? `: ${links.detail}` : ''}`);

  // (e) No internal spec or dev-only file in the tarball.
  for (const p of paths) {
    if (/^(specs|test|tests)\//.test(p)) {
      failures.push(`(e) internal spec/test would ship: ${p}`);
    } else if (DEV_FILE_DENYLIST.has(p)) {
      failures.push(`(e) dev-only file would ship: ${p}`);
    }
  }

  // (f) Shipped README present and non-trivial (guards the FR-006 split).
  if (!paths.includes('README.md')) {
    failures.push('(f) shipped package/README.md is missing from the tarball');
  } else {
    const size = fs.statSync(path.join(packageDir, 'README.md')).size;
    if (size <= 200) failures.push(`(f) shipped package/README.md is trivial (${size} bytes ≤ 200)`);
  }

  return { ok: failures.length === 0, failures };
}

/** Human report + exit code, for the CLI / npm script. */
function main() {
  let result;
  try {
    result = prepublishGate();
  } catch (err) {
    console.error(`pre-publish gate: ERROR — ${err.message}`);
    process.exit(1);
  }
  console.log('\nPre-publish gate\n');
  if (result.ok) {
    console.log('  ✓ no dangling main');
    console.log('  ✓ LICENSE present');
    console.log('  ✓ no .ai/context bundle in tarball');
    console.log('  ✓ no broken links');
    console.log('  ✓ no spec/dev-file leak in tarball');
    console.log('  ✓ shipped README present and non-trivial');
    console.log('\npre-publish gate: PASS\n');
    process.exit(0);
  }
  for (const f of result.failures) console.error(`  ✗ ${f}`);
  console.error(`\npre-publish gate: FAIL (${result.failures.length})\n`);
  process.exit(1);
}

if (require.main === module) main();

module.exports = { prepublishGate, tarballPaths, DEV_FILE_DENYLIST };
