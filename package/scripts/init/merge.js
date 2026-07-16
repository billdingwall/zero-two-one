'use strict';

/**
 * merge.js — additive merge for the `merged` file class (spec 001 FR-005/FR-016).
 *
 * Framework entries are added only if absent AND not already recorded as
 * contributed — so a user's deletion of a previously-contributed entry is
 * respected, and a user's own value on a colliding key is preserved.
 */

const fs = require('fs');
const path = require('path');

/** The `.gitignore` lines the framework contributes. */
const GITIGNORE_ENTRIES = [
  '# zero-two-one: generated AI context bundles (rebuild with `npm run 021-spec:context`)',
  '.ai/context/*',
  '!.ai/context/.gitkeep',
  'node_modules/',
];

/** The lifecycle npm scripts the framework contributes. */
const LIFECYCLE_SCRIPTS = {
  '021-status': 'node scripts/workflow-status.js',
  '021-qa': 'sh scripts/run-qa.sh',
  '021-spec:status': 'node scripts/speckit/spec-status.js',
  '021-spec:context': 'node scripts/speckit/fetch-speckit-context.js',
  '021-spec:verify': 'node scripts/speckit/verify-spec-compliance.js',
};

/**
 * Compute an additive .gitignore merge.
 * @returns {{ content: string, contributed: string[], changed: boolean }}
 */
function mergeGitignore(existing, prevContributed) {
  const contributed = new Set(prevContributed || []);
  const lines = existing ? existing.replace(/\r\n/g, '\n').split('\n') : [];
  const present = new Set(lines.map((l) => l.trim()).filter(Boolean));
  const toAppend = [];

  for (const entry of GITIGNORE_ENTRIES) {
    if (contributed.has(entry)) continue; // previously contributed — respect user's current state
    if (!present.has(entry)) toAppend.push(entry);
    contributed.add(entry);
  }

  if (!toAppend.length) {
    return { content: existing || '', contributed: [...contributed], changed: false };
  }
  const base = existing ? existing.replace(/\s*$/, '') + '\n\n' : '';
  return { content: base + toAppend.join('\n') + '\n', contributed: [...contributed], changed: true };
}

/**
 * Compute an additive package.json scripts merge. Creates a minimal package.json
 * when `existingText` is null (FR-016).
 * @returns {{ text: string, contributed: string[], changed: boolean, created: boolean }}
 */
function mergePackageJson(existingText, prevContributed, targetName) {
  const created = existingText == null;
  let pkg;
  if (created) {
    pkg = { name: targetName || 'my-project', version: '0.0.0', private: true, scripts: {} };
  } else {
    pkg = JSON.parse(existingText);
    if (!pkg.scripts || typeof pkg.scripts !== 'object') pkg.scripts = {};
  }

  const contributed = new Set(prevContributed || []);
  let changed = created;

  for (const [key, cmd] of Object.entries(LIFECYCLE_SCRIPTS)) {
    if (contributed.has(key)) continue; // previously contributed — respect deletion/customization
    if (!(key in pkg.scripts)) {
      pkg.scripts[key] = cmd; // add only when absent (collision preserves user's value)
      changed = true;
    }
    contributed.add(key);
  }

  return {
    text: JSON.stringify(pkg, null, 2) + '\n',
    contributed: [...contributed],
    changed,
    created,
  };
}

module.exports = { GITIGNORE_ENTRIES, LIFECYCLE_SCRIPTS, mergeGitignore, mergePackageJson };
