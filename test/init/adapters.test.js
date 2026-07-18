'use strict';

/**
 * adapters.test.js — stack registry + stack-aware ownership (spec 006).
 * Unit-level: getAdapter (T003), classify stack-awareness (T007),
 * userDocMappings render/instantiate tags (T008), default-claude (T010).
 */

const { test } = require('node:test');
const assert = require('node:assert');
const path = require('path');

const { getAdapter, ADAPTERS } = require('../../scripts/init/adapters');
const { classify, CLASS } = require('../../scripts/init/classes');
const { userDocMappings } = require('../../scripts/init/sources');

const REPO_ROOT = path.join(__dirname, '..', '..');

// --- T003 · getAdapter ------------------------------------------------------
test('T003 getAdapter: claude/antigravity resolve; absent/unknown → claude; kiro throws', () => {
  assert.equal(getAdapter('claude').entrypoint.dest, 'CLAUDE.md');
  assert.deepEqual(getAdapter('claude').surfaceDirs, ['.claude/commands']);
  assert.equal(getAdapter('antigravity').entrypoint.dest, 'AGENTS.md');
  assert.deepEqual(getAdapter('antigravity').surfaceDirs, [], 'antigravity skills tree is spec 007');

  assert.equal(getAdapter(undefined), ADAPTERS.claude, 'absent → claude (FR-007)');
  assert.equal(getAdapter('nonsense'), ADAPTERS.claude, 'unknown → claude');

  assert.throws(() => getAdapter('kiro'), /not yet supported/, 'reserved stack fails loudly (analyze A5)');
});

// --- T007 · classify is stack-aware -----------------------------------------
test('T007 classify: Layer-2 paths depend on the active stack', () => {
  // claude owns .claude/commands and CLAUDE.md
  assert.equal(classify('.claude/commands/021-status.md', 'claude'), CLASS.FRAMEWORK);
  assert.equal(classify('CLAUDE.md', 'claude'), CLASS.USER);
  assert.equal(classify('AGENTS.md', 'claude'), null, 'AGENTS.md is not a claude path');

  // antigravity owns AGENTS.md; the claude command surface is unmanaged for it
  assert.equal(classify('.claude/commands/021-status.md', 'antigravity'), null, 'not framework-owned under antigravity (FR-009)');
  assert.equal(classify('AGENTS.md', 'antigravity'), CLASS.USER);
  assert.equal(classify('CLAUDE.md', 'antigravity'), null);

  // Layer-1 classifies identically for every stack
  for (const stack of ['claude', 'antigravity']) {
    assert.equal(classify('scripts/run-qa.sh', stack), CLASS.FRAMEWORK);
    assert.equal(classify('skills/verify.md', stack), CLASS.FRAMEWORK);
    assert.equal(classify('CODE.md', stack), CLASS.USER);
    assert.equal(classify('requirements/01-PRD.md', stack), CLASS.USER);
    assert.equal(classify('bin/init.js', stack), null, 'bin/ excluded');
    assert.equal(classify('specs/_INDEX.md', stack), null, 'specs/ excluded');
  }
});

// --- T008 · userDocMappings render/instantiate tags -------------------------
test('T008 userDocMappings: entrypoint is render, other docs are instantiate', () => {
  const claude = userDocMappings(REPO_ROOT, 'claude');
  const entry = claude.find((m) => m.action === 'render');
  assert.ok(entry, 'a render mapping exists');
  assert.equal(entry.template, 'ASSISTANT-Template.md');
  assert.equal(entry.dest, 'CLAUDE.md');
  assert.equal(claude.filter((m) => m.action === 'render').length, 1, 'exactly one entrypoint render');

  const code = claude.find((m) => m.dest === 'CODE.md');
  assert.equal(code.action, 'instantiate');

  const ag = userDocMappings(REPO_ROOT, 'antigravity');
  assert.equal(ag.find((m) => m.action === 'render').dest, 'AGENTS.md');
  assert.ok(!ag.some((m) => m.dest === 'CLAUDE.md'), 'no CLAUDE.md mapping under antigravity');
});

// --- T010 · default claude when stack omitted -------------------------------
test('T010 default stack is claude (FR-007 back-compat)', () => {
  assert.equal(classify('CLAUDE.md'), CLASS.USER);
  assert.equal(classify('.claude/commands/021-init.md'), CLASS.FRAMEWORK);
  assert.equal(userDocMappings(REPO_ROOT).find((m) => m.action === 'render').dest, 'CLAUDE.md');
});
