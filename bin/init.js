#!/usr/bin/env node
'use strict';

/**
 * zero-two-one-init — scaffold the Zero Two One framework into a target
 * repository.
 *
 * What it provisions:
 *   1. The framework surface: requirements/, workflow/, skills/, templates/,
 *      specs/, prototype/, scripts/, hooks/, .github/, and the guiding files
 *      (CLAUDE.md, CODE.md, PRODUCT.md, DESIGN.md, README).
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

const sourceDir = path.join(__dirname, '..');

// ---------------------------------------------------------------------------
// 0. Argument gating (r7 interim guards — full Init v2 flag surface lands mvp-3)
// ---------------------------------------------------------------------------
const USAGE = [
  'Usage: npx zero-two-one-init [target-dir]',
  '',
  'Scaffold the Zero Two One framework into target-dir (default: cwd).',
  'User-owned docs (CLAUDE.md, CODE.md, PRODUCT.md, DESIGN.md, README.md,',
  'requirements/*.md) are create-if-missing — existing files are never overwritten.',
  '',
  'Options:',
  '  --help       Show this help and exit',
  '  --version    Print the framework version and exit',
].join('\n');

const rawArgs = process.argv.slice(2);
if (rawArgs.includes('--help') || rawArgs.includes('-h')) {
  console.log(USAGE);
  process.exit(0);
}
if (rawArgs.includes('--version') || rawArgs.includes('-v')) {
  console.log(require(path.join(sourceDir, 'package.json')).version);
  process.exit(0);
}
const unknownFlags = rawArgs.filter((a) => a.startsWith('-'));
if (unknownFlags.length) {
  console.error(`Unknown option: ${unknownFlags[0]}\n\n${USAGE}`);
  process.exit(1);
}
if (rawArgs.length > 1) {
  console.error(`Expected at most one target directory, got: ${rawArgs.join(' ')}\n\n${USAGE}`);
  process.exit(1);
}

const targetDir = path.resolve(rawArgs[0] || process.cwd());

console.log(`Initializing Zero Two One AI Framework in ${targetDir}...`);

// ---------------------------------------------------------------------------
// 1. Copy the framework surface
// ---------------------------------------------------------------------------
// prototype/ is not scaffolded — it is generated on demand by 021-prototype (TDD §12, r7).
const dirsToCopy = [
  'skills',
  'specs',
  'templates',
  'workflow',
  '.github',
  'scripts',
  'hooks',
];

const requirementsDocs = ['01-PRD', '02-EDD', '03-TDD', '04-BACKLOG', '05-ROADMAP'];
const guidingFiles = ['CLAUDE', 'README', 'CODE', 'PRODUCT', 'DESIGN'];

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

// Create requirements directory structure
const reqDir = path.join(targetDir, 'requirements');
fs.mkdirSync(reqDir, { recursive: true });
['', '_refinement', '_design', '_notes'].forEach(sub => {
  fs.mkdirSync(path.join(reqDir, sub), { recursive: true });
});

// User-owned docs are create-if-missing (TDD §6): existing files are never
// overwritten — the r7 interim guard honoring the non-destructive contract
// ahead of the full mvp-3 ownership engine.
for (const doc of requirementsDocs) {
  const src = path.join(sourceDir, 'templates', `${doc}-Template.md`);
  const dest = path.join(reqDir, `${doc}.md`);
  if (!fs.existsSync(src)) continue;
  if (fs.existsSync(dest)) {
    console.log(`Skipping requirements/${doc}.md (already exists — never overwritten).`);
  } else {
    console.log(`Creating requirements/${doc}.md from template...`);
    fs.copyFileSync(src, dest);
  }
}

for (const file of guidingFiles) {
  const src = path.join(sourceDir, 'templates', `${file}-Template.md`);
  const dest = path.join(targetDir, `${file}.md`);
  if (!fs.existsSync(src)) continue;
  if (fs.existsSync(dest)) {
    console.log(`Skipping ${file}.md (already exists — never overwritten).`);
  } else {
    console.log(`Creating ${file}.md from template...`);
    fs.copyFileSync(src, dest);
  }
}

// Assistant slash commands (.claude/commands/021-*), merge-safe per TDD §4:
// existing user commands with the same name win; skips are reported.
const claudeSrc = path.join(sourceDir, '.claude', 'commands');
if (fs.existsSync(claudeSrc)) {
  const claudeDest = path.join(targetDir, '.claude', 'commands');
  fs.mkdirSync(claudeDest, { recursive: true });
  for (const entry of fs.readdirSync(claudeSrc)) {
    const dest = path.join(claudeDest, entry);
    if (fs.existsSync(dest)) {
      console.log(`Skipping .claude/commands/${entry} (user command exists — never overwritten).`);
    } else {
      fs.copyFileSync(path.join(claudeSrc, entry), dest);
      console.log(`Installing .claude/commands/${entry}`);
    }
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
  '# zero-two-one: generated AI context bundles (rebuild with `npm run 021-spec:context`)',
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
  // r7 interim guard: never silently clobber an existing hook — back it up.
  // (Conflict-aware chaining for husky/lefthook lands with Init v2, mvp-3.)
  if (fs.existsSync(hookDest)) {
    const backup = `${hookDest}.backup`;
    fs.copyFileSync(hookDest, backup);
    console.log(`Existing pre-commit hook backed up to ${path.relative(targetDir, backup)}.`);
  }
  fs.copyFileSync(hookSource, hookDest);
  fs.chmodSync(hookDest, 0o755);
} else if (!fs.existsSync(hooksDir)) {
  console.log('Note: target is not a git repository yet — run `git init` and re-run this script to install the pre-commit gate.');
}

// ---------------------------------------------------------------------------
// 4. Wire lifecycle npm scripts into the target package.json
// ---------------------------------------------------------------------------
const lifecycleScripts = {
  '021-status': 'node scripts/workflow-status.js',
  '021-qa': 'sh scripts/run-qa.sh',
  '021-spec:status': 'node scripts/speckit/spec-status.js',
  '021-spec:context': 'node scripts/speckit/fetch-speckit-context.js',
  '021-spec:verify': 'node scripts/speckit/verify-spec-compliance.js',
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
console.log('2. Fill in requirements/01-PRD.md, 02-EDD.md, 03-TDD.md, then 04-BACKLOG.md / 05-ROADMAP.md (all Planning).');
console.log('3. Install Spec Kit slash commands for your agent: specify init --here --ai claude');
console.log('4. Ask your AI assistant to record the current lifecycle phase in its memory.');
