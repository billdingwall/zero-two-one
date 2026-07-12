#!/usr/bin/env node

/**
 * workflow-status.js
 * Reports the current phase of the product lifecycle.
 *
 * Source of truth (TDD §7): when `.zero-two-one.json` is present, its `phase`
 * field is authoritative. Only when no manifest exists does the script fall
 * back to inferring the phase from repository state:
 *   Phase 1 (Planning):   `requirements/01-PRD.md` is missing or thin.
 *   Phase 2 (Pre-build):  the PRD exists (a prototype is OPTIONAL — added on
 *                         demand via `021-prototype`, so it is not required to
 *                         be in Pre-build).
 *   Phase 3 (MVP Build):  `specs/` contains feature markdown.
 *   Phase 4 (Growth):     recorded in the manifest (not inferred here).
 */

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();

const manifestPath = path.join(repoRoot, '.zero-two-one.json');
const prdPath = path.join(repoRoot, 'requirements', '01-PRD.md');
const specsDir = path.join(repoRoot, 'specs');

const PHASE_FROM_MANIFEST = {
  planning: { phase: 1, status: 'Planning (Zero)' },
  prebuild: { phase: 2, status: 'Pre-build (Refinement)' },
  mvp: { phase: 3, status: 'MVP Build (One)' },
  growth: { phase: 4, status: 'Growth' },
};

function readManifestPhase() {
  if (!fs.existsSync(manifestPath)) return null;
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const key = typeof manifest.phase === 'string' ? manifest.phase.toLowerCase() : null;
    if (key && PHASE_FROM_MANIFEST[key]) {
      return { ...PHASE_FROM_MANIFEST[key], source: 'manifest' };
    }
  } catch (err) {
    console.warn(`⚠️  Could not parse .zero-two-one.json (${err.message}); falling back to inference.`);
  }
  return null;
}

function inferWorkflowStatus() {
  let phase = 1;
  let status = 'Planning (Zero)';

  const hasPRD = fs.existsSync(prdPath) && fs.statSync(prdPath).size > 1000; // rough heuristic

  let hasSpecs = false;
  if (fs.existsSync(specsDir)) {
    const specFiles = fs.readdirSync(specsDir);
    hasSpecs = specFiles.some((file) => file.endsWith('.md') && file !== '_INDEX.md');
  }

  if (hasSpecs) {
    phase = 3;
    status = 'MVP Build (One)';
  } else if (hasPRD) {
    phase = 2;
    status = 'Pre-build (Refinement)';
  }

  return { phase, status, source: 'inferred' };
}

const { phase, status, source } = readManifestPhase() || inferWorkflowStatus();

console.log(`\n=== Zero Two One Lifecycle Status ===`);
console.log(`Current Phase: ${phase} - ${status}`);
console.log(`Source: ${source === 'manifest' ? '.zero-two-one.json' : 'inferred from repo state'}`);
console.log(`===================================\n`);
