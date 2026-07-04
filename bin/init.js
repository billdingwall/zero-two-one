#!/usr/bin/env node
'use strict';

/**
 * zero-two-one-init — scaffold the Zero Two One framework into a target
 * repository.
 *
 * What it provisions:
 *   1. The framework surface: requirements/, workflow/, skills/, templates/,
 *      specs/, prototype/, scripts/, hooks/, .github/, and the guiding files
 *      (CLAUDE.md, AI_CODING_GUIDELINES.md, LIFECYCLE_WORKFLOW.md, README).
 *   2. AI-readable artifact directories: .ai/context/ (Speckit context
 *      bundles).
 *   3. The refinement gate: installs hooks/pre-commit into .git/hooks.
 *   4. npm scripts for the lifecycle tooling in the target package.json.
 *   5. A Spec Kit readiness check (uv / specify CLI) with setup guidance.
 *
 * Usage: npx zero-two-one-init [target-dir]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = path.resolve(process.argv[2] || process.cwd());
const sourceDir = path.join(__dirname, '..');

console.log(`Initializing Zero Two One AI Framework in ${targetDir}...`);

// ---------------------------------------------------------------------------
// 1. Copy the framework surface
// ---------------------------------------------------------------------------
const dirsToCopy = [
  'prototype',
  'requirements',
  'skills',
  'specs',
  'templates',
  'workflow',
  '.github',
  'scripts',
  'hooks',
];

const filesToCopy = ['CLAUDE.md', 'README.md', 'AI_CODING_GUIDELINES.md', 'LIFECYCLE_WORKFLOW.md'];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

for (const dir of dirsToCopy) {
  const src = path.join(sourceDir, dir);
  if (fs.existsSync(src)) {
    console.log(`Copying ${dir}/...`);
    copyDir(src, path.join(targetDir, dir));
  }
}

for (const file of filesToCopy) {
  const src = path.join(sourceDir, file);
  if (fs.existsSync(src)) {
    console.log(`Copying ${file}...`);
    fs.copyFileSync(src, path.join(targetDir, file));
  }
}

// ---------------------------------------------------------------------------
// 2. Provision AI-readable artifact directories
// ---------------------------------------------------------------------------
const aiDirs = [
  path.join(targetDir, '.ai', 'context'), // generated Speckit context bundles
];
for (const dir of aiDirs) {
  fs.mkdirSync(dir, { recursive: true });
  const keep = path.join(dir, '.gitkeep');
  if (!fs.existsSync(keep)) fs.writeFileSync(keep, '');
  console.log(`Provisioned ${path.relative(targetDir, dir)}/`);
}

// Generated bundles are derived artifacts — keep them out of version control.
const gitignorePath = path.join(targetDir, '.gitignore');
const ignoreBlock = [
  '# zero-two-one: generated AI context bundles (rebuild with `npm run spec:context`)',
  '.ai/context/*',
  '!.ai/context/.gitkeep',
  'node_modules/',
].join('\n');
const existingIgnore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, 'utf8') : '';
if (!existingIgnore.includes('.ai/context/*')) {
  fs.writeFileSync(gitignorePath, (existingIgnore ? existingIgnore.trimEnd() + '\n\n' : '') + ignoreBlock + '\n');
  console.log('Updated .gitignore for generated artifacts.');
}

// ---------------------------------------------------------------------------
// 3. Install the refinement gate (git pre-commit hook)
// ---------------------------------------------------------------------------
const hooksDir = path.join(targetDir, '.git', 'hooks');
const hookSource = path.join(targetDir, 'hooks', 'pre-commit');
if (fs.existsSync(hooksDir) && fs.existsSync(hookSource)) {
  console.log('Installing pre-commit refinement gate...');
  const hookDest = path.join(hooksDir, 'pre-commit');
  fs.copyFileSync(hookSource, hookDest);
  fs.chmodSync(hookDest, 0o755);
} else if (!fs.existsSync(hooksDir)) {
  console.log('Note: target is not a git repository yet — run `git init` and re-run this script to install the pre-commit gate.');
}

// ---------------------------------------------------------------------------
// 4. Wire lifecycle npm scripts into the target package.json
// ---------------------------------------------------------------------------
const lifecycleScripts = {
  status: 'node scripts/workflow-status.js',
  qa: 'sh scripts/run-qa.sh',
  'spec:status': 'node scripts/speckit/spec-status.js',
  'spec:context': 'node scripts/speckit/fetch-speckit-context.js',
  'spec:verify': 'node scripts/speckit/verify-spec-compliance.js',
};

const pkgPath = path.join(targetDir, 'package.json');
if (fs.existsSync(pkgPath)) {
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    pkg.scripts = pkg.scripts || {};
    const addedScripts = [];
    for (const [name, cmd] of Object.entries(lifecycleScripts)) {
      if (!pkg.scripts[name]) {
        pkg.scripts[name] = cmd;
        addedScripts.push(name);
      }
    }
    if (addedScripts.length) {
      fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
      console.log(`Added npm scripts: ${addedScripts.join(', ')}`);
    }
  } catch (err) {
    console.log(`Warning: could not update package.json (${err.message}). Add the lifecycle scripts manually — see README.md.`);
  }
} else {
  console.log('Note: no package.json found. Run `npm init -y`, then re-run this script to wire up the lifecycle npm scripts.');
}

// ---------------------------------------------------------------------------
// 5. Spec Kit readiness check
// ---------------------------------------------------------------------------
function has(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'ignore', shell: '/bin/sh' });
    return true;
  } catch (_) {
    return false;
  }
}

console.log('\nDependency check:');
console.log(`  node      ${process.version} ✅`);
console.log(`  git       ${has('git') ? '✅' : '❌ required — https://git-scm.com'}`);
console.log(`  uv        ${has('uv') ? '✅' : '⚠️  needed for Spec Kit — https://docs.astral.sh/uv/'}`);
console.log(`  specify   ${has('specify') ? '✅' : '⚠️  Spec Kit CLI missing — uv tool install specify-cli --from git+https://github.com/github/spec-kit.git'}`);

console.log('\n✅ Framework initialized successfully!');
console.log('\nNext Steps:');
console.log('1. Review README.md and workflow/workflows.md.');
console.log('2. Fill in requirements/01-PRD.md, 02-TDD.md, 03-ROADMAP.md (Phase 1: Planning).');
console.log('3. Install Spec Kit slash commands for your agent: specify init --here --ai claude');
console.log('4. Ask your AI assistant to record the current lifecycle phase in its memory.');
