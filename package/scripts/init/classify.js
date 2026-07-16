'use strict';

/**
 * classify.js — build the action plan (spec 001, data-model §3/§4).
 *
 * Pure planning: reads the source surface, the target state, and the previous
 * manifest, and resolves one action per path. Nothing is written here — apply
 * consumes the plan, and `--dry-run` just prints it.
 */

const fs = require('fs');
const path = require('path');
const { CLASS } = require('./classes');
const { frameworkFiles, userDocMappings } = require('./sources');
const { hashFile } = require('./hash');

const ACTION = {
  CREATE: 'create',
  SKIP: 'skip',
  MERGE: 'merge',
  CONFLICT: 'conflict',
  FORCE: 'force',
  ORPHAN: 'orphan',
  ADOPT: 'adopt',
  REFRESH: 'refresh',
};

/**
 * @param {object} args - { sourceDir, targetDir, manifest, opts }
 *   opts: { upgrade:boolean, force:string[] }
 * @returns {{actions:Action[], conflicts:Action[], orphans:Action[], prereqs:string[]}}
 */
function classifyAll({ sourceDir, targetDir, manifest, opts = {} }) {
  const upgrade = !!opts.upgrade;
  const force = new Set((opts.force || []).map((p) => p.replace(/\\/g, '/')));
  const prevFiles = (manifest && manifest.files) || {};
  const actions = [];

  const add = (a) => actions.push(a);

  // --- Framework-owned files ---
  const srcFiles = frameworkFiles(sourceDir);
  const srcSet = new Set(srcFiles);

  for (const rel of srcFiles) {
    const targetPath = path.join(targetDir, rel);
    const exists = fs.existsSync(targetPath);
    const manifestHash = prevFiles[rel];

    if (!exists) {
      add({ path: rel, class: CLASS.FRAMEWORK, action: ACTION.CREATE, reason: 'not present' });
      continue;
    }
    const targetHash = hashFile(targetPath);
    if (manifestHash === undefined) {
      // No baseline for a present file → adopt current state (never overwrite).
      add({ path: rel, class: CLASS.FRAMEWORK, action: ACTION.ADOPT, reason: 'present, no manifest baseline' });
    } else if (targetHash === manifestHash) {
      const sourceHash = hashFile(path.join(sourceDir, rel));
      if (upgrade && sourceHash !== targetHash) {
        add({ path: rel, class: CLASS.FRAMEWORK, action: ACTION.REFRESH, reason: 'unmodified; newer in package' });
      } else {
        add({ path: rel, class: CLASS.FRAMEWORK, action: ACTION.SKIP, reason: 'present and unmodified' });
      }
    } else {
      add({ path: rel, class: CLASS.FRAMEWORK, action: ACTION.CONFLICT, reason: 'hand-modified vs manifest hash' });
    }
  }

  // --- Orphans: in the manifest but no longer shipped ---
  for (const rel of Object.keys(prevFiles)) {
    if (!srcSet.has(rel)) {
      add({ path: rel, class: CLASS.FRAMEWORK, action: ACTION.ORPHAN, reason: 'in manifest, not shipped by package' });
    }
  }

  // --- User-owned docs (instantiated from templates) ---
  for (const m of userDocMappings(sourceDir)) {
    const destPath = path.join(targetDir, m.dest);
    if (!fs.existsSync(destPath)) {
      add({ path: m.dest, class: CLASS.USER, action: ACTION.CREATE, reason: 'instantiate from template', template: m.template });
    } else if (force.has(m.dest)) {
      add({ path: m.dest, class: CLASS.USER, action: ACTION.FORCE, reason: '--force overwrite', template: m.template });
    } else {
      add({ path: m.dest, class: CLASS.USER, action: ACTION.SKIP, reason: 'user-owned, present' });
    }
  }

  // --- Merged files (resolved at apply time) ---
  for (const rel of ['.gitignore', 'package.json']) {
    add({ path: rel, class: CLASS.MERGED, action: ACTION.MERGE, reason: 'additive merge' });
  }

  // --- Generated ---
  const gitkeep = path.join(targetDir, '.ai', 'context', '.gitkeep');
  add(
    fs.existsSync(gitkeep)
      ? { path: '.ai/context', class: CLASS.GENERATED, action: ACTION.SKIP, reason: 'already provisioned' }
      : { path: '.ai/context', class: CLASS.GENERATED, action: ACTION.CREATE, reason: 'provision empty scaffold' }
  );

  // --- Prerequisites ---
  const prereqs = [];
  if (!fs.existsSync(path.join(targetDir, 'package.json'))) {
    prereqs.push('no package.json — a minimal one will be created with the lifecycle scripts');
  }
  if (!fs.existsSync(path.join(targetDir, '.git'))) {
    prereqs.push('not a git repo — pre-commit hook installed but inactive until `git init`');
  }

  return {
    actions,
    conflicts: actions.filter((a) => a.action === ACTION.CONFLICT),
    orphans: actions.filter((a) => a.action === ACTION.ORPHAN),
    prereqs,
  };
}

module.exports = { ACTION, classifyAll };
