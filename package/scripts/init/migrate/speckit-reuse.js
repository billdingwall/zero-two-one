'use strict';

/**
 * migrate/speckit-reuse.js — reuse an existing Spec Kit surface (spec 002 FR-008).
 *
 * When the target already carries `.specify/` or a populated `specs/`, migrate
 * validates each spec's `status:` frontmatter, reports what it found, and skips
 * duplicate Spec Kit setup. A spec with missing/invalid frontmatter is reported
 * and skipped anyway — the user's spec files are never modified (clarified R10).
 */

const fs = require('fs');
const path = require('path');
const { populatedSpecs } = require('./detect');

/** Read a resolvable `status:` from a spec's frontmatter, or null. */
function specStatus(abs) {
  let text;
  try {
    text = fs.readFileSync(abs, 'utf8');
  } catch (_) {
    return null;
  }
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!fm) return null;
  const m = /^status:\s*(.+)$/m.exec(fm[1]);
  return m ? m[1].trim() : null;
}

/**
 * Detect + validate + report. Never writes.
 * @returns {{ reused:boolean, specs:number, invalid:string[] }}
 */
function speckitReuse(targetDir) {
  const hasSpecify = fs.existsSync(path.join(targetDir, '.specify'));
  const specs = populatedSpecs(targetDir);
  if (!hasSpecify && specs.length === 0) return { reused: false, specs: 0, invalid: [] };

  const invalid = specs.filter((rel) => !specStatus(path.join(targetDir, rel)));
  return { reused: true, specs: specs.length, invalid };
}

module.exports = { speckitReuse, specStatus };
