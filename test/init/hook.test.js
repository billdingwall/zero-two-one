'use strict';

/**
 * hook.test.js — conflict-aware pre-commit install suite (spec 005).
 * Maps to tasks T002–T009. Run: node --test 'test/**\/*.test.js'
 */

const { test } = require('node:test');
const assert = require('node:assert');

const { detectHookSituation, installHook, BLOCK_START } = require('../../scripts/init/hook');
const fx = require('./hook-fixtures');

// --- T002 · detection + precedence ------------------------------------------
test('T002 detectHookSituation classifies with precedence', () => {
  let d = fx.build(); assert.equal(detectHookSituation(d), 'none'); fx.rm(d);
  d = fx.build({ plain: true }); assert.equal(detectHookSituation(d), 'plain'); fx.rm(d);
  d = fx.build({ husky: true }); assert.equal(detectHookSituation(d), 'husky'); fx.rm(d);
  d = fx.build({ lefthook: true }); assert.equal(detectHookSituation(d), 'lefthook'); fx.rm(d);
  // manager wins over a bare .git/hooks shim
  d = fx.build({ plain: true, husky: true }); assert.equal(detectHookSituation(d), 'husky'); fx.rm(d);
});

// --- T003 · none → direct ---------------------------------------------------
test('T003 none → gate installed directly at .git/hooks/pre-commit', () => {
  const d = fx.build();
  assert.equal(installHook(d).strategy, 'direct');
  assert.ok(fx.read(d, '.git/hooks/pre-commit').includes('Zero Two One pre-commit hook'));
  assert.ok(fx.isExec(d, '.git/hooks/pre-commit'));
  fx.rm(d);
});

// --- T004 · plain → chained gate-first --------------------------------------
test('T004 plain → guarded block after shebang; user hook preserved; gate runs despite exit 0', () => {
  const d = fx.build({ plain: true });
  assert.equal(installHook(d).strategy, 'chain-plain');
  const hook = fx.read(d, '.git/hooks/pre-commit');
  assert.ok(hook.includes(fx.SENTINEL), 'user hook preserved');
  assert.ok(hook.includes(BLOCK_START), 'guarded block inserted');
  // block sits before the user's `exit 0` (gate-first → runs even though hook exits)
  assert.ok(hook.indexOf(BLOCK_START) < hook.indexOf(fx.SENTINEL), 'gate is first');
  assert.ok(hook.split('\n')[0].startsWith('#!'), 'shebang still first line');
  assert.ok(fx.exists(d, '.git/hooks/pre-commit.zto') && fx.isExec(d, '.git/hooks/pre-commit.zto'));
  fx.rm(d);
});

// --- T005 · husky -----------------------------------------------------------
test('T005 husky → block in .husky/pre-commit; .git/hooks/pre-commit not written', () => {
  const d = fx.build({ husky: true });
  assert.equal(installHook(d).strategy, 'husky');
  assert.ok(fx.read(d, '.husky/pre-commit').includes(BLOCK_START));
  assert.ok(!fx.exists(d, '.git/hooks/pre-commit'), '.git/hooks/pre-commit untouched');
  fx.rm(d);
});

// --- T006 · lefthook report-only --------------------------------------------
test('T006 lefthook → strategy manual; config byte-unchanged; snippet returned', () => {
  const d = fx.build({ lefthook: true });
  const before = fx.read(d, 'lefthook.yml');
  const res = installHook(d);
  assert.equal(res.strategy, 'manual');
  assert.match(res.message, /pre-commit:/);
  assert.equal(fx.read(d, 'lefthook.yml'), before, 'lefthook.yml byte-unchanged');
  fx.rm(d);
});

// --- T007 · idempotent re-run (direct + chained) ----------------------------
test('T007 re-run is already-installed; no duplicate block, no rewrite', () => {
  // chained
  const d = fx.build({ plain: true });
  installHook(d);
  const afterFirst = fx.read(d, '.git/hooks/pre-commit');
  assert.equal(detectHookSituation(d), 'already-installed', 'chained repo detected as already-installed');
  const res = installHook(d);
  assert.equal(res.strategy, 'chain-plain');
  const afterSecond = fx.read(d, '.git/hooks/pre-commit');
  assert.equal(afterSecond, afterFirst, 'no second block / no rewrite');
  assert.equal((afterSecond.match(new RegExp(BLOCK_START.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length, 1);
  fx.rm(d);

  // direct
  const d2 = fx.build();
  installHook(d2);
  assert.equal(detectHookSituation(d2), 'already-installed');
  assert.equal(installHook(d2).strategy, 'direct');
  fx.rm(d2);
});

// --- T008 · sentinel guardrail ----------------------------------------------
test('T008 no strategy ever overwrites/empties a user hook or config', () => {
  for (const setup of [{ plain: true }, { husky: true, huskyHook: true }, { lefthook: true }]) {
    const d = fx.build(setup);
    installHook(d);
    // whichever user file existed still contains the sentinel, in full
    const files = ['.git/hooks/pre-commit', '.husky/pre-commit', 'lefthook.yml'].filter((f) => fx.exists(d, f));
    assert.ok(files.some((f) => fx.read(d, f).includes(fx.SENTINEL)), `sentinel preserved for ${JSON.stringify(setup)}`);
    fx.rm(d);
  }
});

// --- T009 · manifest.hook + non-git -----------------------------------------
test('T009 non-git → inactive-no-git strategy', () => {
  const d = fx.build({ git: false });
  assert.equal(installHook(d).strategy, 'inactive-no-git');
  assert.ok(!fx.exists(d, '.git/hooks/pre-commit'));
  fx.rm(d);
});
