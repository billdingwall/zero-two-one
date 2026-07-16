#!/usr/bin/env node
'use strict';

/**
 * sync-to-package.js — Sync framework files from the root workspace into
 * the package/ directory for NPM publishing.
 *
 * Preserves package-specific files:
 *   - package/package.json  (has `files` array, `publishConfig`, cleaned scripts)
 *   - package/.claude/      (Claude Code slash commands — package-specific)
 *
 * Excludes development-only content:
 *   - .021-updates/   (internal audit notes)
 *   - .git/           (git metadata)
 *   - node_modules/   (dependencies)
 *   - package/        (avoid recursion)
 *   - .DS_Store       (macOS artifacts)
 *
 * Usage: node scripts/sync-to-package.js
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const packageDir = path.join(rootDir, 'package');

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/**
 * Directories to sync from root → package/.
 * Not listed (r7): `prototype/` is generated on demand by 021-prototype
 * (TDD §12) and never ships; `.ai/` ships as an empty scaffold only —
 * provisioned below, never copied (generated bundles must not publish).
 */
const dirsToCopy = [
  '.github',
  'bin',
  'hooks',
  'scripts',
  'skills',
  'specs',
  'templates',
  'workflow',
];

/** Guiding files to sync (starting-point templates) */
const filesToCopy = [
  'README.md',
  'LICENSE',
  '.gitignore',
];

/** Files/dirs in package/ that should NOT be overwritten by sync */
const preserveInPackage = [
  'package.json',
  '.claude',
  'node_modules',
];

/** Entries to skip when scanning the root */
const rootExclusions = new Set([
  '.021-updates',
  '.git',
  'node_modules',
  'package',
  '.DS_Store',
]);

/**
 * Dev-only scripts that must not ship in package/scripts/ (see the
 * Package Manifest in requirements/03-TDD.md §5).
 */
const scriptExclusions = new Set([
  'sync-to-package.js',
  'check-links.js',
]);

/**
 * Dev-only .github content: CI workflows govern this repo, not scaffolded
 * user projects — only issue templates ship (r7).
 */
const githubExclusions = new Set([
  'workflows',
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively copy a directory, skipping excluded entries.
 */
function copyDir(src, dest, exclusions = null) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue;
    if (exclusions && exclusions.has(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Recursively remove a directory.
 */
function removeDir(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  fs.rmSync(dirPath, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

console.log('🔄 Syncing framework files to package/...\n');

if (!fs.existsSync(packageDir)) {
  console.log('Creating package/ directory...');
  fs.mkdirSync(packageDir, { recursive: true });
}

// Sync directories — clean-copy (remove old, copy fresh)
for (const dir of dirsToCopy) {
  const src = path.join(rootDir, dir);
  const dest = path.join(packageDir, dir);

  if (!fs.existsSync(src)) {
    console.log(`  ⚠️  Skipping ${dir}/ (not found in root)`);
    continue;
  }

  // Remove old copy to ensure clean state
  removeDir(dest);

  console.log(`  📁 ${dir}/`);
  const exclusions =
    dir === 'scripts' ? scriptExclusions : dir === '.github' ? githubExclusions : null;
  copyDir(src, dest, exclusions);
}

// Provision .ai/ as an empty scaffold — generated bundles never ship (r7).
const aiContextDir = path.join(packageDir, '.ai', 'context');
removeDir(path.join(packageDir, '.ai'));
fs.mkdirSync(aiContextDir, { recursive: true });
fs.writeFileSync(path.join(aiContextDir, '.gitkeep'), '');
console.log('  📁 .ai/ (empty scaffold — generated bundles excluded)');

// Drop directories that no longer ship (r7): prototype/ is generated on demand.
const prototypeDir = path.join(packageDir, 'prototype');
if (fs.existsSync(prototypeDir)) {
  removeDir(prototypeDir);
  console.log('  🗑  prototype/ removed (generated on demand by 021-prototype)');
}

// Sync guiding files
for (const file of filesToCopy) {
  const src = path.join(rootDir, file);
  const dest = path.join(packageDir, file);

  if (!fs.existsSync(src)) {
    console.log(`  ⚠️  Skipping ${file} (not found in root)`);
    continue;
  }

  console.log(`  📄 ${file}`);
  fs.copyFileSync(src, dest);
}

// Report preserved files
console.log('\n📌 Preserved (not overwritten):');
for (const item of preserveInPackage) {
  const itemPath = path.join(packageDir, item);
  if (fs.existsSync(itemPath)) {
    console.log(`  🔒 ${item}`);
  }
}

// ---------------------------------------------------------------------------
// --check mode (r7): fail on drift. Because the sync above is deterministic,
// any resulting change under package/ means the snapshot was stale. Preserved
// surfaces aren't synced, so .claude/commands/ is compared explicitly.
// ---------------------------------------------------------------------------
if (process.argv.includes('--check')) {
  const { execSync } = require('child_process');
  let drift = [];

  // The sync above just ran. If it changed the working tree relative to the
  // index (staged/committed state), package/ was stale. Comparing working-tree
  // vs index (not `git status`, which also flags already-staged changes) lets
  // this pass both in CI (committed) and locally right before a commit (staged).
  try {
    const dirty = execSync('git diff --name-only -- package/', { cwd: rootDir })
      .toString()
      .trim();
    if (dirty) drift.push(`package/ out of sync with root:\n${dirty}`);
  } catch (err) {
    console.error(`--check requires git (${err.message})`);
    process.exit(1);
  }

  // package/.claude is preserved, not synced — diff it against root explicitly.
  const rootCmds = path.join(rootDir, '.claude', 'commands');
  const pkgCmds = path.join(packageDir, '.claude', 'commands');
  if (fs.existsSync(rootCmds) && fs.existsSync(pkgCmds)) {
    const names = new Set([...fs.readdirSync(rootCmds), ...fs.readdirSync(pkgCmds)]);
    for (const name of names) {
      const a = path.join(rootCmds, name);
      const b = path.join(pkgCmds, name);
      if (!fs.existsSync(a) || !fs.existsSync(b)) {
        drift.push(`.claude/commands/${name} exists on only one side (root vs package)`);
      } else if (fs.readFileSync(a, 'utf8') !== fs.readFileSync(b, 'utf8')) {
        drift.push(`.claude/commands/${name} differs between root and package`);
      }
    }
  }

  if (drift.length) {
    console.error('\n❌ Drift detected:\n' + drift.map((d) => `  - ${d}`).join('\n'));
    console.error('\nFix: review the diff, run `npm run sync:package`, and commit package/ together with the root change.');
    process.exit(1);
  }
  console.log('\n✅ No drift: package/ matches root.');
}

console.log('\n✅ Sync complete! Run `cd package && npm pack --dry-run` to verify contents.');
