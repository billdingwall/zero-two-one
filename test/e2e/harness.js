'use strict';

/**
 * harness.js — end-to-end test harness (spec 013).
 *
 * Packs the *shipped* `package/` tarball, installs it once into a throwaway
 * toolbox, then drives the installed CLI (`bin/init.js`, `bin/021.js`) against
 * pristine git repos — the real flow a consumer takes. Helpers below encode the
 * acceptance assertions; `e2e.test.js` composes them into the 3×2 matrix + the
 * pre-commit-gate proof. Node built-ins only (FR-007).
 *
 * Grounded in plan.md / contracts/e2e-harness.md. Every temp path is tracked and
 * removed by `teardown()` (FR-006).
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const assert = require('assert');

const REPO_ROOT = path.join(__dirname, '..', '..');

/** Per-stack install-surface signature (verified against a real install). */
const SURFACE = {
  claude: ['CLAUDE.md', '.claude/commands/021-status.md'],
  antigravity: ['AGENTS.md', '.agents/skills/021-status/SKILL.md'],
  kiro: ['.kiro/steering/021-product.md', '.kiro/agents/021.json'],
};

/** The SSD engine each stack resolves to (drives the gate-proof spec path). */
const SSD = { claude: 'github-speckit', antigravity: 'github-speckit', kiro: 'kiro-specs' };

const _tmp = []; // every mkdtemp() dir, for teardown

function mkdtemp(tag) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), `zto-${tag}-`));
  _tmp.push(d);
  return d;
}

function write(root, rel, body) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
  return p;
}

function rmrf(p) {
  try { fs.rmSync(p, { recursive: true, force: true }); } catch (_) { /* best-effort */ }
}

/** Throw-on-failure exec for setup steps. `argv` is a string (space-split) or array. */
function sh(argv, opts = {}) {
  const [cmd, ...args] = Array.isArray(argv) ? argv : argv.split(' ');
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  if (r.status !== 0) {
    throw new Error(
      `setup command failed (exit ${r.status}): ${cmd} ${args.join(' ')}\n` +
        `${r.stdout || ''}\n${r.stderr || ''}`,
    );
  }
  return r;
}

/** Non-throwing exec for assertion steps → { code, stdout, stderr }. */
function run(argv, opts = {}) {
  const [cmd, ...args] = Array.isArray(argv) ? argv : argv.split(' ');
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  return { code: r.status, stdout: r.stdout || '', stderr: r.stderr || '' };
}

function git(target, args, opts = {}) {
  return run(['git', '-C', target, ...args], opts);
}

// --- Global setup: pack the shipped artifact, install once ------------------

/**
 * Pack `package/` (the real 108-file publish artifact — TDD §14) and install it
 * into a throwaway toolbox. Returns the installed bin paths + the shipped
 * `zero-two-one/speckit` export (resolved via the package `exports` map, which
 * doubles as a spec-009 exports check). FR-001/008.
 */
function packAndInstall() {
  // 1. Fail fast on package drift, so we pack a faithful artifact.
  sh('npm run sync:package -- --check', { cwd: REPO_ROOT });

  // 2. Pack from package/ — NOT the repo root (that would ship the dev tree).
  const pkgDir = path.join(REPO_ROOT, 'package');
  const packed = sh(['npm', 'pack'], { cwd: pkgDir });
  const tgzName = packed.stdout.trim().split('\n').pop().trim();
  const tgz = path.join(pkgDir, tgzName);

  // 3. Install once into a toolbox; targets stay pristine (no node_modules).
  const toolbox = mkdtemp('toolbox');
  write(toolbox, 'package.json', JSON.stringify({ name: 'zto-e2e-toolbox', private: true }) + '\n');
  sh(['npm', 'install', '--prefer-offline', '--no-audit', '--no-fund', tgz], { cwd: toolbox });

  // The tarball is now installed in the toolbox; remove it from package/ so a
  // later `sync:package --check` (the meta test) sees a clean tree.
  rmrf(tgz);

  const modDir = path.join(toolbox, 'node_modules', 'zero-two-one');
  // Resolve through the package `exports` map — throws if it is misconfigured.
  const speckitEntry = require.resolve('zero-two-one/speckit', { paths: [toolbox] });

  return {
    toolbox,
    BIN_INIT: path.join(modDir, 'bin', 'init.js'),
    BIN_021: path.join(modDir, 'bin', '021.js'),
    SPECKIT: require(speckitEntry),
  };
}

// --- Per-cell provisioning + install ----------------------------------------

/** A fresh git repo. `migrate` seeds a real working project; `scaffold` is bare. */
function provisionTarget(mode) {
  const target = mkdtemp(mode);
  sh(['git', '-C', target, 'init', '-q']);
  sh(['git', '-C', target, 'config', 'user.email', 't@e.com']);
  sh(['git', '-C', target, 'config', 'user.name', 'Test']);

  if (mode === 'migrate') {
    // Migrate trigger: a non-framework, NON-code doc keeps the detected phase at
    // planning (a code file would flip it to mvp → qa code tier → fail). README/
    // CODE.md are framework surface and would NOT trigger migrate (analyze A2).
    write(target, 'docs/overview.md', '# Project Overview\n\nExisting user documentation.\n');
    // A user-owned framework doc, to prove create-if-missing preservation.
    write(target, 'CODE.md', '# my code rules\n');
    // A pre-existing hook, to prove chaining (not clobbering). Under .git/ so it
    // is NOISE-ignored and not itself a migrate trigger.
    const hook = write(target, '.git/hooks/pre-commit', '#!/bin/sh\necho USER-HOOK\nexit 0\n');
    fs.chmodSync(hook, 0o755);
  }
  return target;
}

/** Run the installed init against a target. Asserts exit 0. FR-001/002. */
function runInit(BIN_INIT, target, stack, mode) {
  // --yes is belt-and-suspenders: spawnSync has no TTY, so the migrate interview
  // is already non-interactive (analyze A5).
  const extra = mode === 'migrate' ? ['--yes'] : [];
  const r = run(['node', BIN_INIT, target, '--stack', stack, ...extra]);
  assert.strictEqual(r.code, 0, `init(${stack}/${mode}) exited ${r.code}\n${r.stderr}`);
  return r;
}

/** Run the installed `021` CLI in the target's project scope. */
function run021(BIN_021, target, args) {
  return run(['node', BIN_021, ...args], { cwd: target });
}

// --- Assertions -------------------------------------------------------------

/** The stack's surface signature + the full key-doc trio + gate script. FR-002/A6. */
function assertSurface(target, stack) {
  const files = [
    ...SURFACE[stack],
    'requirements/01-PRD.md',
    'requirements/02-EDD.md', // full trio so a qa-green cell can't mask a gap (A6)
    'requirements/03-TDD.md',
    'hooks/pre-commit',
    '.zero-two-one.json',
  ];
  for (const rel of files) {
    assert.ok(fs.existsSync(path.join(target, rel)), `${stack}: missing surface file ${rel}`);
  }
}

/** Manifest facts via the SHIPPED parser — one call carries mode too (A4). FR-003. */
function assertManifest(SPECKIT, target, { stack, mode, ssd }) {
  const f = SPECKIT.manifestFacts(target);
  assert.strictEqual(f.stack, stack, `manifest stack: ${f.stack} != ${stack}`);
  assert.strictEqual(f.mode, mode, `manifest mode: ${f.mode} != ${mode}`);
  assert.strictEqual(f.ssd, ssd, `manifest ssd: ${f.ssd} != ${ssd}`);
  assert.strictEqual(f.phase, 'planning', `manifest phase: ${f.phase} != planning`);
}

/** status / qa / doctor each exit 0 (doctor: advisory ⇒ 0, A3). FR-003. */
function assertLifecycleGreen(BIN_021, target) {
  for (const cmd of ['status', 'qa', 'doctor']) {
    const r = run021(BIN_021, target, [cmd]);
    assert.strictEqual(r.code, 0, `021 ${cmd} exited ${r.code}\n${r.stdout}\n${r.stderr}`);
  }
}

/** Migrate: user content preserved byte-for-byte; original hook chained. FR-002. */
function assertNonDestructive(target) {
  assert.match(fs.readFileSync(path.join(target, 'docs/overview.md'), 'utf8'), /Existing user documentation/);
  assert.match(fs.readFileSync(path.join(target, 'CODE.md'), 'utf8'), /my code rules/);
  const hook = fs.readFileSync(path.join(target, '.git/hooks/pre-commit'), 'utf8');
  assert.match(hook, /USER-HOOK/, 'original hook body was clobbered');
  assert.match(hook, /pre-commit\.zto/, 'gate was not chained into the existing hook');
}

/** Write the engine-appropriate spec doc for a stack at a given status. */
function writeSpec(target, stack, feature, status) {
  const body = `---\nstatus: ${status}\n---\n\n# ${feature}\n\nprobe.\n`;
  if (SSD[stack] === 'kiro-specs') {
    write(target, path.join('.kiro/specs', feature, 'requirements.md'), body);
  } else {
    write(target, path.join('specs', feature, 'spec.md'), body);
  }
}

/**
 * Prove the refinement gate end-to-end via a REAL git commit (FR-004, Scenario 3).
 * Blocked while the spec is Draft; allowed once Approved. Engine-aware.
 */
function proveGate(BIN_021, target, stack) {
  const feature = '042-e2e-probe';

  // Born HEAD: a fresh install has no commits; on an unborn branch the branch
  // name won't resolve and the gate can't evaluate (analyze A1, verified). The
  // gate is skipped off a non-NNN- branch, so this initial commit is unblocked.
  sh(['git', '-C', target, 'add', '-A']);
  sh(['git', '-C', target, 'commit', '-q', '-m', 'init']);

  git(target, ['checkout', '-q', '-b', feature]);
  writeSpec(target, stack, feature, 'Draft');
  write(target, 'src/feature.js', '// probe\n'); // OUTSIDE the hook exclude surface (analyze A1/R3)
  git(target, ['add', '-A']);

  const blocked = git(target, ['commit', '-m', 'impl']);
  assert.notStrictEqual(blocked.code, 0, `gate should BLOCK a Draft-spec commit (${stack})`);
  assert.match(blocked.stdout + blocked.stderr, /COMMIT BLOCKED/, `gate block message missing (${stack})`);

  const set = run021(BIN_021, target, ['spec', 'status', 'set', feature, 'Approved']);
  assert.strictEqual(set.code, 0, `021 spec status set failed (${stack})\n${set.stdout}\n${set.stderr}`);
  git(target, ['add', '-A']); // stage the status-file change

  const allowed = git(target, ['commit', '-m', 'impl']);
  assert.strictEqual(allowed.code, 0, `gate should ALLOW an Approved-spec commit (${stack})\n${allowed.stdout}\n${allowed.stderr}`);
}

/** Remove every temp dir created here + any extras. Call from after()/finally. */
function teardown(extra = []) {
  for (const p of [..._tmp, ...extra]) rmrf(p);
  _tmp.length = 0;
}

module.exports = {
  REPO_ROOT,
  SURFACE,
  SSD,
  sh,
  run,
  git,
  write,
  mkdtemp,
  packAndInstall,
  provisionTarget,
  runInit,
  run021,
  assertSurface,
  assertManifest,
  assertLifecycleGreen,
  assertNonDestructive,
  writeSpec,
  proveGate,
  teardown,
};
