#!/usr/bin/env node

/**
 * workflow-status.js
 * Parses the repository state to output the current phase of the product lifecycle.
 * Phase 1 (Planning): `requirements/01-PRD.md` is empty or incomplete.
 * Phase 2 (Pre-build): `requirements/01-PRD.md` exists, prototype directory is active.
 * Phase 3 (MVP Build): `specs/` directory has markdown files, code implementation has started.
 * Phase 4 (Growth): TBD (typically inferred through version tags or live release markers).
 */

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();

const prdPath = path.join(repoRoot, 'requirements', '01-PRD.md');
const prototypeDir = path.join(repoRoot, 'prototype');
const specsDir = path.join(repoRoot, 'specs');

function getWorkflowStatus() {
  let phase = 1;
  let status = "Planning (Zero)";

  const hasPRD = fs.existsSync(prdPath) && fs.statSync(prdPath).size > 1000; // rough heuristic

  let hasPrototype = false;
  if (fs.existsSync(prototypeDir)) {
      const protoFiles = fs.readdirSync(prototypeDir);
      hasPrototype = protoFiles.length > 1 || (protoFiles.length === 1 && protoFiles[0] !== 'OVERVIEW.md');
  }

  let hasSpecs = false;
  if (fs.existsSync(specsDir)) {
      const specFiles = fs.readdirSync(specsDir);
      hasSpecs = specFiles.some(file => file.endsWith('.md') && file !== 'OVERVIEW.md');
  }

  if (hasSpecs) {
    phase = 3;
    status = "MVP Build (One)";
  } else if (hasPRD && hasPrototype) {
    phase = 2;
    status = "Pre-build (Refinement)";
  } else if (hasPRD) {
    // Transitioning from 1 -> 2
    phase = 1.5;
    status = "Planning complete. Awaiting prototype creation.";
  }

  return { phase, status };
}

const { phase, status } = getWorkflowStatus();

console.log(`\n=== Zero Two One Lifecycle Status ===`);
console.log(`Current Phase: ${phase} - ${status}`);
console.log(`===================================\n`);
