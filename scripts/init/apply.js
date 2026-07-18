'use strict';

/**
 * apply.js — execute an action plan (spec 001, FR-013).
 *
 * Applies every non-conflicting action, provisions merged/generated surfaces,
 * installs the git hook, and returns the material for the manifest (the
 * framework-owned file inventory + merged contributions). Conflicts and
 * orphans are left untouched; the caller reports them and still exits 0.
 */

const fs = require('fs');
const path = require('path');
const { ACTION } = require('./classify');
const { instantiate } = require('./instantiate');
const { renderEntrypoint } = require('./render');
const { hashFile } = require('./hash');
const { mergeGitignore, mergePackageJson } = require('./merge');
const { installHook } = require('./hook');

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

/**
 * Produce a user-owned doc at `dest`: render the neutral source for the
 * entrypoint (spec 006), or verbatim-instantiate its template. On a render
 * overwrite, an existing file's marked local section is preserved (FR-003).
 */
function writeUserDoc(a, sourceDir, targetDir, stack) {
  const templatePath = path.join(sourceDir, 'templates', a.template);
  const destPath = path.join(targetDir, a.path);
  if (a.render) {
    const existing = fs.existsSync(destPath) ? fs.readFileSync(destPath, 'utf8') : undefined;
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, renderEntrypoint(templatePath, stack, { existing }));
  } else {
    instantiate(templatePath, destPath);
  }
}

/**
 * @param {object} args - { sourceDir, targetDir, plan, prevManifest, stack }
 * @returns {{ files: object, merged: object, hook: string }}
 */
function applyPlan({ sourceDir, targetDir, plan, prevManifest, stack = 'claude' }) {
  const files = {};
  const merged = {};
  const prevMerged = (prevManifest && prevManifest.merged) || {};

  for (const a of plan.actions) {
    switch (a.action) {
      case ACTION.CREATE:
      case ACTION.REFRESH:
        if (a.class === 'framework-owned') {
          copyFile(path.join(sourceDir, a.path), path.join(targetDir, a.path));
        } else if (a.class === 'user-owned') {
          writeUserDoc(a, sourceDir, targetDir, stack);
        } else if (a.class === 'generated') {
          const dir = path.join(targetDir, a.path);
          fs.mkdirSync(dir, { recursive: true });
          const keep = path.join(dir, '.gitkeep');
          if (!fs.existsSync(keep)) fs.writeFileSync(keep, '');
        }
        break;
      case ACTION.FORCE:
        writeUserDoc(a, sourceDir, targetDir, stack);
        break;
      case ACTION.MERGE:
        applyMerge(a.path, targetDir, prevMerged, merged);
        break;
      // skip | adopt | conflict | orphan → no write
    }
  }

  // Build the framework-owned inventory from post-apply target state.
  for (const a of plan.actions) {
    if (a.class !== 'framework-owned') continue;
    if (a.action === ACTION.ORPHAN) continue; // no longer shipped → drops from inventory
    const h = hashFile(path.join(targetDir, a.path));
    if (h) files[a.path] = h;
  }

  const hookResult = installHook(targetDir);

  return { files, merged, hook: hookResult.strategy, hookMessage: hookResult.message };
}

function applyMerge(rel, targetDir, prevMerged, mergedOut) {
  const abs = path.join(targetDir, rel);
  if (rel === '.gitignore') {
    const existing = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
    const res = mergeGitignore(existing, prevMerged['.gitignore']);
    if (res.changed) fs.writeFileSync(abs, res.content);
    mergedOut['.gitignore'] = res.contributed;
  } else if (rel === 'package.json') {
    const existing = fs.existsSync(abs) ? fs.readFileSync(abs, 'utf8') : null;
    const res = mergePackageJson(existing, prevMerged['package.json.scripts'], path.basename(targetDir));
    if (res.changed) fs.writeFileSync(abs, res.text);
    mergedOut['package.json.scripts'] = res.contributed;
  }
}

module.exports = { applyPlan };
