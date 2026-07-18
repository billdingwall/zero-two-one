'use strict';

/**
 * migrate/index.js — the migrate pipeline (spec 002).
 *
 * Runs in front of spec 001's engine when the target is an existing project:
 *   detect → resolve phase/stack → report → base classify/apply (001,
 *   non-destructive) → duplicate resolution → Spec Kit reuse → growth entry →
 *   manifest (with the migrate block). Everything additive; the 001
 *   non-destructive invariant is inherited (FR-010). Zero deps.
 */

const path = require('path');
const { getAdapter } = require('../adapters');
const { classifyAll } = require('../classify');
const { applyPlan } = require('../apply');
const { buildManifest, writeManifest } = require('../manifest');
const { renderPlan } = require('../report');
const { detectPhase, detectStack } = require('./detect');
const { resolvePhase, resolveStack } = require('./interview');
const { resolveDuplicates } = require('./duplicates');
const { speckitReuse } = require('./speckit-reuse');
const { growthEntry } = require('./growth-entry');

const CHECK = (b) => (b ? '✓' : '✗');

/**
 * @param {string} targetDir
 * @param {object} opts - init opts (+ migrate: dup{}, yes, nonInteractive)
 * @param {object} ctx  - { sourceDir, prevManifest, resolveTools, log }
 * @returns {number} exit code
 */
function migrateFramework(targetDir, opts, ctx) {
  const { sourceDir, prevManifest, resolveTools, log, reportHook } = ctx;
  const reRun = !!prevManifest;

  // --- Detect / resolve (manifest-first on re-run, FR-001) ---
  const inferred = detectPhase(targetDir, sourceDir);
  const surfaces = detectStack(targetDir);
  const phase = reRun && prevManifest.phase ? prevManifest.phase : resolvePhase(inferred.phase, opts);
  const stack =
    reRun && prevManifest.tools && prevManifest.tools.stack
      ? prevManifest.tools.stack
      : resolveStack(surfaces, opts);
  const reuse = speckitReuse(targetDir);

  // A reserved-but-unpopulated stack (kiro) can't be rendered yet — fail loudly
  // rather than write a mismatched tree (analyze A5). Migrate resolves its own
  // stack, so it guards independently of the scaffold-path guard.
  try {
    getAdapter(stack);
  } catch (e) {
    console.error(`Error: ${e.message}`);
    return 1;
  }

  // --- Report detection before any write (FR-001) ---
  const ev = inferred.evidence;
  log('Detected (migrate mode):');
  log(`  phase: ${phase}${reRun ? ' (from manifest)' : `  (tests ${CHECK(ev.tests)}, CI ${CHECK(ev.ci)}, git tags ${CHECK(ev.tags)})`}`);
  log(`  stack: ${stack}${surfaces.ambiguous ? `  (conflicting surfaces: ${surfaces.found.join(', ')})` : ''}`);
  if (reuse.reused) {
    log(`  Spec Kit: ${reuse.specs} spec(s) present — reusing, setup skipped${reuse.invalid.length ? `; ${reuse.invalid.length} with missing/invalid status (skipped, not modified)` : ''}`);
  }
  log('');

  const plan = classifyAll({ sourceDir, targetDir, manifest: prevManifest, opts, stack });

  if (opts.dryRun) {
    log(renderPlan(plan, { dryRun: true }));
    return 0;
  }

  // --- Duplicate resolution FIRST, on the pre-apply state ---
  // A duplicate is a doc the user already had; it must be resolved before the
  // base pipeline instantiates the *missing* user docs (else those newly
  // created files would be mis-detected as pre-existing collisions).
  const migrate = resolveDuplicates({ sourceDir, targetDir, opts, prevManifest, stack });

  // --- Base pipeline (001, non-destructive): create remaining missing docs ---
  const applied = applyPlan({ sourceDir, targetDir, plan, prevManifest, stack });
  if (phase === 'growth') growthEntry({ sourceDir, targetDir });

  // --- Manifest (migrate block) ---
  const version = require(path.join(sourceDir, 'package.json')).version;
  const manifest = buildManifest({
    prev: prevManifest,
    version,
    mode: 'migrate',
    phase,
    tools: resolveTools({ stack, design: opts.design }, prevManifest),
    files: applied.files,
    merged: applied.merged,
    hook: applied.hook,
    migrate,
    now: opts.now,
  });
  writeManifest(targetDir, manifest);

  log(renderPlan(plan, { dryRun: false }));
  const decisions = Object.entries(migrate.duplicates);
  if (decisions.length) {
    log('\nDuplicate resolution:');
    for (const [p, a] of decisions) log(`  ${p} → ${a}`);
  }
  reportHook(applied, log);
  log(`\n✅ Migrated (${Object.keys(applied.files).length} framework files tracked).`);
  return 0;
}

module.exports = { migrateFramework };
