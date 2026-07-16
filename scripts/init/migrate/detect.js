'use strict';

/**
 * migrate/detect.js — read-only detection (spec 002 FR-001/002/004).
 *
 * Gathers the evidence that steers migrate: whether the target is a real,
 * pre-existing project (migrate vs scaffold), its likely lifecycle phase
 * (strict precedence), and which tool stack its surfaces suggest. Never
 * mutates the repo. Zero deps — git tags read via node:child_process.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { frameworkFiles, userDocMappings } = require('../sources');
const { toPosix } = require('../classes');

/** The set of paths that belong to the framework's own install surface. */
function frameworkSurface(sourceDir) {
  const set = new Set(frameworkFiles(sourceDir));
  for (const m of userDocMappings(sourceDir)) set.add(m.dest);
  set.add('.gitignore');
  set.add('package.json');
  return set;
}

/** List every file under `root` (POSIX-relative), skipping the usual noise. */
function walkFiles(root, rel, acc, skip) {
  const abs = path.join(root, rel || '.');
  if (!fs.existsSync(abs)) return acc;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue;
    const childRel = rel ? path.join(rel, entry.name) : entry.name;
    if (entry.isDirectory()) walkFiles(root, childRel, acc, skip);
    else acc.push(toPosix(childRel));
  }
  return acc;
}

const NOISE = new Set(['.git', 'node_modules', '.DS_Store']);

/**
 * True when the target holds any file outside the framework's own surface —
 * i.e. real project content to protect (FR-001). A freshly-scaffolded repo
 * (framework files + instantiated docs + merged + generated only) is NOT
 * migrate, so spec 001's scaffold path and tests are unchanged (analyze A5).
 */
function hasNonFrameworkContent(targetDir, sourceDir) {
  const surface = frameworkSurface(sourceDir);
  for (const rel of walkFiles(targetDir, '', [], NOISE)) {
    if (rel === '.zero-two-one.json') continue;
    if (surface.has(rel)) continue;
    if (rel.startsWith('.ai/context/')) continue;
    if (/\.zero-two-one\.md$/.test(rel)) continue; // namespaced guiding-doc copies
    return true;
  }
  return false;
}

/**
 * Resolve the run mode. Manifest-first: a recorded mode wins on re-run
 * (FR-001); otherwise detect migrate vs scaffold. `source` is decided by the
 * caller (spec 001 isSourceRepo) before this is consulted.
 */
function detectMode(targetDir, sourceDir, prevManifest) {
  if (prevManifest && prevManifest.mode) return prevManifest.mode;
  return hasNonFrameworkContent(targetDir, sourceDir) ? 'migrate' : 'scaffold';
}

function gitHasTags(targetDir) {
  try {
    const out = execFileSync('git', ['tag'], { cwd: targetDir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return out.trim().length > 0;
  } catch (_) {
    return false;
  }
}

function hasTests(targetDir) {
  for (const d of ['test', 'tests', '__tests__']) {
    if (fs.existsSync(path.join(targetDir, d))) return true;
  }
  return walkFiles(targetDir, '', [], NOISE).some((r) => /\.(test|spec)\.[a-z]+$/i.test(r));
}

function hasCI(targetDir) {
  return (
    fs.existsSync(path.join(targetDir, '.github', 'workflows')) ||
    fs.existsSync(path.join(targetDir, '.gitlab-ci.yml')) ||
    fs.existsSync(path.join(targetDir, '.circleci'))
  );
}

const CODE_EXT = /\.(js|mjs|cjs|ts|jsx|tsx|py|go|rb|rs|java|c|cc|cpp|cs|php|swift|kt|scala|vue|svelte)$/i;
const NON_CODE_DIR = /^(test|tests|__tests__|docs|requirements|specs|\.github|\.ai)\//;

/** ≥1 source file outside config/docs/tests dirs (analyze A2). */
function hasSubstantialCode(targetDir, sourceDir) {
  const surface = frameworkSurface(sourceDir);
  for (const rel of walkFiles(targetDir, '', [], NOISE)) {
    if (surface.has(rel)) continue;
    if (NON_CODE_DIR.test(rel)) continue;
    if (CODE_EXT.test(rel)) return true;
  }
  return false;
}

/** Strict precedence: growth (all three) → mvp (code) → planning (FR-002). */
function detectPhase(targetDir, sourceDir) {
  const evidence = { tests: hasTests(targetDir), ci: hasCI(targetDir), tags: gitHasTags(targetDir) };
  if (evidence.tests && evidence.ci && evidence.tags) return { phase: 'growth', evidence };
  if (hasSubstantialCode(targetDir, sourceDir)) return { phase: 'mvp', evidence };
  return { phase: 'planning', evidence };
}

function populatedSpecs(targetDir) {
  const dir = path.join(targetDir, 'specs');
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const spec = path.join(dir, entry.name, 'spec.md');
    if (fs.existsSync(spec)) out.push(toPosix(path.join('specs', entry.name, 'spec.md')));
  }
  return out;
}

/** Propose the stack from tool surfaces (FR-004). */
function detectStack(targetDir) {
  const found = [];
  if (fs.existsSync(path.join(targetDir, '.claude'))) found.push('claude');
  if (fs.existsSync(path.join(targetDir, '.agents')) || fs.existsSync(path.join(targetDir, 'AGENTS.md'))) found.push('antigravity');
  if (fs.existsSync(path.join(targetDir, '.kiro'))) found.push('kiro');
  const ssd = fs.existsSync(path.join(targetDir, '.specify')) || populatedSpecs(targetDir).length > 0 ? 'github-speckit' : null;
  return { found, ssd, ambiguous: found.length > 1, stack: found.length === 1 ? found[0] : null };
}

module.exports = {
  frameworkSurface,
  walkFiles,
  hasNonFrameworkContent,
  detectMode,
  detectPhase,
  detectStack,
  populatedSpecs,
};
