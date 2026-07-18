'use strict';

/**
 * github-speckit.js — the default SSD engine (spec 008, FR-007/009).
 *
 * The pre-008 `lib.js` spec-state behavior, extracted verbatim behind the
 * SpecEngine interface: feature specs live in `specs/NNN-feature-name/`, status
 * in `spec.md`. This module is the regression bar — no behavior change.
 */

const fs = require('fs');
const path = require('path');
const { readStatusFromFile, writeStatusToFile } = require('./status-frontmatter');

function specsDir(root) {
  return path.join(root, 'specs');
}

/** Spec dirs following the NNN-feature-name convention, sorted. */
function listSpecs(root) {
  const dir = specsDir(root);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d{3}-/.test(e.name))
    .map((e) => e.name)
    .sort();
}

function specPath(name, root) {
  return path.join(specsDir(root), name);
}

module.exports = {
  id: 'github-speckit',
  specsDir,
  listSpecs,
  specPath,
  docs: { primary: 'spec.md', plan: 'plan.md', tasks: 'tasks.md' },
  contextFiles: ['spec.md', 'plan.md', 'research.md', 'data-model.md', 'quickstart.md', 'tasks.md'],
  contextDirs: ['contracts', 'checklists'],
  requiredArtifacts: ['plan.md', 'tasks.md'],
  optionalArtifacts: ['data-model.md', 'contracts'],
  readStatus(name, root) {
    return readStatusFromFile(path.join(specPath(name, root), 'spec.md'));
  },
  writeStatus(name, status, root) {
    writeStatusToFile(path.join(specPath(name, root), 'spec.md'), status);
  },
};
