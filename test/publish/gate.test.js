'use strict';

/**
 * gate.test.js — pre-publish gate acceptance suite (spec 014).
 * Maps to tasks T003–T010; each test exercises one gate check against a
 * fixture package/ tree. The link check (d) is exercised via an injected
 * `checkLinks` fake, since check-links.js scans its own repo root, not a
 * fixture (analyze A7). Node built-ins only.
 */

const { test } = require('node:test');
const assert = require('node:assert');

const { prepublishGate } = require('../../scripts/prepublish-gate');
const fx = require('./fixtures');

/** Run the gate over a fixture with links forced clean unless overridden. */
function gate(f, opts = {}) {
  return prepublishGate({ root: f.root, packageDir: f.packageDir, checkLinks: () => ({ ok: true }), ...opts });
}

// --- T003 · clean passes ----------------------------------------------------
test('T003 clean fixture passes; .ai/context/.gitkeep alone does not trip (c)', () => {
  const f = fx.makeClean();
  const r = gate(f);
  assert.deepStrictEqual(r.failures, [], `unexpected failures: ${r.failures.join('; ')}`);
  assert.strictEqual(r.ok, true);
  fx.cleanup(f);
});

// --- T004 · dangling main ---------------------------------------------------
test('T004 dangling main fails, naming the target', () => {
  const f = fx.makeClean();
  fx.injectDanglingMain(f, './nope.js');
  const r = gate(f);
  assert.strictEqual(r.ok, false);
  assert.ok(r.failures.some((m) => /main/i.test(m) && /nope\.js/.test(m)), r.failures.join('; '));
  fx.cleanup(f);
});

// --- T005 · missing LICENSE -------------------------------------------------
test('T005 missing root LICENSE fails', () => {
  const f = fx.makeClean();
  fx.removeLicense(f);
  const r = gate(f);
  assert.strictEqual(r.ok, false);
  assert.ok(r.failures.some((m) => /license/i.test(m)), r.failures.join('; '));
  fx.cleanup(f);
});

// --- T006 · .ai/context bundle ----------------------------------------------
test('T006 a .ai/context bundle in the tarball fails (c); .gitkeep still passes', () => {
  const f = fx.makeClean();
  fx.injectAiBundle(f, '013-e2e-test.md');
  const r = gate(f);
  assert.strictEqual(r.ok, false);
  assert.ok(r.failures.some((m) => /\.ai\/context/.test(m) && /013-e2e-test\.md/.test(m)), r.failures.join('; '));
  fx.cleanup(f);
});

// --- T007 · broken links (injected) -----------------------------------------
test('T007 a broken-links result fails the gate (d)', () => {
  const f = fx.makeClean();
  const r = gate(f, { checkLinks: () => ({ ok: false, detail: '2 broken link(s)' }) });
  assert.strictEqual(r.ok, false);
  assert.ok(r.failures.some((m) => /link/i.test(m)), r.failures.join('; '));
  fx.cleanup(f);
});

// --- T008 · spec/dev leak (tarball-aware) -----------------------------------
test('T008 an internal spec in the tarball fails (e) — tarball-aware', () => {
  const f = fx.makeClean();
  fx.injectSpecLeak(f, 'specs/099-leak/spec.md');
  const r = gate(f);
  assert.strictEqual(r.ok, false);
  assert.ok(r.failures.some((m) => /specs\/099-leak\/spec\.md/.test(m)), r.failures.join('; '));
  fx.cleanup(f);
});

test('T008b a dev-only file in the tarball fails (e)', () => {
  const f = fx.makeClean();
  // sync-to-package.js is dev-only and must never ship.
  require('fs').writeFileSync(require('path').join(f.packageDir, 'scripts', 'sync-to-package.js'), '// dev\n');
  const r = gate(f);
  assert.strictEqual(r.ok, false);
  assert.ok(r.failures.some((m) => /sync-to-package\.js/.test(m)), r.failures.join('; '));
  fx.cleanup(f);
});

// --- T009 · trivial README --------------------------------------------------
test('T009 a trivial shipped README fails (f)', () => {
  const f = fx.makeClean();
  fx.makeReadmeTrivial(f);
  const r = gate(f);
  assert.strictEqual(r.ok, false);
  assert.ok(r.failures.some((m) => /readme/i.test(m)), r.failures.join('; '));
  fx.cleanup(f);
});

// --- T010 · report/exit shape -----------------------------------------------
test('T010 failures carry a specific reason; ok reflects failure count', () => {
  const f = fx.makeClean();
  fx.removeLicense(f);
  fx.injectSpecLeak(f);
  const r = gate(f);
  assert.strictEqual(r.ok, false);
  assert.ok(r.failures.length >= 2, `expected >=2 failures, got ${r.failures.length}`);
  for (const m of r.failures) assert.ok(typeof m === 'string' && m.length > 0);
  fx.cleanup(f);
});
