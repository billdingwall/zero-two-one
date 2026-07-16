'use strict';

/**
 * sources.js — enumerate what the package ships (spec 001, TDD §5/§6).
 *
 * The install surface is derived from the source (package) root:
 *   - framework-owned files: every file under the framework dirs;
 *   - user-owned docs: instantiated from `templates/*-Template.md` under the
 *     default `claude` mapping (FR-017); per-stack rendering is mvp-4.
 */

const fs = require('fs');
const path = require('path');
const { FRAMEWORK_DIRS, toPosix } = require('./classes');

/** Recursively list files under `dir`, as paths relative to `root`. */
function walk(root, dir, acc) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return acc;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.DS_Store') continue;
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(root, rel, acc);
    } else {
      acc.push(toPosix(rel));
    }
  }
  return acc;
}

/** All framework-owned file paths shipped by the source root, sorted. */
function frameworkFiles(sourceDir) {
  const files = [];
  for (const dir of FRAMEWORK_DIRS) walk(sourceDir, dir, files);
  return files.sort();
}

/**
 * Template → user-doc install mapping (default `claude`, FR-017 / TDD §5).
 * Each entry: { template: <relpath under templates/>, dest: <target relpath> }.
 * Only entries whose template exists in the source are returned.
 */
function userDocMappings(sourceDir) {
  const guiding = ['CLAUDE', 'CODE', 'PRODUCT', 'DESIGN', 'README'];
  const requirements = ['01-PRD', '02-EDD', '03-TDD', '04-BACKLOG', '05-ROADMAP'];

  const mappings = [];
  for (const name of guiding) {
    mappings.push({ template: `${name}-Template.md`, dest: `${name}.md` });
  }
  for (const name of requirements) {
    mappings.push({ template: `${name}-Template.md`, dest: `requirements/${name}.md` });
  }

  return mappings.filter((m) => fs.existsSync(path.join(sourceDir, 'templates', m.template)));
}

/**
 * Detect whether `targetDir` is the framework's own repo (mode: source,
 * FR-011). Heuristic: the sync script + package/ snapshot both present.
 */
function isSourceRepo(targetDir) {
  return (
    fs.existsSync(path.join(targetDir, 'scripts', 'sync-to-package.js')) &&
    fs.existsSync(path.join(targetDir, 'package'))
  );
}

module.exports = { walk, frameworkFiles, userDocMappings, isSourceRepo };
