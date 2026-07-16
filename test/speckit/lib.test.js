'use strict';

/**
 * lib.test.js — manifest-as-QA-contract suite (spec 003).
 * Maps to tasks T002–T007. Run: node --test 'test/**\/*.test.js'
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const lib = require('../../scripts/speckit/lib');
const REPO = path.join(__dirname, '..', '..');
const LIB = path.join(REPO, 'scripts', 'speckit', 'lib.js');

function fixture(files = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'zto-lib-'));
  for (const [rel, content] of Object.entries(files)) {
    const abs = path.join(dir, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, content);
  }
  return dir;
}
function withManifest(obj) {
  return fixture({ '.zero-two-one.json': JSON.stringify(obj) });
}
const rm = (d) => fs.rmSync(d, { recursive: true, force: true });

// --- T002 · vocabulary mapping + stack/mode (FR-002, A2/A3) -----------------
test('T002 manifestFacts maps each phase → exact phaseNum/phaseLabel; stack/mode', () => {
  const cases = [
    ['planning', 0, 'Planning (Zero)'],
    ['mvp', 1, 'MVP Build (One)'],
    ['growth', 2, 'Growth'],
    ['prebuild', 0, 'Planning (Zero)'], // legacy alias
  ];
  for (const [phase, num, label] of cases) {
    const dir = withManifest({ phase, mode: 'scaffold', tools: { stack: 'kiro' } });
    const f = lib.manifestFacts(dir);
    assert.equal(f.phaseNum, num);
    assert.equal(f.phaseLabel, label);
    assert.equal(f.stack, 'kiro');
    assert.equal(f.mode, 'scaffold');
    assert.equal(f.source, 'manifest');
    rm(dir);
  }
  // no manifest → stack/mode null
  const empty = fixture();
  const nf = lib.manifestFacts(empty);
  assert.equal(nf.stack, null);
  assert.equal(nf.mode, null);
  rm(empty);
});

// --- T003 · resolution order (FR-001/006) -----------------------------------
test('T003 resolution: manifest → inference (specs→mvp, else planning)', () => {
  const withSpecs = fixture({ 'specs/foo.md': '# f' });
  assert.equal(lib.manifestFacts(withSpecs).phaseNum, 1);
  assert.equal(lib.manifestFacts(withSpecs).source, 'inferred');
  rm(withSpecs);

  const bare = fixture({ 'README.md': '# r' });
  assert.equal(lib.manifestFacts(bare).phaseNum, 0);
  assert.equal(lib.manifestFacts(bare).phaseLabel, 'Planning (Zero)');
  rm(bare);

  // _INDEX.md alone does not count as a spec
  const idxOnly = fixture({ 'specs/_INDEX.md': '# i' });
  assert.equal(lib.manifestFacts(idxOnly).phaseNum, 0);
  rm(idxOnly);
});

// --- T004 · readManifest robustness (FR-001/006) ----------------------------
test('T004 readManifest → null on missing/corrupt; corrupt → warn + inference', () => {
  const missing = fixture();
  assert.equal(lib.readManifest(missing), null);
  rm(missing);

  const corrupt = fixture({ '.zero-two-one.json': '{not json' });
  assert.equal(lib.readManifest(corrupt), null);
  // manifestFacts falls back to inference without throwing
  const f = lib.manifestFacts(corrupt);
  assert.equal(f.source, 'inferred');
  assert.equal(f.phaseNum, 0);
  rm(corrupt);
});

// --- T005 · CLI (FR-003, contract) ------------------------------------------
test('T005 `lib.js phase` prints phaseNum to stdout; unknown sub → non-zero', () => {
  const dir = withManifest({ phase: 'growth' });
  const out = execFileSync('node', [LIB, 'phase'], { cwd: dir, encoding: 'utf8' });
  assert.equal(out.trim(), '2');
  rm(dir);

  assert.throws(() => execFileSync('node', [LIB, 'bogus'], { cwd: REPO, stdio: 'pipe' }));
});

// --- T006 · grep-guard (FR-001, A1 scope) -----------------------------------
test('T006 lifecycle scripts: no scrape, vocabulary + parse only in lib.js', () => {
  const runQa = fs.readFileSync(path.join(REPO, 'scripts', 'run-qa.sh'), 'utf8');
  assert.ok(!/workflow-status\.js --json/.test(runQa), 'run-qa.sh must not scrape workflow-status --json');

  const status = fs.readFileSync(path.join(REPO, 'scripts', 'workflow-status.js'), 'utf8');
  assert.ok(!/PHASE_FROM_MANIFEST/.test(status), 'workflow-status.js must not keep its own vocabulary map');
  assert.ok(!/readFileSync/.test(status), 'workflow-status.js must not read the manifest itself');

  // The vocabulary label lives in exactly one lifecycle file (lib.js), excluding scripts/init/.
  const holders = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name === 'init' || e.name === 'node_modules') continue;
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(js|sh)$/.test(e.name) && /MVP Build \(One\)/.test(fs.readFileSync(p, 'utf8'))) {
        holders.push(path.relative(REPO, p));
      }
    }
  })(path.join(REPO, 'scripts'));
  assert.deepEqual(holders, ['scripts/speckit/lib.js'], `vocabulary label duplicated: ${holders}`);
});

// --- T007 · --json shape preserved (FR-004) ---------------------------------
test('T007 workflow-status.js --json preserves { phase:num, status, source }', () => {
  const out = execFileSync('node', [path.join(REPO, 'scripts', 'workflow-status.js'), '--json'], {
    cwd: REPO,
    encoding: 'utf8',
  });
  const j = JSON.parse(out);
  assert.equal(typeof j.phase, 'number');
  assert.equal(typeof j.status, 'string');
  assert.ok(['manifest', 'inferred'].includes(j.source));
});
