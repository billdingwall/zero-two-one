#!/usr/bin/env node

/**
 * workflow-status.js
 * Reports the current phase of the product lifecycle.
 *
 * Source of truth (TDD §7): the phase/stack resolution — manifest →
 * repo-state inference → Planning — lives once in `scripts/speckit/lib.js`
 * (`manifestFacts`, spec 003). This script is a thin presenter over it and
 * owns only its own output formatting (`--json`, human summary).
 */

// Phase/stack resolution lives once in the manifest contract (spec 003);
// this script is now a thin presenter over it.
const { manifestFacts, reviewTemplateForPhase } = require('./speckit/lib');

const { phaseNum: phase, phaseLabel: status, source } = manifestFacts();
// Stage-specific review template for the refinement loop (mvp-5), driven by phase.
const reviewTemplate = reviewTemplateForPhase(phase);

// --json: machine-readable output for tooling (run-qa.sh, CI) — consumers
// must never scrape the human-readable block below (r7).
if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ phase, status, source, reviewTemplate }));
  process.exit(0);
}

console.log(`\n=== Zero Two One Lifecycle Status ===`);
console.log(`Current Phase: ${phase} - ${status}`);
console.log(`Source: ${source === 'manifest' ? '.zero-two-one.json' : 'inferred from repo state'}`);
console.log(`Review template: ${reviewTemplate}`);
console.log(`===================================\n`);
