'use strict';

/**
 * doctor.test.js — Workflow-Manager drift reporter suite (spec 004).
 * Maps to tasks T002–T011. Read-only is asserted (T011).
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const doc = require('../../scripts/speckit/doctor');
const fx = require('./doctor-fixtures');

const REPO = path.join(__dirname, '..', '..');
const DOCTOR = path.join(REPO, 'scripts', 'speckit', 'doctor.js');
const has = (findings, check) => findings.filter((f) => f.check === check);

// --- T002 · clean ------------------------------------------------------------
test('T002 coherent repo → no findings', () => {
  const dir = fx.build({
    specs: [{ name: '001-a', status: 'Done' }],
    releases: { 'mvp-3': 'Delivered' },
    roadmap: { 'mvp-3': '✅ Delivered' },
    backlog: [{ status: 'Done', release: 'mvp-3' }],
    manifest: { phase: 'mvp' },
  });
  assert.deepEqual(doc.runDoctor(dir), []);
  fx.rm(dir);
});

// --- T003 · spec ↔ index (hard) ---------------------------------------------
test('T003 index status mismatch + missing row → hard findings', () => {
  const mismatch = fx.build({
    specs: [{ name: '001-a', status: 'Done' }],
    indexRows: [{ name: '001-a', status: 'In Progress' }],
  });
  const f = doc.checkSpecIndex(mismatch);
  assert.equal(f.length, 1);
  assert.equal(f[0].severity, 'hard');
  assert.match(f[0].proposedFix, /update the _INDEX row to Done/);
  fx.rm(mismatch);

  const missing = fx.build({ specs: [{ name: '001-a', status: 'Done' }], indexRows: [] });
  assert.equal(doc.checkSpecIndex(missing).length, 1);
  fx.rm(missing);
});

// --- T004 · spec ↔ tasks; In Progress is NOT drift (R7) ----------------------
test('T004 Done with unchecked tasks → hard; In Progress + open tasks → none', () => {
  const done = fx.build({ specs: [{ name: '001-a', status: 'Done', tasks: '- [x] a\n- [ ] b\n' }] });
  const f = doc.checkSpecWork(done);
  assert.equal(f.length, 1);
  assert.equal(f[0].severity, 'hard');
  assert.match(f[0].actual, /1 unchecked/);
  fx.rm(done);

  const wip = fx.build({ specs: [{ name: '001-a', status: 'In Progress', tasks: '- [ ] a\n' }] });
  assert.deepEqual(doc.checkSpecWork(wip), []);
  fx.rm(wip);
});

// --- T005 · release ↔ specs: advanceable, overclaimed, in-flight -------------
test('T005 advanceable + overclaimed flagged; in-flight release not flagged', () => {
  const advanceable = fx.build({ specs: [{ name: '001-a', status: 'Done' }], releases: { 'mvp-3': 'Planned' } });
  assert.equal(has(doc.checkReleaseSpecs(advanceable), 'release-specs').length, 1);
  fx.rm(advanceable);

  const overclaimed = fx.build({ specs: [{ name: '001-a', status: 'In Progress' }], releases: { 'mvp-3': 'Delivered' } });
  assert.equal(doc.checkReleaseSpecs(overclaimed).length, 1);
  fx.rm(overclaimed);

  const inflight = fx.build({ specs: [{ name: '001-a', status: 'In Progress' }], releases: { 'mvp-3': 'In progress' } });
  assert.deepEqual(doc.checkReleaseSpecs(inflight), []);
  fx.rm(inflight);
});

// --- T006 · roadmap ↔ release ------------------------------------------------
test('T006 roadmap row disagreeing with release file → advisory', () => {
  const dir = fx.build({
    specs: [{ name: '001-a', status: 'In Progress' }],
    releases: { 'mvp-3': 'In progress' },
    roadmap: { 'mvp-3': '✅ Completed' },
  });
  const f = doc.checkRoadmapRelease(dir);
  assert.equal(f.length, 1);
  assert.equal(f[0].severity, 'advisory');
  fx.rm(dir);
});

// --- T007 · backlog ↔ release ------------------------------------------------
test('T007 Open backlog rows while release specs all Done → advisory', () => {
  const drift = fx.build({
    specs: [{ name: '001-a', status: 'Done' }],
    releases: { 'mvp-3': 'Delivered' },
    backlog: [{ status: 'Open', release: 'mvp-3' }, { status: 'Done', release: 'mvp-3' }],
  });
  const f = doc.checkBacklogRelease(drift);
  assert.equal(f.length, 1);
  assert.match(f[0].actual, /1 Open/);
  fx.rm(drift);

  // specs not all Done → not flagged
  const ok = fx.build({ specs: [{ name: '001-a', status: 'In Progress' }], backlog: [{ status: 'Open', release: 'mvp-3' }] });
  assert.deepEqual(doc.checkBacklogRelease(ok), []);
  fx.rm(ok);
});

// --- T008 · manifest phase (repo ahead of recorded) → advisory ---------------
test('T008 inferred phase ahead of manifest → advisory; behind → none', () => {
  // top-level specs/*.md ⇒ inference = mvp(1); manifest phase planning(0) ⇒ ahead
  const ahead = fx.build({ specs: [{ name: '001-a', status: 'Draft' }], manifest: { phase: 'planning' }, extraFiles: { 'specs/feature.md': '# x' } });
  const f = doc.checkManifestPhase(ahead);
  assert.equal(f.length, 1);
  assert.equal(f[0].severity, 'advisory');
  fx.rm(ahead);

  // manifest ahead of (conservative) inference ⇒ not flagged
  const behind = fx.build({ specs: [{ name: '001-a', status: 'Draft' }], manifest: { phase: 'mvp' } });
  assert.deepEqual(doc.checkManifestPhase(behind), []);
  fx.rm(behind);
});

// --- T009 · normalizeStatus --------------------------------------------------
test('T009 normalizeStatus collapses glyphs + words', () => {
  for (const s of ['Done', '✅ Delivered', 'Completed']) assert.equal(doc.normalizeStatus(s), 'done');
  for (const s of ['In Progress', '🔜 Next']) assert.equal(doc.normalizeStatus(s), 'in-progress');
  for (const s of ['Open', '◻ Planned', 'Todo']) assert.equal(doc.normalizeStatus(s), 'open');
});

// --- T010 · exit code: non-zero only on hard ---------------------------------
test('T010 CLI exit: non-zero on hard drift; advisory-only → 0', () => {
  const hard = fx.build({ specs: [{ name: '001-a', status: 'Done' }], indexRows: [{ name: '001-a', status: 'Draft' }] });
  assert.throws(() => execFileSync('node', [DOCTOR], { cwd: hard, stdio: 'pipe' }), 'hard drift should exit non-zero');
  fx.rm(hard);

  const advisory = fx.build({ specs: [{ name: '001-a', status: 'Done' }], releases: { 'mvp-3': 'Planned' } });
  const out = execFileSync('node', [DOCTOR], { cwd: advisory, encoding: 'utf8' }); // throws if non-zero
  assert.match(out, /advisory/);
  fx.rm(advisory);
});

// --- T011 · read-only + out of the path + no second manifest parser ----------
test('T011 read-only; not in pre-commit; no direct manifest parse', () => {
  const dir = fx.build({ specs: [{ name: '001-a', status: 'Done' }], indexRows: [{ name: '001-a', status: 'Draft' }] });
  const before = fx.snapshot(dir);
  doc.runDoctor(dir);
  try { execFileSync('node', [DOCTOR], { cwd: dir, stdio: 'pipe' }); } catch (_) { /* hard drift → non-zero, expected */ }
  assert.deepEqual(fx.snapshot(dir), before, 'doctor wrote nothing');
  fx.rm(dir);

  assert.ok(!/doctor/.test(fs.readFileSync(path.join(REPO, 'hooks', 'pre-commit'), 'utf8')), 'not referenced by pre-commit');
  const src = fs.readFileSync(DOCTOR, 'utf8');
  assert.ok(/manifestFacts/.test(src), 'doctor.js reuses lib.manifestFacts for phase');
  assert.ok(!/zero-two-one\.json/.test(src), 'doctor.js must not read the manifest directly');
});
