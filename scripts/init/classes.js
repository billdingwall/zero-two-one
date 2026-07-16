'use strict';

/**
 * classes.js — file ownership classification (spec 001 FR-001, TDD §6).
 *
 * Every managed path resolves to one of four classes, which drive install,
 * re-run, and upgrade behavior. `bin/` and the framework's own `specs/` are
 * excluded from the install surface entirely (analyze A3): the CLI ships in
 * the npm package, and each project authors its own specs.
 */

const path = require('path');

const CLASS = {
  FRAMEWORK: 'framework-owned',
  USER: 'user-owned',
  MERGED: 'merged',
  GENERATED: 'generated',
};

/** Top-level directories copied verbatim as framework-owned (TDD §6). */
const FRAMEWORK_DIRS = [
  'scripts',
  'hooks',
  'skills',
  'workflow',
  'templates',
  '.github',
  path.join('.claude', 'commands'),
];

/** User-owned instantiated docs (create-if-missing from templates, FR-017). */
const USER_FILES = [
  'CLAUDE.md',
  'CODE.md',
  'PRODUCT.md',
  'DESIGN.md',
  'README.md',
];

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
 * Classify a target-relative path. Returns a CLASS.* value, or null when the
 * path is outside the managed surface (excluded).
 */
function classify(relPath) {
  const p = toPosix(relPath);

  if (EXCLUDED_DIRS.some((d) => isUnder(p, d))) return null;

  if (GENERATED_DIRS.some((d) => isUnder(p, d))) return CLASS.GENERATED;
  if (MERGED_FILES.includes(p)) return CLASS.MERGED;
  if (USER_FILES.includes(p)) return CLASS.USER;
  if (p.startsWith('requirements/') && USER_REQUIREMENTS_DOCS.includes(p.slice('requirements/'.length))) {
    return CLASS.USER;
  }
  if (FRAMEWORK_DIRS.some((d) => isUnder(p, d))) return CLASS.FRAMEWORK;

  return null;
}

module.exports = {
  CLASS,
  FRAMEWORK_DIRS,
  USER_FILES,
  USER_REQUIREMENTS_DOCS,
  MERGED_FILES,
  GENERATED_DIRS,
  EXCLUDED_DIRS,
  classify,
  toPosix,
  isUnder,
};
