'use strict';

/**
 * classes.js — file ownership classification (spec 001 FR-001, TDD §6).
 *
 * Every managed path resolves to one of four classes, which drive install,
 * re-run, and upgrade behavior. `bin/` and the framework's own `specs/` are
 * excluded from the install surface entirely (analyze A3): the CLI ships in
 * the npm package, and each project authors its own specs.
 *
 * The install surface is **stack-parameterized** (spec 006, TDD §9.1): Layer-1
 * dirs install identically for every stack, while the per-stack command/skill
 * dirs and the rendered entrypoint doc come from the adapter registry. A
 * non-chosen stack's Layer-2 paths classify as `null` (outside the managed
 * surface) so they are never created or refreshed.
 */

const path = require('path');
const { getAdapter } = require('./adapters');

const CLASS = {
  FRAMEWORK: 'framework-owned',
  USER: 'user-owned',
  MERGED: 'merged',
  GENERATED: 'generated',
};

/** Stack-invariant framework dirs (Layer 1) — copied verbatim for every stack. */
const LAYER1_DIRS = [
  'scripts',
  'hooks',
  'skills',
  'workflow',
  'templates',
  '.github',
];

/** User-owned guiding docs common to every stack (the entrypoint is per-stack). */
const USER_FILES_COMMON = ['CODE.md', 'PRODUCT.md', 'DESIGN.md', 'README.md'];

/** requirements/*.md docs are user-owned (matched by prefix + suffix). */
const USER_REQUIREMENTS_DOCS = [
  '01-PRD.md',
  '02-EDD.md',
  '03-TDD.md',
  '04-BACKLOG.md',
  '05-ROADMAP.md',
];

/** Merged files — additive, user values/deletions respected (FR-005). */
const MERGED_FILES = ['.gitignore', 'package.json'];

/** Generated — provisioned empty, then left (FR-006). */
const GENERATED_DIRS = [path.join('.ai', 'context')];

/** Excluded from the install surface entirely (analyze A3). */
const EXCLUDED_DIRS = ['bin', 'specs', 'node_modules', '.git'];

/** Framework-owned dirs for a stack = Layer-1 base + the stack's Layer-2 surface dirs. */
function frameworkDirs(stack) {
  return [...LAYER1_DIRS, ...getAdapter(stack).surfaceDirs];
}

/** User-owned guiding docs for a stack = the rendered entrypoint + the common set. */
function userFiles(stack) {
  return [getAdapter(stack).entrypoint.dest, ...USER_FILES_COMMON];
}

/** Normalize a relative path to POSIX separators for stable comparison/keys. */
function toPosix(relPath) {
  return relPath.split(path.sep).join('/');
}

function isUnder(relPath, dir) {
  const p = toPosix(relPath);
  const d = toPosix(dir);
  return p === d || p.startsWith(d + '/');
}

/**
 * Classify a target-relative path for a given stack. Returns a CLASS.* value,
 * or null when the path is outside the managed surface (excluded, or belonging
 * to a non-chosen stack's Layer-2 surface). `stack` defaults to `claude`
 * (FR-007 back-compat).
 */
function classify(relPath, stack = 'claude') {
  const p = toPosix(relPath);

  if (EXCLUDED_DIRS.some((d) => isUnder(p, d))) return null;

  if (GENERATED_DIRS.some((d) => isUnder(p, d))) return CLASS.GENERATED;
  if (MERGED_FILES.includes(p)) return CLASS.MERGED;
  if (userFiles(stack).includes(p)) return CLASS.USER;
  if (p.startsWith('requirements/') && USER_REQUIREMENTS_DOCS.includes(p.slice('requirements/'.length))) {
    return CLASS.USER;
  }
  if (frameworkDirs(stack).some((d) => isUnder(p, d))) return CLASS.FRAMEWORK;

  return null;
}

module.exports = {
  CLASS,
  LAYER1_DIRS,
  USER_FILES_COMMON,
  USER_REQUIREMENTS_DOCS,
  MERGED_FILES,
  GENERATED_DIRS,
  EXCLUDED_DIRS,
  frameworkDirs,
  userFiles,
  classify,
  toPosix,
  isUnder,
};
