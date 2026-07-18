'use strict';

/**
 * engine.test.js — SSD engine dispatch (spec 008, Part B).
 * manifestFacts.ssd (T009), github-speckit engine (T010), kiro-specs engine
 * (T011), lib.js delegation (T012), consumers + gate end-to-end via subprocess
 * against a git fixture (T013/T014).
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..', '..');
const lib = require('../../scripts/speckit/lib');
const github = require('../../scripts/speckit/engines/github-speckit');
const kiro = require('../../scripts/speckit/engines/kiro-specs');

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'zto-eng-'));
}
function write(root, rel, body) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
}

/** A git-initialized repo with a kiro-specs manifest + one feature. */
function kiroFixture(status = 'Approved', tasks = '- [x] T001 done\n- [ ] T002 todo\n') {
  const root = tmp();
  write(root, '.zero-two-one.json', JSON.stringify({ phase: 'mvp', mode: 'source', tools: { stack: 'kiro', ssd: 'kiro-specs' } }));
  write(root, '.kiro/specs/my-feature/requirements.md', `---\nstatus: ${status}\n---\n\n# My Feature\n\nEARS requirements.\n`);
  write(root, '.kiro/specs/my-feature/design.md', '# Design\n');
  write(root, '.kiro/specs/my-feature/tasks.md', tasks);
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['config', 'user.email', 't@e.com'], { cwd: root });
  execFileSync('git', ['config', 'user.name', 'T'], { cwd: root });
  return root;
}

// --- T009 · manifestFacts.ssd -----------------------------------------------
test('T009 manifestFacts exposes ssd; defaults github-speckit', () => {
  const gh = tmp();
  write(gh, '.zero-two-one.json', JSON.stringify({ phase: 'mvp', tools: { stack: 'claude' } })); // no ssd key
  assert.equal(lib.manifestFacts(gh).ssd, 'github-speckit', 'absent ssd → default');

  const ki = tmp();
  write(ki, '.zero-two-one.json', JSON.stringify({ phase: 'mvp', tools: { stack: 'kiro', ssd: 'kiro-specs' } }));
  assert.equal(lib.manifestFacts(ki).ssd, 'kiro-specs');

  const none = tmp(); // no manifest at all → inferFacts
  assert.equal(lib.manifestFacts(none).ssd, 'github-speckit', 'no manifest → default (analyze A5)');
});

// --- T010 · github-speckit engine (regression bar) --------------------------
test('T010 github-speckit engine resolves specs/NNN-*/spec.md', () => {
  assert.equal(github.id, 'github-speckit');
  assert.equal(github.docs.primary, 'spec.md');
  assert.deepEqual(github.requiredArtifacts, ['plan.md', 'tasks.md']);
  assert.deepEqual(github.optionalArtifacts, ['data-model.md', 'contracts']);
  // Against the live repo: lists NNN- specs, reads a known status.
  assert.ok(github.listSpecs(REPO_ROOT).includes('008-kiro-adapter'));
  assert.equal(github.readStatus('006-source-layer-renderer', REPO_ROOT), 'Done');
});

// --- T011 · kiro-specs engine -----------------------------------------------
test('T011 kiro-specs engine resolves .kiro/specs/<feature>/requirements.md', () => {
  const root = kiroFixture('Approved');
  assert.equal(kiro.id, 'kiro-specs');
  assert.deepEqual(kiro.docs, { primary: 'requirements.md', plan: 'design.md', tasks: 'tasks.md' });
  assert.deepEqual(kiro.requiredArtifacts, ['design.md', 'tasks.md']);
  assert.deepEqual(kiro.optionalArtifacts, []);
  assert.deepEqual(kiro.listSpecs(root), ['my-feature'], 'feature dirs, no NNN- filter');
  assert.equal(kiro.readStatus('my-feature', root), 'Approved', 'status from requirements.md');

  kiro.writeStatus('my-feature', 'Done', root);
  assert.equal(kiro.readStatus('my-feature', root), 'Done', 'writeStatus updates requirements.md');
  assert.match(fs.readFileSync(path.join(root, '.kiro/specs/my-feature/requirements.md'), 'utf8'), /status: Done/);
});

// --- T012 · lib.js delegation -----------------------------------------------
test('T012 lib delegates to the engine resolved from ssd', () => {
  const root = kiroFixture('Approved');
  assert.equal(lib.engineFor(root).id, 'kiro-specs');
  assert.deepEqual(lib.listSpecs(root), ['my-feature']);
  assert.equal(lib.readStatus('my-feature', root), 'Approved');
  assert.equal(lib.specPath('my-feature', root), path.join(root, '.kiro', 'specs', 'my-feature'));
  // Default (this repo) stays github-speckit.
  assert.equal(lib.engineFor(REPO_ROOT).id, 'github-speckit');
});

// --- T013 · verify consumer end-to-end under kiro-specs ----------------------
test('T013 verify-spec-compliance reads .kiro/specs under kiro-specs', () => {
  const root = kiroFixture('Approved');
  const out = execFileSync('node', [path.join(REPO_ROOT, 'scripts/speckit/verify-spec-compliance.js'), 'my-feature'], {
    cwd: root,
    encoding: 'utf8',
  });
  assert.match(out, /requirements\.md present with status "Approved"/, 'G2 reads requirements.md (engine.docs.primary)');
  assert.match(out, /design\.md present/, 'C1 requires design.md (engine.requiredArtifacts)');
  assert.doesNotMatch(out, /data-model\.md not present/, 'C2 optionalArtifacts is empty for kiro (analyze A2)');
  assert.match(out, /RESULT: COMPLIANT/, 'gate-passing kiro spec is compliant');
});

// --- T014 · gate honors the engine ------------------------------------------
test('T014 verify --gate blocks a non-gate-passing kiro feature, permits a passing one', () => {
  const blocked = kiroFixture('Draft');
  assert.throws(
    () => execFileSync('node', [path.join(REPO_ROOT, 'scripts/speckit/verify-spec-compliance.js'), 'my-feature', '--gate'], { cwd: blocked, stdio: 'pipe' }),
    'Draft kiro feature fails the gate (exit != 0)'
  );

  const ok = kiroFixture('Approved');
  const code = execFileSync('node', [path.join(REPO_ROOT, 'scripts/speckit/verify-spec-compliance.js'), 'my-feature', '--gate'], { cwd: ok, encoding: 'utf8' });
  assert.match(code, /RESULT: COMPLIANT/, 'Approved kiro feature passes the gate');
});
