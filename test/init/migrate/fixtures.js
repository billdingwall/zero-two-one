'use strict';

/**
 * migrate/fixtures.js — harness for the migrate suite (spec 002, T002).
 *
 * Reuses spec 001's source-package fixture and extends it with the extra
 * templates migrate exercises (README/CODE/ROADMAP/BACKLOG). Builds synthetic
 * non-empty target repos (code, docs, tool surfaces, git tags) to drive
 * detection and duplicate resolution. Node built-ins only.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const base = require('../fixtures');

const { write, read, exists, rm, snapshotTree, hashOf } = base;

function mkdtemp(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `zto-${prefix}-`));
}

/** Spec 001 source fixture + the extra templates migrate needs. */
function makeMigrateSource() {
  const dir = base.makeSourceFixture();
  write(dir, 'templates/README-Template.md', '# README (template)\n');
  write(dir, 'templates/CODE-Template.md', '# CODE (template)\n');
  write(dir, 'templates/05-ROADMAP-Template.md', '# ROADMAP (template)\n');
  write(dir, 'templates/04-BACKLOG-Template.md', '# BACKLOG (template)\n');
  return dir;
}

/** A non-empty target that looks like a real in-flight project. */
function makeTarget({ code = true } = {}) {
  const dir = mkdtemp('mig');
  if (code) write(dir, 'src/index.js', "console.log('app');\n");
  return dir;
}

/** Empty target (scaffold, not migrate). */
function makeEmptyTarget() {
  return mkdtemp('empty');
}

function git(dir, args) {
  execFileSync('git', args, { cwd: dir, stdio: ['ignore', 'ignore', 'ignore'] });
}

/** Turn a target into a Growth-signalled repo: tests + CI + a git tag. */
function makeGrowthSignals(dir) {
  write(dir, 'test/app.test.js', '// test\n');
  write(dir, '.github/workflows/ci.yml', 'name: ci\n');
  git(dir, ['init', '-q']);
  git(dir, ['config', 'user.email', 't@example.com']);
  git(dir, ['config', 'user.name', 'Tester']);
  git(dir, ['add', '-A']);
  git(dir, ['commit', '-qm', 'init', '--no-verify']);
  git(dir, ['tag', 'v1.0.0']);
}

module.exports = {
  makeMigrateSource,
  makeTarget,
  makeEmptyTarget,
  makeGrowthSignals,
  write,
  read,
  exists,
  rm,
  snapshotTree,
  hashOf,
};
