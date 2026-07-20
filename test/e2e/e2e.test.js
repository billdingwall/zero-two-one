'use strict';

/**
 * e2e.test.js — end-to-end suite (spec 013). Runs a REAL install of the shipped
 * `package/` tarball against pristine git repos, across {claude,antigravity,kiro}
 * × {scaffold,migrate}, then proves the pre-commit gate with a real `git commit`.
 *
 * Standalone lane — NOT part of `npm test`. Run: `npm run test:e2e`
 * (`node --test test/e2e/`). Node built-ins only.
 */

const { test, before, after } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const h = require('./harness');

const STACKS = ['claude', 'antigravity', 'kiro'];
const MODES = ['scaffold', 'migrate'];

let ctx;

before(() => {
  // Pack the shipped artifact + install once. Heaviest step; gates every cell.
  ctx = h.packAndInstall();
});

after(() => {
  // Remove the toolbox + every provisioned target on pass or fail (FR-006).
  h.teardown();
});

for (const stack of STACKS) {
  for (const mode of MODES) {
    test(`${stack} · ${mode}`, () => {
      const target = h.provisionTarget(mode);
      h.runInit(ctx.BIN_INIT, target, stack, mode);

      h.assertSurface(target, stack); // FR-002 + A6
      h.assertManifest(ctx.SPECKIT, target, { stack, mode, ssd: h.SSD[stack] }); // FR-003 + A4
      h.assertLifecycleGreen(ctx.BIN_021, target); // FR-003 + A3
      if (mode === 'migrate') h.assertNonDestructive(target); // FR-002

      h.proveGate(ctx.BIN_021, target, stack); // FR-004 + A1 (real commit, engine-aware)
    });
  }
}

// The e2e stays isolated from the fast lanes and ships nothing (FR-005/007/010).
test('meta: test:e2e is isolated, CI-wired, and ships nothing', () => {
  const pkg = require(path.join(h.REPO_ROOT, 'package.json'));
  assert.strictEqual(pkg.scripts['test:e2e'], 'node --test test/e2e/*.test.js', 'root test:e2e script missing/incorrect');
  assert.ok(!/test:e2e/.test(pkg.scripts.test || ''), 'test:e2e must NOT be part of the default `npm test`');

  const ci = fs.readFileSync(path.join(h.REPO_ROOT, '.github/workflows/ci.yml'), 'utf8');
  assert.match(ci, /npm run test:e2e/, 'CI e2e job missing from .github/workflows/ci.yml');

  // Nothing new entered the package — sh() throws on drift (packAndInstall
  // already removed the packed tarball from package/).
  h.sh('npm run sync:package -- --check', { cwd: h.REPO_ROOT });
});
