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
const { renderSurface } = require('./surface');
const { getAdapter } = require('./adapters');
const { hashFile, hashContent } = require('./hash');

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
 * @param {object} args - { sourceDir, targetDir, manifest, opts, stack }
 *   opts: { upgrade:boolean, force:string[] }
 *   stack: active stack (spec 006) — parameterizes the install surface; default claude
 * @returns {{actions:Action[], conflicts:Action[], orphans:Action[], prereqs:string[]}}
 */
function classifyAll({ sourceDir, targetDir, manifest, opts = {}, stack = 'claude' }) {
  const upgrade = !!opts.upgrade;
  const force = new Set((opts.force || []).map((p) => p.replace(/\\/g, '/')));
  const prevFiles = (manifest && manifest.files) || {};
  const actions = [];

  const add = (a) => actions.push(a);

  // --- Framework-owned files (stack-scoped surface) ---
  const srcFiles = frameworkFiles(sourceDir, stack);
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

  // --- Rendered Layer-2 surface (spec 007): framework-owned files produced by a
  // transform (e.g. antigravity `.agents/skills/021-*/SKILL.md`), not enumerated
  // from a source dir. Same state machine as framework files, keyed on the
  // rendered content hash. Empty for stacks without `surfaceRenders` (claude). ---
  for (const { dest, content } of renderSurface(sourceDir, stack)) {
    srcSet.add(dest);
    const targetPath = path.join(targetDir, dest);
    const sourceHash = hashContent(content);
    const manifestHash = prevFiles[dest];

    if (!fs.existsSync(targetPath)) {
      add({ path: dest, class: CLASS.FRAMEWORK, action: ACTION.CREATE, reason: 'not present', content });
      continue;
    }
    const targetHash = hashFile(targetPath);
    if (manifestHash === undefined) {
      add({ path: dest, class: CLASS.FRAMEWORK, action: ACTION.ADOPT, reason: 'present, no manifest baseline' });
    } else if (targetHash === manifestHash) {
      if (upgrade && sourceHash !== targetHash) {
        add({ path: dest, class: CLASS.FRAMEWORK, action: ACTION.REFRESH, reason: 'unmodified; newer render', content });
      } else {
        add({ path: dest, class: CLASS.FRAMEWORK, action: ACTION.SKIP, reason: 'present and unmodified' });
      }
    } else {
      add({ path: dest, class: CLASS.FRAMEWORK, action: ACTION.CONFLICT, reason: 'hand-modified vs manifest hash' });
    }
  }

  // --- Orphans: in the manifest but no longer shipped (spans both framework
  // files and the rendered surface — srcSet holds both). ---
  for (const rel of Object.keys(prevFiles)) {
    if (!srcSet.has(rel)) {
      add({ path: rel, class: CLASS.FRAMEWORK, action: ACTION.ORPHAN, reason: 'in manifest, not shipped by package' });
    }
  }

  // --- User-owned docs (rendered entrypoint or instantiated from templates) ---
  // The entrypoint dest is resolved from target state: an existing `honored`
  // file (antigravity's GEMINI.md) is the entrypoint instead of the default
  // (spec 007 FR-004).
  const { entrypoint } = getAdapter(stack);
  const honoredDest =
    entrypoint && (entrypoint.honored || []).find((h) => fs.existsSync(path.join(targetDir, h)));
  for (const m of userDocMappings(sourceDir, stack)) {
    const render = m.action === 'render';
    const dest = render && honoredDest ? honoredDest : m.dest;
    const destPath = path.join(targetDir, dest);
    const reason = render ? 'render from neutral source' : 'instantiate from template';
    if (!fs.existsSync(destPath)) {
      add({ path: dest, class: CLASS.USER, action: ACTION.CREATE, reason, template: m.template, render });
    } else if (force.has(dest)) {
      add({ path: dest, class: CLASS.USER, action: ACTION.FORCE, reason: '--force overwrite', template: m.template, render });
    } else {
      add({ path: dest, class: CLASS.USER, action: ACTION.SKIP, reason: 'user-owned, present' });
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
