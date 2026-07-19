'use strict';

/**
 * prototype.test.js — Optional Prototype Command (spec 012, `021-prototype`).
 *
 * Scaffold (T003), design-system CSS seam @import vs inline :root (T004/T005),
 * non-destructive (T006), emergent activation (T007), writes-only-under-
 * prototype (T008), dispatch route (T009), cross-stack render (T010).
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..', '..');
const PROTO = path.join(REPO_ROOT, 'scripts', 'prototype.js');
const BIN_021 = path.join(REPO_ROOT, 'bin', '021.js');
const { initFramework } = require('../../scripts/init');

function tmp(pfx = 'zto-pt-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), pfx));
}

const MANIFEST = (design) => ({
  version: '1.0.0',
  phase: 'planning',
  tools: { stack: 'claude', assistant: 'claude-code', ssd: 'github-speckit', design },
});

/** A git project: manifest (design), optional tokens css, optional DESIGN.md, optional prototype seed. */
function makeProject({ design = 'none', tokensCss, designMd, protoFiles } = {}) {
  const dir = tmp('zto-pt-proj-');
  execFileSync('git', ['init', '-q'], { cwd: dir });
  fs.writeFileSync(path.join(dir, '.zero-two-one.json'), JSON.stringify(MANIFEST(design), null, 2) + '\n');
  if (tokensCss !== undefined) {
    fs.mkdirSync(path.join(dir, 'requirements/_design/tokens'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'requirements/_design/tokens/tokens.css'), tokensCss);
  }
  if (designMd !== undefined) fs.writeFileSync(path.join(dir, 'DESIGN.md'), designMd);
  if (protoFiles) {
    fs.mkdirSync(path.join(dir, 'prototype'), { recursive: true });
    for (const [name, body] of Object.entries(protoFiles)) {
      fs.writeFileSync(path.join(dir, 'prototype', name), body);
    }
  }
  return dir;
}

function runProto(args, cwd) {
  return spawnSync(process.execPath, [PROTO, ...args], { cwd, encoding: 'utf8' });
}

const DESIGN_BESPOKE = '---\ncolors:\n  primary: "#123456"\n  neutral: "#ffffff"\nrounded:\n  md: 8px\nspacing:\n  md: 16px\n---\n\n# Design\n';

// --- T003 · scaffold --------------------------------------------------------
test('T003 init scaffolds prototype/ files; creates the dir when absent', () => {
  const dir = makeProject({ designMd: DESIGN_BESPOKE });
  const r = runProto(['init'], dir);
  assert.equal(r.status, 0);
  for (const f of ['index.html', 'styles.css', 'app.js', '_INDEX.md']) {
    assert.ok(fs.existsSync(path.join(dir, 'prototype', f)), `${f} written`);
  }
  const html = fs.readFileSync(path.join(dir, 'prototype/index.html'), 'utf8');
  assert.match(html, /href="styles\.css"/, 'links styles.css');
  assert.match(html, /src="app\.js"/, 'links app.js');
});

// --- T004 · CSS seam: @import when a system + tokens css present -------------
test('T004 styles.css @imports the tokens css when a system is set', () => {
  const dir = makeProject({ design: 'material-3', tokensCss: ':root{--md-sys-color-primary:#6750a4;}' });
  runProto(['init'], dir);
  const css = fs.readFileSync(path.join(dir, 'prototype/styles.css'), 'utf8');
  assert.match(css, /@import '\.\.\/requirements\/_design\/tokens\/tokens\.css';/, 'imports tokens css');
});

// --- T005 · CSS seam: inline :root under none (best-effort, non-exhaustive) --
test('T005 styles.css inlines :root under none; no @import (analyze A2)', () => {
  const dir = makeProject({ design: 'none', designMd: DESIGN_BESPOKE });
  runProto(['init'], dir);
  const css = fs.readFileSync(path.join(dir, 'prototype/styles.css'), 'utf8');
  assert.ok(!/@import/.test(css), 'no @import under none');
  assert.match(css, /:root\s*{/, 'inline :root present');
  assert.match(css, /--colors-primary:\s*#123456/, 'a colors-derived var present (non-exhaustive)');
  // radii vs rounded is not hardcoded — the block need not contain the rounded map.
});

// --- T006 · non-destructive -------------------------------------------------
test('T006 refuses over an existing prototype without --force; --force overwrites', () => {
  const dir = makeProject({ designMd: DESIGN_BESPOKE, protoFiles: { 'index.html': '<!-- mine -->' } });
  const refused = runProto(['init'], dir);
  assert.equal(refused.status, 1, 'exit 1 without --force');
  assert.equal(fs.readFileSync(path.join(dir, 'prototype/index.html'), 'utf8'), '<!-- mine -->', 'user file preserved');

  const forced = runProto(['init', '--force'], dir);
  assert.equal(forced.status, 0, '--force succeeds');
  assert.match(fs.readFileSync(path.join(dir, 'prototype/index.html'), 'utf8'), /<!doctype html>/i, 'overwritten');
});

// --- T007 · emergent activation (the run-qa gate condition) ------------------
test('T007 after init, prototype/*.html matches (the run-qa tier gate)', () => {
  const dir = makeProject({ designMd: DESIGN_BESPOKE });
  runProto(['init'], dir);
  const htmls = fs.readdirSync(path.join(dir, 'prototype')).filter((n) => n.endsWith('.html'));
  assert.ok(htmls.length >= 1, 'a .html now exists — the tier activates by presence');
});

// --- T008 · writes only under prototype/ ------------------------------------
test('T008 init leaves run-qa.sh, prototype-sync.md, workflow-status.js, manifest byte-unchanged', () => {
  // These framework files live in the repo, not the temp project; assert the
  // command writes nothing outside prototype/ in the target.
  const dir = makeProject({ designMd: DESIGN_BESPOKE });
  const manifestBefore = fs.readFileSync(path.join(dir, '.zero-two-one.json'), 'utf8');
  const designBefore = fs.readFileSync(path.join(dir, 'DESIGN.md'), 'utf8');
  runProto(['init'], dir);
  assert.equal(fs.readFileSync(path.join(dir, '.zero-two-one.json'), 'utf8'), manifestBefore, 'manifest untouched');
  assert.equal(fs.readFileSync(path.join(dir, 'DESIGN.md'), 'utf8'), designBefore, 'DESIGN.md untouched');
  // only prototype/ (and the pre-existing files) exist at the top level
  const top = fs.readdirSync(dir).filter((n) => n !== '.git').sort();
  assert.deepEqual(top, ['.zero-two-one.json', 'DESIGN.md', 'prototype'].sort(), 'only prototype/ added');
});

// --- T009 · dispatch route + usage ------------------------------------------
test('T009 021 prototype init routes; bad/absent leaf → usage + exit 1', () => {
  const dir = makeProject({ designMd: DESIGN_BESPOKE });
  const ok = spawnSync(process.execPath, [BIN_021, 'prototype', 'init'], { cwd: dir, encoding: 'utf8' });
  assert.equal(ok.status, 0, 'routes to prototype.js');
  assert.match(ok.stdout, /Scaffolded prototype\//);

  assert.equal(spawnSync(process.execPath, [BIN_021, 'prototype'], { cwd: dir, encoding: 'utf8' }).status, 1, 'no leaf → exit 1');
  assert.equal(spawnSync(process.execPath, [BIN_021, 'prototype', 'bogus'], { cwd: dir, encoding: 'utf8' }).status, 1, 'bad leaf → exit 1');
});

// --- T010 · cross-stack render ----------------------------------------------
function install(target, stack) {
  return initFramework(target, { sourceDir: REPO_ROOT, quiet: true, yes: true, stack });
}

test('T010 prototype command renders per stack; kiro installs without error', () => {
  const cl = tmp();
  assert.equal(install(cl, 'claude'), 0);
  assert.ok(fs.existsSync(path.join(cl, '.claude/commands/021-prototype.md')), 'claude command file');

  const ag = tmp();
  assert.equal(install(ag, 'antigravity'), 0);
  assert.ok(fs.existsSync(path.join(ag, '.agents/skills/021-prototype/SKILL.md')), 'antigravity rendered SKILL');

  const ki = tmp();
  assert.equal(install(ki, 'kiro'), 0, 'kiro installs clean (no per-command skill)');
});
