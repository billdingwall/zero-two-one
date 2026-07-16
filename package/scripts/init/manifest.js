'use strict';

/**
 * manifest.js — read/write `.zero-two-one.json` (spec 001 FR-009, TDD §7).
 *
 * Additive fields introduced by this spec: `updatedAt` (installedAt preserved,
 * updatedAt refreshed on re-run/upgrade), and `merged` (framework-contributed
 * entries per merged file, so user deletions are respected). `files{}` holds
 * framework-owned hashes only.
 */

const fs = require('fs');
const path = require('path');

const MANIFEST_NAME = '.zero-two-one.json';

function manifestPath(targetDir) {
  return path.join(targetDir, MANIFEST_NAME);
}

/** Read the manifest, or null when absent/unparseable. */
function loadManifest(targetDir) {
  const p = manifestPath(targetDir);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return null;
  }
}

/**
 * Build the manifest object.
 * @param {object} args
 *   prev       - previous manifest (null on first install)
 *   version    - package version
 *   mode       - scaffold | source
 *   phase      - planning | mvp | growth
 *   tools      - { stack, assistant, ssd, design }
 *   files      - { relpath: sha256 } framework-owned only
 *   merged     - { file: [contributed entries] }
 *   now        - ISO timestamp (injectable for tests)
 */
function buildManifest({ prev, version, mode, phase, tools, files, merged, migrate, now }) {
  const ts = now || new Date().toISOString();
  const installedAt = prev && prev.installedAt ? prev.installedAt : ts;
  const manifest = {
    version,
    installedAt,
    mode,
    phase,
    tools,
    files,
    merged,
  };
  // migrate block — present only in mode:migrate (spec 002 FR-011).
  if (migrate) manifest.migrate = migrate;
  // updatedAt is present only from the first re-run onward (FR-009).
  if (prev) manifest.updatedAt = ts;
  return manifest;
}

/** Field order for a stable, diff-friendly on-disk manifest. */
const FIELD_ORDER = ['version', 'installedAt', 'updatedAt', 'mode', 'phase', 'tools', 'files', 'merged', 'migrate'];

function orderFields(manifest) {
  const out = {};
  for (const key of FIELD_ORDER) {
    if (manifest[key] !== undefined) out[key] = manifest[key];
  }
  return out;
}

function writeManifest(targetDir, manifest) {
  fs.writeFileSync(manifestPath(targetDir), JSON.stringify(orderFields(manifest), null, 2) + '\n');
}

module.exports = { MANIFEST_NAME, manifestPath, loadManifest, buildManifest, writeManifest, orderFields };
