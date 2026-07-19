'use strict';

/**
 * design.test.js — Design-System Install Command (spec 011, `021-design`).
 *
 * Unit/subprocess: manifest write byte-stability (T003), tokens scaffold (T004),
 * mapping section replace/append/create (T005), none collapse (T006), BYO
 * skeleton (T007), dispatch route + dual usage (T008), cross-stack render (T009).
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..', '..');
const DESIGN = path.join(REPO_ROOT, 'scripts', 'design.js');
const BIN_021 = path.join(REPO_ROOT, 'bin', '021.js');
const { applyMapping, mappingBlock, MARK_START, MARK_END } = require('../../scripts/design.js');
const { initFramework } = require('../../scripts/init');
const { loadManifest } = require('../../scripts/init/manifest');

function tmp(pfx = 'zto-dz-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), pfx));
}

const FULL_MANIFEST = {
  version: '1.2.3',
  installedAt: '2026-01-01',
  updatedAt: '2026-01-02T00:00:00.000Z',
  mode: 'source',
  phase: 'mvp',
  tools: { stack: 'claude', assistant: 'claude-code', ssd: 'github-speckit', design: 'none' },
  files: { 'a.md': 'deadbeef' },
  merged: { 'package.json': ['scripts.x'] },
  hook: 'direct',
};

/** A git project with the given manifest object and optional DESIGN.md content. */
function makeProject({ manifest = FULL_MANIFEST, design } = {}) {
  const dir = tmp('zto-dz-proj-');
  execFileSync('git', ['init', '-q'], { cwd: dir });
  fs.writeFileSync(path.join(dir, '.zero-two-one.json'), JSON.stringify(manifest, null, 2) + '\n');
  if (design !== undefined) fs.writeFileSync(path.join(dir, 'DESIGN.md'), design);
  return dir;
}

function runDesign(args, cwd) {
  return spawnSync(process.execPath, [DESIGN, ...args], { cwd, encoding: 'utf8' });
}

// --- T003 · manifest write is byte-stable except tools.design + updatedAt ----
test('T003 set records tools.design; every other manifest field survives (analyze A1)', () => {
  const dir = makeProject({});
  const r = runDesign(['set', 'material-3'], dir);
  assert.equal(r.status, 0);
  const m = loadManifest(dir);
  assert.equal(m.tools.design, 'material-3', 'design set');
  assert.notEqual(m.updatedAt, FULL_MANIFEST.updatedAt, 'updatedAt refreshed');
  // hook + merged + files must survive the targeted write (FIELD_ORDER whitelist).
  assert.equal(m.hook, 'direct', 'hook preserved');
  assert.deepEqual(m.merged, FULL_MANIFEST.merged, 'merged preserved');
  assert.deepEqual(m.files, FULL_MANIFEST.files, 'files preserved');
  assert.deepEqual(Object.keys(m.tools), ['stack', 'assistant', 'ssd', 'design'], 'tools sub-key order preserved');
});

// --- T004 · tokens scaffold --------------------------------------------------
test('T004 requirements/_design/tokens/ scaffolded on first use; idempotent', () => {
  const dir = makeProject({});
  runDesign(['set', 'material-3'], dir);
  const tokens = path.join(dir, 'requirements/_design/tokens');
  assert.ok(fs.existsSync(tokens), 'tokens dir created');
  assert.ok(fs.existsSync(path.join(tokens, '_INDEX.md')), 'link-free _INDEX present');
  assert.ok(!/\]\(/.test(fs.readFileSync(path.join(tokens, '_INDEX.md'), 'utf8')), '_INDEX is link-free (analyze A3)');
  const r2 = runDesign(['set', 'material-3'], dir);
  assert.equal(r2.status, 0, 're-run idempotent');
});

// --- T005 · mapping section: replace / append / create -----------------------
test('T005 mapping section replaces within markers', () => {
  const withMarker = `---\nx: 1\n---\n\n# D\n\n${MARK_START}\n## Design System Mapping\n\nOLD\n${MARK_END}\n`;
  const out = applyMapping(withMarker, mappingBlock('material-3'));
  assert.ok(out.includes('md.sys.color.primary'), 'new skeleton written');
  assert.ok(!out.includes('OLD'), 'old region replaced');
  assert.equal(out.match(new RegExp(MARK_START, 'g')).length, 1, 'single marker pair');
});

test('T005b mapping section appends when no marker; frontmatter untouched', () => {
  const dir = makeProject({ design: '---\ncolors:\n  primary: "#111"\n---\n\n# Bespoke\n\n## Colors\n\nBlack.\n' });
  runDesign(['set', 'material-3'], dir);
  const txt = fs.readFileSync(path.join(dir, 'DESIGN.md'), 'utf8');
  assert.ok(txt.includes(MARK_START) && txt.includes(MARK_END), 'markers appended');
  assert.ok(txt.includes('primary: "#111"'), 'frontmatter token block untouched');
  assert.ok(txt.includes('## Colors'), 'existing bespoke section retained');
});

test('T005c DESIGN.md created from template when absent (analyze A2)', () => {
  const dir = makeProject({}); // no DESIGN.md
  runDesign(['set', 'material-3'], dir);
  const p = path.join(dir, 'DESIGN.md');
  assert.ok(fs.existsSync(p), 'DESIGN.md created');
  assert.ok(fs.readFileSync(p, 'utf8').includes(MARK_START), 'mapping section present');
});

// --- T006 · none collapse ----------------------------------------------------
test('T006 set none collapses the mapping and records design: none', () => {
  const dir = makeProject({ manifest: { ...FULL_MANIFEST, tools: { ...FULL_MANIFEST.tools, design: 'material-3' } } });
  runDesign(['set', 'none'], dir);
  assert.equal(loadManifest(dir).tools.design, 'none');
  const txt = fs.readFileSync(path.join(dir, 'DESIGN.md'), 'utf8');
  assert.ok(/source of truth/.test(txt), 'bespoke note');
  assert.ok(!/md\.sys\./.test(txt), 'no md.sys.* rows under none');
});

// --- T007 · BYO skeleton -----------------------------------------------------
test('T007 BYO writes generic rows, no md.sys.*, records the name', () => {
  const dir = makeProject({});
  runDesign(['set', 'acme-tokens'], dir);
  assert.equal(loadManifest(dir).tools.design, 'acme-tokens');
  const txt = fs.readFileSync(path.join(dir, 'DESIGN.md'), 'utf8');
  assert.ok(/acme-tokens/.test(txt), 'system name in section');
  assert.ok(!/md\.sys\./.test(txt), 'no md.sys.* assumptions for BYO');
});

// --- T008 · dispatch route + dual usage (analyze A5) -------------------------
test('T008 021 design set routes; dispatcher vs design.js usage', () => {
  const dir = makeProject({});
  const ok = spawnSync(process.execPath, [BIN_021, 'design', 'set', 'material-3'], { cwd: dir, encoding: 'utf8' });
  assert.equal(ok.status, 0, 'dispatch exit 0');
  assert.match(ok.stdout, /tools\.design = material-3/, 'routed to design.js');

  const noLeaf = spawnSync(process.execPath, [BIN_021, 'design'], { cwd: dir, encoding: 'utf8' });
  assert.equal(noLeaf.status, 1);
  assert.match(noLeaf.stderr, /Usage: 021\b/, 'dispatcher usage for missing leaf');

  const noSystem = spawnSync(process.execPath, [BIN_021, 'design', 'set'], { cwd: dir, encoding: 'utf8' });
  assert.equal(noSystem.status, 1);
  assert.match(noSystem.stderr, /Usage: 021 design set/, 'design.js usage for missing system');
});

// --- T009 · cross-stack render -----------------------------------------------
function install(target, stack) {
  return initFramework(target, { sourceDir: REPO_ROOT, quiet: true, yes: true, stack });
}

test('T009 design command renders per stack; kiro installs without error', () => {
  const cl = tmp();
  assert.equal(install(cl, 'claude'), 0);
  assert.ok(fs.existsSync(path.join(cl, '.claude/commands/021-design.md')), 'claude command file');

  const ag = tmp();
  assert.equal(install(ag, 'antigravity'), 0);
  assert.ok(fs.existsSync(path.join(ag, '.agents/skills/021-design/SKILL.md')), 'antigravity rendered SKILL');

  const ki = tmp();
  assert.equal(install(ki, 'kiro'), 0, 'kiro installs clean (no per-command skill; analyze A4)');
});
