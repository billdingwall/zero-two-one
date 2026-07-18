'use strict';

/**
 * sources.js — enumerate what the package ships (spec 001, TDD §5/§6).
 *
 * The install surface is derived from the source (package) root and the active
 * stack (spec 006):
 *   - framework-owned files: every file under the stack's framework dirs
 *     (Layer-1 base + the stack's Layer-2 surface dirs);
 *   - user-owned docs: the stack's entrypoint (rendered from the neutral
 *     `ASSISTANT-Template.md`, `action: 'render'`) plus the common guiding docs
 *     and requirements docs (verbatim `instantiate`).
 */

const fs = require('fs');
const path = require('path');
const { frameworkDirs, toPosix } = require('./classes');
const { getAdapter } = require('./adapters');

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

/** All framework-owned file paths shipped by the source root for `stack`, sorted. */
function frameworkFiles(sourceDir, stack = 'claude') {
  const files = [];
  for (const dir of frameworkDirs(stack)) walk(sourceDir, dir, files);
  return files.sort();
}

/**
 * Template → user-doc install mapping for `stack` (TDD §5/§9.1).
 * Each entry: { template, dest, action }, where action is:
 *   - 'render'      → the entrypoint, transformed from the neutral source
 *                     (`ASSISTANT-Template.md`) by render.js;
 *   - 'instantiate' → a verbatim copy of `templates/<name>-Template.md`.
 * Only entries whose template exists in the source are returned.
 */
function userDocMappings(sourceDir, stack = 'claude') {
  const { entrypoint } = getAdapter(stack);
  const common = ['CODE', 'PRODUCT', 'DESIGN', 'README'];
  const requirements = ['01-PRD', '02-EDD', '03-TDD', '04-BACKLOG', '05-ROADMAP'];

  const mappings = [{ template: entrypoint.template, dest: entrypoint.dest, action: 'render' }];
  for (const name of common) {
    mappings.push({ template: `${name}-Template.md`, dest: `${name}.md`, action: 'instantiate' });
  }
  for (const name of requirements) {
    mappings.push({ template: `${name}-Template.md`, dest: `requirements/${name}.md`, action: 'instantiate' });
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
