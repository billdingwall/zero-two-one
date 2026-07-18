'use strict';

/**
 * kiro-specs.js — the Kiro SSD engine (spec 008, FR-007; TDD §9.3).
 *
 * Feature specs live in `.kiro/specs/<feature>/{requirements,design,tasks}.md`
 * (EARS). The gate-readable `status:` is injected into `requirements.md`
 * frontmatter (Kiro tolerates extra keys); task progress is read from
 * `tasks.md`. Same SpecEngine interface as github-speckit — only the layout and
 * the status-carrying doc differ. Zero dependencies.
 */

const fs = require('fs');
const path = require('path');
const { readStatusFromFile, writeStatusToFile } = require('./status-frontmatter');

function specsDir(root) {
  return path.join(root, '.kiro', 'specs');
}

/** Every feature dir under .kiro/specs (Kiro uses feature names — no NNN- filter). */
function listSpecs(root) {
  const dir = specsDir(root);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort();
}

function specPath(name, root) {
  return path.join(specsDir(root), name);
}

module.exports = {
  id: 'kiro-specs',
  specsDir,
  listSpecs,
  specPath,
  docs: { primary: 'requirements.md', plan: 'design.md', tasks: 'tasks.md' },
  contextFiles: ['requirements.md', 'design.md', 'tasks.md'],
  contextDirs: [],
  requiredArtifacts: ['design.md', 'tasks.md'],
  optionalArtifacts: [],
  readStatus(name, root) {
    return readStatusFromFile(path.join(specPath(name, root), 'requirements.md'));
  },
  writeStatus(name, status, root) {
    writeStatusToFile(path.join(specPath(name, root), 'requirements.md'), status);
  },
};
