'use strict';

/**
 * renderer.test.js — entrypoint renderer + per-stack install (spec 006).
 * renderEntrypoint identity + preamble preservation (T011); and real installs
 * from the repo root: claude golden bytes (T004), antigravity entrypoint-only
 * (T005), neutral-core invariant (T006), --upgrade honors the recorded stack
 * (T009).
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const { initFramework } = require('../../scripts/init');
const { loadManifest } = require('../../scripts/init/manifest');
const { renderEntrypoint, LOCAL_START, LOCAL_END } = require('../../scripts/init/render');

const REPO_ROOT = path.join(__dirname, '..', '..');
const GOLDEN = require('./fixtures/claude-golden.json');

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'zto-r6-'));
}
function sha256(abs) {
  return crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex');
}
function install(target, stack, opts = {}) {
  return initFramework(target, { sourceDir: REPO_ROOT, quiet: true, yes: true, stack, ...opts });
}
/** path→sha256 for every file under dir, minus excluded predicates. */
function snapshot(dir, exclude) {
  const out = {};
  (function walk(rel) {
    for (const e of fs.readdirSync(path.join(dir, rel || '.'), { withFileTypes: true })) {
      const childRel = (rel ? rel + '/' : '') + e.name;
      if (exclude(childRel, e)) continue;
      if (e.isDirectory()) walk(childRel);
      else out[childRel] = sha256(path.join(dir, childRel));
    }
  })('');
  return out;
}

// --- renderEntrypoint unit + T011 preamble preservation ---------------------
test('renderEntrypoint: claude render is identity of the neutral source', () => {
  const tplDir = tmp();
  const tpl = path.join(tplDir, 'ASSISTANT-Template.md');
  fs.writeFileSync(tpl, '# AI Assistant\nneutral body\n');
  assert.equal(renderEntrypoint(tpl, 'claude'), '# AI Assistant\nneutral body\n');
  assert.equal(renderEntrypoint(tpl, 'antigravity'), '# AI Assistant\nneutral body\n', 'no stack tokens in 006');
});

test('T011 renderEntrypoint preserves a marked local section across a re-render', () => {
  const tplDir = tmp();
  const tpl = path.join(tplDir, 'ASSISTANT-Template.md');
  fs.writeFileSync(tpl, '# Header\nbody\n');
  const existing = `# old\n${LOCAL_START}\nMY DOGFOOD PREAMBLE\n${LOCAL_END}\n`;

  const out = renderEntrypoint(tpl, 'claude', { existing });
  assert.match(out, /MY DOGFOOD PREAMBLE/, 'local section carried through');
  assert.ok(out.includes(LOCAL_START) && out.includes(LOCAL_END), 'markers preserved');
  assert.match(out, /^# Header/, 'rendered body kept');

  // no local section in existing → pure identity
  assert.equal(renderEntrypoint(tpl, 'claude', { existing: '# just a file\n' }), '# Header\nbody\n');
});

// --- T004 · claude byte-identical to the golden fixture ---------------------
test('T004 claude install reproduces the golden bytes (FR-010)', () => {
  const target = tmp();
  assert.equal(install(target, 'claude'), 0);
  for (const [rel, hash] of Object.entries(GOLDEN)) {
    if (rel.startsWith('_')) continue; // skip the _note field
    assert.ok(fs.existsSync(path.join(target, rel)), `expected ${rel}`);
    assert.equal(sha256(path.join(target, rel)), hash, `${rel} byte-identical to pre-006 output`);
  }
});

// --- T005 · antigravity entrypoint only -------------------------------------
test('T005 antigravity renders AGENTS.md and no claude surface', () => {
  const target = tmp();
  assert.equal(install(target, 'antigravity'), 0);
  assert.ok(fs.existsSync(path.join(target, 'AGENTS.md')), 'AGENTS.md rendered');
  assert.ok(!fs.existsSync(path.join(target, 'CLAUDE.md')), 'no CLAUDE.md');
  assert.ok(!fs.existsSync(path.join(target, '.claude')), 'no .claude/ surface');
  // AGENTS.md is the identity render of the neutral source
  assert.equal(
    fs.readFileSync(path.join(target, 'AGENTS.md'), 'utf8'),
    fs.readFileSync(path.join(REPO_ROOT, 'templates', 'ASSISTANT-Template.md'), 'utf8')
  );
  assert.equal(loadManifest(target).tools.stack, 'antigravity');
});

// --- T006 · neutral-core invariant ------------------------------------------
test('T006 neutral core is byte-identical across stacks; only Layer-2 differs', () => {
  const cl = tmp();
  const ag = tmp();
  install(cl, 'claude');
  install(ag, 'antigravity');

  // Exclude Layer-2 (entrypoints + .claude/.agents surfaces) and the non-content
  // carve-outs from the byte-identical assertion: the manifest + empty
  // .ai/context (analyze A1), and the MERGED files (.gitignore, package.json)
  // which carry target-specific identity like the project name (analyze A7).
  // The .agents/ skills surface is antigravity's Layer-2 (spec 007).
  const isLayer2OrCarveOut = (rel) =>
    rel === 'CLAUDE.md' ||
    rel === 'AGENTS.md' ||
    rel === '.claude' ||
    rel.startsWith('.claude/') ||
    rel === '.agents' ||
    rel.startsWith('.agents/') ||
    rel === '.zero-two-one.json' ||
    rel === '.ai' ||
    rel.startsWith('.ai/') ||
    rel === 'package.json' ||
    rel === '.gitignore' ||
    rel === '.git' ||
    rel.startsWith('.git/');

  const snapCl = snapshot(cl, (rel) => isLayer2OrCarveOut(rel));
  const snapAg = snapshot(ag, (rel) => isLayer2OrCarveOut(rel));
  assert.deepEqual(
    Object.keys(snapAg).sort(),
    Object.keys(snapCl).sort(),
    'Layer-1 path sets match across stacks'
  );
  assert.deepEqual(snapAg, snapCl, 'every Layer-1 content path is byte-identical across stacks');
  assert.ok(Object.keys(snapCl).length > 5, 'sanity: Layer-1 is non-trivial');
});

// --- T009 · --upgrade honors the recorded stack -----------------------------
test('T009 --upgrade on an antigravity manifest never introduces claude surface', () => {
  const target = tmp();
  install(target, 'antigravity');
  // upgrade WITHOUT re-passing --stack: the recorded stack must win
  assert.equal(install(target, undefined, { upgrade: true }), 0);
  assert.ok(fs.existsSync(path.join(target, 'AGENTS.md')), 'AGENTS.md still present');
  assert.ok(!fs.existsSync(path.join(target, 'CLAUDE.md')), 'upgrade added no CLAUDE.md');
  assert.ok(!fs.existsSync(path.join(target, '.claude')), 'upgrade added no .claude/ surface');
  assert.equal(loadManifest(target).tools.stack, 'antigravity');
});
