'use strict';

/**
 * dispatch.test.js — the 021 CLI dispatcher (spec 009).
 * Dispatch parity + arg pass-through (T003), usage/exit codes (T004), the
 * exports surface (T005), adapters reference npx 021 (T006), npm aliases
 * unchanged (T008). The golden re-baseline (T007) is guarded by renderer.test.js.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO = path.join(__dirname, '..', '..');
const CLI = path.join(REPO, 'bin', '021.js');
const { initFramework } = require('../../scripts/init');

function run(args, opts = {}) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: 'utf8', cwd: opts.cwd || REPO });
}
function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'zto-cli-'));
}
function install(target, stack) {
  return initFramework(target, { sourceDir: REPO, quiet: true, yes: true, stack });
}
/** Concatenated text of a stack's *rendered instruction surfaces* only (not the
 * scripts/hooks/manifest tooling, which legitimately keep npm-alias references). */
function surfaceText(dir, rels) {
  return rels
    .map((r) => path.join(dir, r))
    .filter(fs.existsSync)
    .map((p) => fs.readFileSync(p, 'utf8'))
    .join('\n');
}
const SURFACES = {
  claude: ['CLAUDE.md', '.claude/commands/021-init.md', '.claude/commands/021-status.md'],
  antigravity: ['AGENTS.md', '.agents/skills/021-verify-spec-compliance/SKILL.md', '.agents/skills/021-fetch-speckit-context/SKILL.md'],
  kiro: [
    '.kiro/steering/021-product.md',
    '.kiro/steering/021-structure.md',
    '.kiro/steering/021-tech.md',
    '.kiro/skills/021-verify-spec-compliance/SKILL.md',
  ],
};

// --- T003 · dispatch parity + arg pass-through ------------------------------
test('T003 dispatch routes to the right script and forwards args', () => {
  assert.equal(run(['status']).status, 0, 'status → workflow-status, exit 0');
  assert.match(run(['phase']).stdout.trim(), /^\d+$/, 'phase → bare number');

  const verify = run(['spec', 'verify', '006']);
  assert.equal(verify.status, 0, 'spec verify 006 → exit 0');
  assert.match(verify.stdout, /006-source-layer-renderer/, 'arg 006 forwarded (no -- separator)');
  assert.match(verify.stdout, /RESULT: COMPLIANT/);

  assert.match(run(['spec', 'status', 'list']).stdout, /006-source-layer-renderer/, 'spec status list forwards "list"');
});

// --- T004 · usage & exit codes ----------------------------------------------
test('T004 usage and exit codes', () => {
  assert.equal(run([]).status, 1, 'no subcommand → exit 1');
  assert.match(run([]).stderr, /Usage: 021/, 'prints usage to stderr');
  assert.equal(run(['bogus']).status, 1, 'unknown → exit 1');
  assert.equal(run(['spec', 'bogus']).status, 1, 'unknown spec leaf → exit 1');
  const help = run(['--help']);
  assert.equal(help.status, 0, '--help → exit 0');
  assert.match(help.stdout, /Usage: 021/, '--help prints usage to stdout');
});

// --- T005 · exports programmatic API ----------------------------------------
test('T005 exports exposes lib.js; ./package.json listed', () => {
  const lib = require('../../scripts/speckit/lib.js');
  assert.equal(typeof lib.manifestFacts, 'function');
  assert.equal(typeof lib.engineFor, 'function');
  for (const pkgPath of ['package.json', 'package/package.json']) {
    const pkg = JSON.parse(fs.readFileSync(path.join(REPO, pkgPath), 'utf8'));
    assert.equal(pkg.exports['./speckit'], './scripts/speckit/lib.js', `${pkgPath} exports ./speckit`);
    assert.equal(pkg.exports['./package.json'], './package.json', `${pkgPath} keeps ./package.json resolvable`);
    assert.equal(pkg.bin['021'], 'bin/021.js', `${pkgPath} registers the 021 bin`);
  }
});

// --- T006 · adapters reference npx 021, not npm run 021- ---------------------
test('T006 rendered instruction surfaces reference npx 021 (no npm run 021-)', () => {
  for (const stack of ['claude', 'antigravity', 'kiro']) {
    const target = tmp();
    install(target, stack);
    const text = surfaceText(target, SURFACES[stack]);
    assert.ok(text.length > 0, `${stack}: instruction surfaces present`);
    assert.ok(!/npm run 021-/.test(text), `${stack}: no "npm run 021-" in the instruction surfaces`);
    assert.match(text, /npx 021 /, `${stack}: references npx 021`);
  }
});

// --- T008 · npm-script aliases unchanged ------------------------------------
test('T008 npm 021-* aliases preserved', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(REPO, 'package.json'), 'utf8'));
  for (const s of ['021-status', '021-qa', '021-doctor', '021-spec:status', '021-spec:context', '021-spec:verify']) {
    assert.ok(pkg.scripts[s], `alias ${s} still present`);
  }
  assert.match(pkg.scripts['021-status'], /workflow-status\.js/, '021-status still runs the script directly');
});
