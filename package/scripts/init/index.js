'use strict';

/**
 * scripts/init/index.js — Safe Install & Merge Engine (spec 001, mvp-3).
 *
 * Orchestrates the classify → (dry-run?) → apply → write-manifest pipeline.
 * Non-destructive and idempotent: user-owned files are create-if-missing,
 * framework files are refreshed only when unmodified, conflicts report and
 * exit 0. TDD §6 (ownership) / §7 (manifest).
 *
 * Zero runtime dependencies — Node built-ins only.
 */

const fs = require('fs');
const path = require('path');
const { classify: classifyPath, CLASS } = require('./classes');
const { classifyAll } = require('./classify');
const { applyPlan } = require('./apply');
const { loadManifest, buildManifest, writeManifest } = require('./manifest');
const { isSourceRepo } = require('./sources');
const { renderPlan } = require('./report');
const { detectMode } = require('./migrate/detect');
const { migrateFramework } = require('./migrate');

const PACKAGE_ROOT = path.join(__dirname, '..', '..');

/**
 * Resolve the run mode. Manifest-first (a recorded mode wins on re-run,
 * spec 002 FR-001); else the framework's own repo is `source`; else detect
 * migrate (pre-existing project content) vs scaffold (empty/framework-only).
 */
function resolveMode(targetDir, sourceDir, prevManifest) {
  if (prevManifest && prevManifest.mode) return prevManifest.mode;
  if (isSourceRepo(targetDir)) return 'source';
  return detectMode(targetDir, sourceDir, null);
}

/** stack → derived assistant/ssd (TDD §7); design is independent. */
function resolveTools(opts, prev) {
  const stack = opts.stack || (prev && prev.tools && prev.tools.stack) || 'claude';
  const assistant = { claude: 'claude-code', antigravity: 'antigravity', kiro: 'kiro' }[stack] || 'claude-code';
  const ssd = stack === 'kiro' ? 'kiro-specs' : 'github-speckit';
  const design = opts.design || (prev && prev.tools && prev.tools.design) || 'none';
  return { stack, assistant, ssd, design };
}

/** Validate --force targets are user-owned (FR-004). Returns an error string or null. */
function validateForce(force) {
  for (const raw of force || []) {
    const rel = raw.replace(/\\/g, '/');
    if (classifyPath(rel) !== CLASS.USER) {
      return `--force is for user-owned files only; '${rel}' is not one. Use --upgrade to refresh framework files.`;
    }
  }
  return null;
}

/** Log hook-install notes per the applied strategy (spec 005). */
function reportHook(applied, log) {
  switch (applied.hook) {
    case 'inactive-no-git':
      log('\nNote: target is not a git repo — pre-commit hook staged but inactive until `git init`.');
      break;
    case 'chain-plain':
      log('\nNote: an existing pre-commit hook was chained — the refinement gate runs first, then your hook.');
      break;
    case 'husky':
      log('\nNote: husky detected — the gate was wired into .husky/pre-commit (`.git/hooks` left untouched).');
      break;
    case 'manual':
      log('\nNote: lefthook detected — add this to your lefthook config to enable the gate:\n\n' + (applied.hookMessage || '') + '\n');
      break;
  }
}

/**
 * Run the install engine.
 * @param {string} targetDir - absolute target path
 * @param {object} opts - { dryRun, upgrade, force:[], phase, design, stack, sourceDir, now, quiet }
 * @returns {number} exit code (0 success incl. conflicts; non-zero usage error)
 */
function initFramework(targetDir, opts = {}) {
  const sourceDir = opts.sourceDir || PACKAGE_ROOT;
  const log = opts.quiet ? () => {} : (m) => console.log(m);

  const forceErr = validateForce(opts.force);
  if (forceErr) {
    console.error(`Error: ${forceErr}`);
    return 1;
  }

  const prevManifest = loadManifest(targetDir);
  const mode = resolveMode(targetDir, sourceDir, prevManifest);

  // Migrate-mode (spec 002): detection/interview/import/duplicate-resolution
  // layered in front of this engine. Scaffold/source fall through unchanged.
  if (mode === 'migrate') {
    return migrateFramework(targetDir, opts, { sourceDir, prevManifest, resolveTools, log, reportHook });
  }

  const plan = classifyAll({ sourceDir, targetDir, manifest: prevManifest, opts });

  if (opts.dryRun) {
    log(renderPlan(plan, { dryRun: true }));
    return 0;
  }

  const applied = applyPlan({ sourceDir, targetDir, plan, prevManifest });

  const pkgVersion = require(path.join(sourceDir, 'package.json')).version;
  const manifest = buildManifest({
    prev: prevManifest,
    version: pkgVersion,
    mode,
    phase: opts.phase || (prevManifest && prevManifest.phase) || 'planning',
    tools: resolveTools(opts, prevManifest),
    files: applied.files,
    merged: applied.merged,
    hook: applied.hook,
    now: opts.now,
  });
  writeManifest(targetDir, manifest);

  log(renderPlan(plan, { dryRun: false }));
  reportHook(applied, log);
  log(`\n✅ ${mode === 'source' ? 'Manifest regenerated' : 'Framework installed'} (${manifest.files ? Object.keys(manifest.files).length : 0} framework files tracked).`);
  return 0;
}

module.exports = { initFramework, resolveTools, validateForce, reportHook };
