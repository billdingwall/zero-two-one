'use strict';

/**
 * engine.test.js — acceptance suite for the Safe Install & Merge Engine.
 * Maps 1:1 to spec 001 quickstart scenarios / tasks T004–T019.
 * Run: node --test test/init/
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const { initFramework } = require('../../scripts/init');
const { classifyAll } = require('../../scripts/init/classify');
const { loadManifest } = require('../../scripts/init/manifest');
const fx = require('./fixtures');

/** Install helper with quiet output and a deterministic clock. */
function install(target, source, opts = {}) {
  return initFramework(target, { sourceDir: source, quiet: true, now: '2026-01-01T00:00:00.000Z', ...opts });
}

// --- T004 · manifest schema shape -------------------------------------------
test('T004 manifest has the required shape; files{} is framework-owned only', () => {
  const source = fx.makeSourceFixture();
  const target = fx.makeTargetDir();
  install(target, source);
  const m = loadManifest(target);
  for (const k of ['version', 'installedAt', 'mode', 'phase', 'tools', 'files', 'merged']) {
    assert.ok(k in m, `manifest missing ${k}`);
  }
  assert.ok(Object.keys(m.files).length > 0);
  // framework-owned only — never user/merged/excluded
  for (const bad of ['CLAUDE.md', 'requirements/01-PRD.md', '.gitignore', 'package.json', 'bin/init.js', 'specs/_INDEX.md']) {
    assert.ok(!(bad in m.files), `files{} should not contain ${bad}`);
  }
  fx.rm(source); fx.rm(target);
});

// --- T005 · fresh install ---------------------------------------------------
test('T005 fresh install creates the framework surface + populated manifest', () => {
  const source = fx.makeSourceFixture();
  const target = fx.makeTargetDir();
  const code = install(target, source);
  assert.equal(code, 0);
  for (const f of ['scripts/run-qa.sh', 'skills/verify.md', 'workflow/workflows.md', 'hooks/pre-commit', '.claude/commands/021-init.md', 'templates/CLAUDE-Template.md']) {
    assert.ok(fx.exists(target, f), `expected ${f}`);
  }
  const m = loadManifest(target);
  assert.equal(m.mode, 'scaffold');
  assert.equal(m.phase, 'planning');
  assert.equal(m.tools.stack, 'claude');
  assert.ok(!('updatedAt' in m), 'no updatedAt on first install');
  assert.ok('scripts/run-qa.sh' in m.files);
  fx.rm(source); fx.rm(target);
});

// --- T006 · user-doc instantiation + surface exclusion ----------------------
test('T006 instantiates user docs from templates; bin/ and specs/ are not written', () => {
  const source = fx.makeSourceFixture();
  const target = fx.makeTargetDir();
  install(target, source);
  assert.ok(fx.exists(target, 'CLAUDE.md'), 'CLAUDE.md instantiated');
  assert.ok(fx.exists(target, 'requirements/01-PRD.md'), 'PRD instantiated');
  assert.equal(fx.read(target, 'CLAUDE.md'), fx.read(source, 'templates/CLAUDE-Template.md'));
  assert.ok(!fx.exists(target, 'bin/init.js'), 'bin/ excluded');
  assert.ok(!fx.exists(target, 'specs/_INDEX.md'), 'specs/ excluded');
  fx.rm(source); fx.rm(target);
});

// --- T007 · idempotent re-run -----------------------------------------------
test('T007 re-run changes no managed file; installedAt preserved, updatedAt set', () => {
  const source = fx.makeSourceFixture();
  const target = fx.makeTargetDir();
  install(target, source);
  const before = fx.snapshotTree(target, ['.zero-two-one.json']);
  // plan-level idempotency: nothing to create/refresh/conflict on a clean re-run
  const plan = classifyAll({ sourceDir: source, targetDir: target, manifest: loadManifest(target), opts: {} });
  for (const bad of ['create', 'refresh', 'conflict', 'adopt']) {
    assert.ok(!plan.actions.some((a) => a.action === bad), `no ${bad} on clean re-run`);
  }
  const code = install(target, source, { now: '2026-02-02T00:00:00.000Z' });
  assert.equal(code, 0);
  const after = fx.snapshotTree(target, ['.zero-two-one.json']);
  assert.deepEqual(after, before, 'managed files unchanged on re-run');
  const m = loadManifest(target);
  assert.equal(m.installedAt, '2026-01-01T00:00:00.000Z', 'installedAt preserved');
  assert.equal(m.updatedAt, '2026-02-02T00:00:00.000Z', 'updatedAt refreshed');
  fx.rm(source); fx.rm(target);
});

// --- T008 · conflict on a modified framework file ---------------------------
test('T008 hand-modified framework file → conflict, unchanged, exit 0', () => {
  const source = fx.makeSourceFixture();
  const target = fx.makeTargetDir();
  install(target, source);
  fx.write(target, 'scripts/run-qa.sh', '#!/bin/sh\necho MY EDIT\n');
  const plan = classifyAll({ sourceDir: source, targetDir: target, manifest: loadManifest(target), opts: {} });
  assert.ok(plan.conflicts.some((c) => c.path === 'scripts/run-qa.sh'));
  const code = install(target, source, { now: '2026-02-02T00:00:00.000Z' });
  assert.equal(code, 0, 'conflicts still exit 0');
  assert.match(fx.read(target, 'scripts/run-qa.sh'), /MY EDIT/, 'left unchanged');
  fx.rm(source); fx.rm(target);
});

// --- T009 · user docs sacrosanct; --force overwrites ------------------------
test('T009 user doc never modified without --force; --force overwrites', () => {
  const source = fx.makeSourceFixture();
  const target = fx.makeTargetDir();
  install(target, source);
  fx.write(target, 'CLAUDE.md', '# my customized claude\n');
  install(target, source, { now: '2026-02-02T00:00:00.000Z' });
  assert.match(fx.read(target, 'CLAUDE.md'), /my customized/, 'untouched without --force');
  install(target, source, { now: '2026-03-03T00:00:00.000Z', force: ['CLAUDE.md'] });
  assert.equal(fx.read(target, 'CLAUDE.md'), fx.read(source, 'templates/CLAUDE-Template.md'), 'overwritten with --force');
  fx.rm(source); fx.rm(target);
});

// --- T010 · dry-run purity --------------------------------------------------
test('T010 --dry-run writes nothing (whole tree unchanged)', () => {
  const source = fx.makeSourceFixture();
  const target = fx.makeTargetDir();
  install(target, source);
  const before = fx.snapshotTree(target);
  const code = install(target, source, { dryRun: true, now: '2026-02-02T00:00:00.000Z' });
  assert.equal(code, 0);
  assert.deepEqual(fx.snapshotTree(target), before, 'dry-run left the tree byte-identical');
  fx.rm(source); fx.rm(target);
});

// --- T011 · upgrade: refresh + orphan ---------------------------------------
test('T011 --upgrade refreshes unmodified files and reports orphans (no delete)', () => {
  const source = fx.makeSourceFixture();
  const target = fx.makeTargetDir();
  install(target, source);
  // bump the package: newer content for an unmodified file
  fx.write(source, 'scripts/run-qa.sh', '#!/bin/sh\necho qa v2\n');
  // record an orphan in the manifest (a file the package no longer ships)
  const m = loadManifest(target);
  m.files['scripts/gone.js'] = 'deadbeef';
  fs.writeFileSync(path.join(target, '.zero-two-one.json'), JSON.stringify(m, null, 2) + '\n');

  const plan = classifyAll({ sourceDir: source, targetDir: target, manifest: loadManifest(target), opts: { upgrade: true } });
  assert.ok(plan.orphans.some((o) => o.path === 'scripts/gone.js'), 'orphan reported');

  const code = install(target, source, { upgrade: true, now: '2026-02-02T00:00:00.000Z' });
  assert.equal(code, 0);
  assert.match(fx.read(target, 'scripts/run-qa.sh'), /qa v2/, 'unmodified file refreshed');
  assert.ok(!fx.exists(target, 'scripts/gone.js'), 'orphan not created/deleted (never existed)');
  fx.rm(source); fx.rm(target);
});

// --- T012 · missing-manifest adopt ------------------------------------------
test('T012 no manifest → adopt current state, overwrite nothing', () => {
  const source = fx.makeSourceFixture();
  const target = fx.makeTargetDir();
  install(target, source);
  fs.rmSync(path.join(target, '.zero-two-one.json'));
  fx.write(target, 'scripts/run-qa.sh', '#!/bin/sh\necho ADOPTED EDIT\n');
  const code = install(target, source, { now: '2026-02-02T00:00:00.000Z' });
  assert.equal(code, 0);
  assert.match(fx.read(target, 'scripts/run-qa.sh'), /ADOPTED EDIT/, 'adopted file not overwritten');
  const m = loadManifest(target);
  assert.ok('scripts/run-qa.sh' in m.files, 'fresh manifest hashes existing file');
  fx.rm(source); fx.rm(target);
});

// --- T013 · merged deletion respected ---------------------------------------
test('T013 a deleted framework-contributed .gitignore line is not re-added', () => {
  const source = fx.makeSourceFixture();
  const target = fx.makeTargetDir();
  install(target, source);
  assert.match(fx.read(target, '.gitignore'), /node_modules\//);
  // user removes the framework line
  const trimmed = fx.read(target, '.gitignore').split('\n').filter((l) => l.trim() !== 'node_modules/').join('\n');
  fx.write(target, '.gitignore', trimmed);
  install(target, source, { now: '2026-02-02T00:00:00.000Z' });
  assert.ok(!/^node_modules\/$/m.test(fx.read(target, '.gitignore')), 'deletion respected');
  fx.rm(source); fx.rm(target);
});

// --- T014 · package.json collision preserves the user's value ---------------
test('T014 package.json script collision preserves the user value', () => {
  const source = fx.makeSourceFixture();
  const target = fx.makeTargetDir();
  fx.write(target, 'package.json', JSON.stringify({ name: 'app', scripts: { '021-status': 'MY OWN' } }, null, 2) + '\n');
  install(target, source);
  const pkg = JSON.parse(fx.read(target, 'package.json'));
  assert.equal(pkg.scripts['021-status'], 'MY OWN', 'user value preserved');
  assert.equal(pkg.scripts['021-qa'], 'sh scripts/run-qa.sh', 'absent framework key added');
  fx.rm(source); fx.rm(target);
});

// --- T015 · generated provisioning ------------------------------------------
test('T015 .ai/context provisioned empty and left untouched on re-run', () => {
  const source = fx.makeSourceFixture();
  const target = fx.makeTargetDir();
  install(target, source);
  assert.ok(fx.exists(target, '.ai/context/.gitkeep'));
  fx.write(target, '.ai/context/bundle.md', '# generated\n');
  install(target, source, { now: '2026-02-02T00:00:00.000Z' });
  assert.ok(fx.exists(target, '.ai/context/bundle.md'), 'existing generated file left alone');
  fx.rm(source); fx.rm(target);
});

// --- T016 · prerequisites ---------------------------------------------------
test('T016 no package.json → created; non-git → hook not wired', () => {
  const source = fx.makeSourceFixture();
  const target = fx.makeTargetDir();
  assert.ok(!fx.exists(target, 'package.json'));
  install(target, source);
  const pkg = JSON.parse(fx.read(target, 'package.json'));
  assert.equal(pkg.scripts['021-status'], 'node scripts/workflow-status.js', 'minimal package.json created with scripts');
  assert.ok(fx.exists(target, 'hooks/pre-commit'), 'framework hook file present');
  assert.ok(!fx.exists(target, '.git/hooks/pre-commit'), 'not wired into a non-existent .git');
  fx.rm(source); fx.rm(target);
});

test('T016b git repo → hook wired into .git/hooks', () => {
  const source = fx.makeSourceFixture();
  const target = fx.makeTargetDir();
  fs.mkdirSync(path.join(target, '.git', 'hooks'), { recursive: true });
  install(target, source);
  assert.ok(fx.exists(target, '.git/hooks/pre-commit'), 'hook installed into git repo');
  fx.rm(source); fx.rm(target);
});

// --- T017 · --force misuse --------------------------------------------------
test('T017 --force on a framework path errors (non-zero)', () => {
  const source = fx.makeSourceFixture();
  const target = fx.makeTargetDir();
  const code = install(target, source, { force: ['scripts/run-qa.sh'] });
  assert.equal(code, 1, 'usage error → non-zero exit');
  fx.rm(source); fx.rm(target);
});

// --- T018 · CRLF normalization ----------------------------------------------
test('T018 CRLF checkout of an unmodified install → no conflict', () => {
  const source = fx.makeSourceFixture();
  const target = fx.makeTargetDir();
  install(target, source);
  const lf = fx.read(target, 'skills/verify.md');
  fx.write(target, 'skills/verify.md', lf.replace(/\n/g, '\r\n')); // CRLF only
  const plan = classifyAll({ sourceDir: source, targetDir: target, manifest: loadManifest(target), opts: {} });
  const a = plan.actions.find((x) => x.path === 'skills/verify.md');
  assert.equal(a.action, 'skip', 'LF-normalized hash matches → skip, not conflict');
  fx.rm(source); fx.rm(target);
});

// --- T019 · source-mode dogfood ---------------------------------------------
test('T019 source repo → mode:source, inventory regenerated, files unchanged', () => {
  // a target that carries the source signature (sync-to-package.js + package/)
  const repo = fx.makeSourceFixture({ source: true });
  // seed the r5-style stub manifest (files: {})
  fs.writeFileSync(
    path.join(repo, '.zero-two-one.json'),
    JSON.stringify({ version: '1.0.0', installedAt: '2026-01-01T00:00:00.000Z', mode: 'source', phase: 'mvp', tools: { stack: 'claude', assistant: 'claude-code', ssd: 'github-speckit', design: 'none' }, files: {}, merged: {} }, null, 2) + '\n'
  );
  const before = fx.read(repo, 'scripts/run-qa.sh');
  const code = install(repo, repo, { now: '2026-02-02T00:00:00.000Z' });
  assert.equal(code, 0);
  const m = loadManifest(repo);
  assert.equal(m.mode, 'source');
  assert.ok(Object.keys(m.files).length > 0, 'inventory regenerated from stub');
  assert.equal(fx.read(repo, 'scripts/run-qa.sh'), before, 'framework file unchanged (adopt)');
  fx.rm(repo);
});
