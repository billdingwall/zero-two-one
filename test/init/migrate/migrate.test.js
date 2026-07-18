'use strict';

/**
 * migrate.test.js — acceptance suite for Migrate-Mode (spec 002).
 * Maps 1:1 to quickstart scenarios / tasks T003–T017.
 * Run: node --test test/init/
 */

const { test } = require('node:test');
const assert = require('node:assert');

const { initFramework } = require('../../../scripts/init');
const { loadManifest } = require('../../../scripts/init/manifest');
const { speckitReuse } = require('../../../scripts/init/migrate/speckit-reuse');
const fx = require('./fixtures');

/** Migrate helper: quiet, deterministic clock, non-interactive by default. */
function migrate(target, source, opts = {}) {
  return initFramework(target, {
    sourceDir: source,
    quiet: true,
    yes: true,
    now: '2026-02-01T00:00:00.000Z',
    ...opts,
  });
}

// --- T003 · manifest migrate block shape ------------------------------------
test('T003 migrate manifest carries a well-formed migrate block', () => {
  const source = fx.makeMigrateSource();
  const target = fx.makeTarget();
  migrate(target, source);
  const m = loadManifest(target);
  assert.equal(m.mode, 'migrate');
  assert.ok(m.migrate && typeof m.migrate === 'object');
  assert.equal(typeof m.migrate.duplicates, 'object');
  assert.ok(Array.isArray(m.migrate.imported));
  assert.equal(typeof m.migrate.archived, 'object');
  fx.rm(source); fx.rm(target);
});

// --- T004 · detected migrate vs scaffold ------------------------------------
test('T004 non-empty repo → migrate; empty repo → scaffold', () => {
  const source = fx.makeMigrateSource();
  const mig = fx.makeTarget();
  const empty = fx.makeEmptyTarget();
  migrate(mig, source);
  migrate(empty, source);
  assert.equal(loadManifest(mig).mode, 'migrate');
  assert.equal(loadManifest(empty).mode, 'scaffold');
  fx.rm(source); fx.rm(mig); fx.rm(empty);
});

// --- T005 · phase strict precedence -----------------------------------------
test('T005 phase precedence: growth needs tests+CI+tags; else mvp; else planning', () => {
  const source = fx.makeMigrateSource();

  const codeOnly = fx.makeTarget({ code: true });     // src/ only → mvp
  const docOnly = fx.makeTarget({ code: false });     // non-code content → planning
  fx.write(docOnly, 'notes.txt', 'hello\n');
  const growth = fx.makeTarget({ code: true });
  fx.makeGrowthSignals(growth);

  migrate(codeOnly, source);
  migrate(docOnly, source);
  migrate(growth, source);

  assert.equal(loadManifest(codeOnly).phase, 'mvp');
  assert.equal(loadManifest(docOnly).phase, 'planning');
  assert.equal(loadManifest(growth).phase, 'growth');
  fx.rm(source); fx.rm(codeOnly); fx.rm(docOnly); fx.rm(growth);
});

// --- T006 · --phase overrides inference -------------------------------------
test('T006 --phase overrides inferred phase', () => {
  const source = fx.makeMigrateSource();
  const target = fx.makeTarget({ code: true }); // would infer mvp
  migrate(target, source, { phase: 'planning' });
  assert.equal(loadManifest(target).phase, 'planning');
  fx.rm(source); fx.rm(target);
});

// --- T007 · stack detection + conflict resolution ---------------------------
test('T007 stack from surface; conflicting surfaces resolved by --stack', () => {
  const source = fx.makeMigrateSource();
  // A .kiro/ surface resolves stack=kiro, which is reserved-but-unrenderable
  // until spec 008 — migrate must refuse loudly, not write a claude tree under
  // a kiro manifest (spec 006 analyze A5).
  const kiro = fx.makeTarget();
  fx.write(kiro, '.kiro/config', 'x\n');
  const both = fx.makeTarget();
  fx.write(both, '.kiro/config', 'x\n');
  fx.write(both, '.claude/settings.json', '{}\n');

  const kiroCode = migrate(kiro, source);
  migrate(both, source, { stack: 'claude' });

  assert.equal(kiroCode, 1, 'kiro is not yet installable (spec 008)');
  assert.equal(loadManifest(kiro), null, 'no manifest written for an unsupported stack');
  assert.equal(loadManifest(both).tools.stack, 'claude', 'conflicting surfaces resolved by --stack claude');
  fx.rm(source); fx.rm(kiro); fx.rm(both);
});

// --- T008 · leave-alongside import ------------------------------------------
test('T008 leave-alongside: dest byte-unchanged + catalog row', () => {
  const source = fx.makeMigrateSource();
  const target = fx.makeTarget();
  fx.write(target, 'requirements/01-PRD.md', '# my own prd\n');
  const before = fx.hashOf(require('path').join(target, 'requirements/01-PRD.md'));

  migrate(target, source, { dup: { 'requirements/01-PRD.md': 'leave' } });

  const after = fx.hashOf(require('path').join(target, 'requirements/01-PRD.md'));
  assert.equal(after, before, 'user PRD unchanged');
  assert.ok(fx.exists(target, 'requirements/_notes/imported-docs.md'));
  assert.match(fx.read(target, 'requirements/_notes/imported-docs.md'), /01-PRD\.md/);
  assert.deepEqual(loadManifest(target).migrate.imported, ['requirements/01-PRD.md']);
  fx.rm(source); fx.rm(target);
});

// --- T009 · archive ---------------------------------------------------------
test('T009 archive: original moved + pointer recorded; fresh template at dest', () => {
  const source = fx.makeMigrateSource();
  const target = fx.makeTarget();
  fx.write(target, 'README.md', '# ORIGINAL README\n');

  migrate(target, source, { dup: { 'README.md': 'archive' } });

  assert.equal(fx.read(target, 'requirements/_notes/archive/README.md'), '# ORIGINAL README\n');
  assert.equal(fx.read(target, 'README.md'), '# README (template)\n');
  assert.equal(loadManifest(target).migrate.archived['README.md'], 'requirements/_notes/archive/README.md');
  fx.rm(source); fx.rm(target);
});

// --- T010 · update/wrap -----------------------------------------------------
test('T010 update/wrap: template structure + original under Imported content', () => {
  const source = fx.makeMigrateSource();
  const target = fx.makeTarget();
  fx.write(target, 'requirements/01-PRD.md', 'MY ORIGINAL PRD BODY\n');

  migrate(target, source, { dup: { 'requirements/01-PRD.md': 'update' } });

  const out = fx.read(target, 'requirements/01-PRD.md');
  assert.match(out, /# PRD \(template\)/);
  assert.match(out, /## Imported content/);
  assert.match(out, /MY ORIGINAL PRD BODY/);
  assert.equal(loadManifest(target).migrate.duplicates['requirements/01-PRD.md'], 'update');
  fx.rm(source); fx.rm(target);
});

// --- T011 · guiding-doc leave coexistence -----------------------------------
test('T011 leave on CLAUDE.md keeps it + writes CLAUDE.zero-two-one.md', () => {
  const source = fx.makeMigrateSource();
  const target = fx.makeTarget();
  fx.write(target, 'CLAUDE.md', '# my claude\n');

  migrate(target, source, { dup: { 'CLAUDE.md': 'leave' } });

  assert.equal(fx.read(target, 'CLAUDE.md'), '# my claude\n', 'user CLAUDE untouched');
  assert.ok(fx.exists(target, 'CLAUDE.zero-two-one.md'), 'framework version coexists');
  assert.equal(fx.read(target, 'CLAUDE.zero-two-one.md'), '# ASSISTANT (template)\n', 'entrypoint rendered from the neutral source (spec 006)');
  fx.rm(source); fx.rm(target);
});

// --- T012 · decisions recorded in manifest ----------------------------------
test('T012 duplicate decisions recorded in manifest.migrate.duplicates', () => {
  const source = fx.makeMigrateSource();
  const target = fx.makeTarget();
  fx.write(target, 'README.md', '# r\n');
  fx.write(target, 'CLAUDE.md', '# c\n');

  migrate(target, source, { dup: { 'README.md': 'archive', 'CLAUDE.md': 'leave' } });

  const d = loadManifest(target).migrate.duplicates;
  assert.equal(d['README.md'], 'archive');
  assert.equal(d['CLAUDE.md'], 'leave');
  fx.rm(source); fx.rm(target);
});

// --- T013 · Spec Kit reuse --------------------------------------------------
test('T013 Spec Kit reuse: valid + invalid frontmatter reported, files untouched', () => {
  const source = fx.makeMigrateSource();
  const target = fx.makeTarget();
  fx.write(target, 'specs/001-x/spec.md', '---\nstatus: Approved\n---\n# x\n');
  fx.write(target, 'specs/002-y/spec.md', '# no frontmatter\n');
  const before = fx.hashOf(require('path').join(target, 'specs/002-y/spec.md'));

  const reuse = speckitReuse(target);
  assert.equal(reuse.reused, true);
  assert.equal(reuse.specs, 2);
  assert.deepEqual(reuse.invalid, ['specs/002-y/spec.md']);

  migrate(target, source);
  assert.equal(fx.hashOf(require('path').join(target, 'specs/002-y/spec.md')), before, 'user spec untouched');
  fx.rm(source); fx.rm(target);
});

// --- T014 · non-interactive completeness + --design -------------------------
test('T014 no TTY + no flags completes exit 0; --design recorded', () => {
  const source = fx.makeMigrateSource();
  const target = fx.makeTarget();
  fx.write(target, 'README.md', '# r\n'); // a collision, unresolved by flag
  const code = migrate(target, source, { design: 'material-3' });
  assert.equal(code, 0);
  const m = loadManifest(target);
  assert.equal(m.tools.design, 'material-3');
  assert.equal(m.migrate.duplicates['README.md'], 'leave', 'safe default');
  fx.rm(source); fx.rm(target);
});

// --- T015 · growth entry + A1 precedence ------------------------------------
test('T015 growth entry scaffolds roadmap/backlog; existing files not overwritten', () => {
  const source = fx.makeMigrateSource();
  const fresh = fx.makeTarget();
  migrate(fresh, source, { phase: 'growth' });
  assert.ok(fx.exists(fresh, 'requirements/05-ROADMAP.md'));
  assert.ok(fx.exists(fresh, 'requirements/04-BACKLOG.md'));

  const existing = fx.makeTarget();
  fx.write(existing, 'requirements/05-ROADMAP.md', '# MY ROADMAP\n');
  migrate(existing, source, { phase: 'growth', dup: { 'requirements/05-ROADMAP.md': 'leave' } });
  assert.equal(fx.read(existing, 'requirements/05-ROADMAP.md'), '# MY ROADMAP\n', 'not overwritten (A1)');
  fx.rm(source); fx.rm(fresh); fx.rm(existing);
});

// --- T016 · idempotent re-run -----------------------------------------------
test('T016 re-run is manifest-driven: no re-prompt/dup rows/re-archive', () => {
  const source = fx.makeMigrateSource();
  const target = fx.makeTarget();
  fx.write(target, 'README.md', '# r\n');

  migrate(target, source, { dup: { 'README.md': 'archive' } });
  const afterFirst = fx.snapshotTree(target, ['.zero-two-one.json']);
  const archivedFirst = loadManifest(target).migrate.archived['README.md'];

  // Second run with NO flags — recorded decisions must not re-apply.
  migrate(target, source);
  const afterSecond = fx.snapshotTree(target, ['.zero-two-one.json']);

  assert.deepEqual(afterSecond, afterFirst, 'no managed file changed on re-run');
  const m = loadManifest(target);
  assert.equal(m.mode, 'migrate', 'mode read from manifest');
  assert.equal(m.migrate.archived['README.md'], archivedFirst, 'not re-archived');
  fx.rm(source); fx.rm(target);
});

// --- T017 · migration acceptance: zero user-file overwrites -----------------
test('T017 migration acceptance — non-empty repo, zero user-file overwrites', () => {
  const source = fx.makeMigrateSource();
  const target = fx.makeTarget();
  fx.write(target, 'src/index.js', 'CUSTOM CODE\n');
  fx.write(target, 'README.md', '# MY README\n');
  fx.write(target, 'requirements/01-PRD.md', '# MY PRD\n');
  fx.write(target, 'docs/notes.md', '# notes\n');

  const path = require('path');
  const userFiles = ['src/index.js', 'README.md', 'requirements/01-PRD.md', 'docs/notes.md'];
  const before = userFiles.map((f) => fx.hashOf(path.join(target, f)));

  const code = migrate(target, source); // all defaults → leave
  assert.equal(code, 0);

  const after = userFiles.map((f) => fx.hashOf(path.join(target, f)));
  assert.deepEqual(after, before, 'every pre-existing user file is byte-identical');
  fx.rm(source); fx.rm(target);
});
