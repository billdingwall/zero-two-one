'use strict';

/**
 * migrate/import.js — the imported-docs catalog (spec 002 FR-006).
 *
 * `requirements/_notes/imported-docs.md` lists every user doc kept in place by
 * a leave-alongside decision, so the guiding docs can link to it. Rows are
 * keyed by path → a re-run never adds a duplicate row (FR-011). The caller
 * writes the catalog and the manifest `imported` array from the same decision
 * set, so the two never drift (analyze A6).
 */

const fs = require('fs');
const path = require('path');

const CATALOG_REL = path.join('requirements', '_notes', 'imported-docs.md');

const HEADER = [
  '# Imported Docs',
  '',
  '*Pre-existing project docs kept in place during framework adoption (migrate-mode,',
  'leave-alongside). The framework references these rather than moving or rewriting them.*',
  '',
  '| Path | Framework role | Description |',
  '|---|---|---|',
  '',
].join('\n');

/** Extract the Path cell of each existing table row. */
function existingPaths(text) {
  const set = new Set();
  for (const line of text.split('\n')) {
    const m = /^\|\s*`?([^`|]+?)`?\s*\|/.exec(line);
    if (m && m[1] !== 'Path' && !/^-+$/.test(m[1].trim())) set.add(m[1].trim());
  }
  return set;
}

/**
 * Append rows for `entries` ({ path, role }) that aren't already cataloged.
 * Idempotent by path. Returns true if the file was written.
 */
function updateCatalog(targetDir, entries) {
  const abs = path.join(targetDir, CATALOG_REL);
  const exists = fs.existsSync(abs);
  let text = exists ? fs.readFileSync(abs, 'utf8') : HEADER;
  const have = existingPaths(text);

  const rows = [];
  for (const e of entries) {
    if (have.has(e.path)) continue;
    have.add(e.path);
    rows.push(`| \`${e.path}\` | ${e.role || '—'} | — |`);
  }
  if (!rows.length && exists) return false;

  if (!/\n$/.test(text)) text += '\n';
  text += rows.join('\n') + (rows.length ? '\n' : '');
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, text);
  return true;
}

module.exports = { CATALOG_REL, updateCatalog, existingPaths };
