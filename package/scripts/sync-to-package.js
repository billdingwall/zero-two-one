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

/** Directories to sync from root → package/ */
const dirsToCopy = [
  '.ai',
  '.github',
  'bin',
  'hooks',
  'prototype',
  'scripts',
  'skills',
  'specs',
  'templates',
  'workflow',
];

/** Guiding files to sync (starting-point templates) */
const filesToCopy = [
  'README.md',
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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively copy a directory, skipping excluded entries.
 */
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue;

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
  copyDir(src, dest);
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

console.log('\n✅ Sync complete! Run `cd package && npm pack --dry-run` to verify contents.');
