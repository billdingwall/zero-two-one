'use strict';

/**
 * migrate/duplicates.js — exact-dest duplicate resolution (spec 002 FR-007).
 *
 * A duplicate is a user file sitting where the framework would write. Each is
 * resolved archive | update(wrap) | leave, per --dup / prompt / safe default.
 * The content invariant is absolute: archive moves + records a pointer, update
 * embeds the original verbatim, leave never touches it. Decisions and the
 * imported/archived sets are returned for the manifest (FR-011) and are
 * manifest-driven on re-run — a recorded decision is never re-applied.
 */

const fs = require('fs');
const path = require('path');
const { userDocMappings } = require('../sources');
const { instantiate } = require('../instantiate');
const { resolveDuplicate } = require('./interview');
const { updateCatalog } = require('./import');
const { toPosix } = require('../classes');

/** Guiding/router docs whose framework version must survive a leave (FR-007). */
const GUIDING = new Set(['CLAUDE.md', 'CODE.md', 'PRODUCT.md', 'DESIGN.md']);

const ROLE = {
  'CLAUDE.md': 'assistant router (CLAUDE)',
  'CODE.md': 'engineering guide (CODE)',
  'PRODUCT.md': 'product guide (PRODUCT)',
  'DESIGN.md': 'design guide (DESIGN)',
  'README.md': 'project readme',
};

/** Exact-dest collisions: instantiable user docs that already exist. */
function findCollisions(sourceDir, targetDir) {
  return userDocMappings(sourceDir).filter((m) => fs.existsSync(path.join(targetDir, m.dest)));
}

/** Pick an unused archive path (never overwrite an existing archive). */
function uniqueArchivePath(abs) {
  if (!fs.existsSync(abs)) return abs;
  const ext = path.extname(abs);
  const base = abs.slice(0, -ext.length || undefined);
  for (let i = 2; ; i++) {
    const candidate = `${base}-${i}${ext}`;
    if (!fs.existsSync(candidate)) return candidate;
  }
}

/** namespaced coexistence copy, e.g. CLAUDE.md → CLAUDE.zero-two-one.md. */
function namespaced(dest) {
  return dest.replace(/\.md$/, '.zero-two-one.md');
}

function roleFor(dest) {
  if (ROLE[dest]) return ROLE[dest];
  if (dest.startsWith('requirements/')) return dest.slice('requirements/'.length).replace(/\.md$/, '');
  return dest;
}

/**
 * Resolve every collision and apply the chosen action.
 * @returns {{ duplicates:object, imported:string[], archived:object }}
 */
function resolveDuplicates({ sourceDir, targetDir, opts, prevManifest }) {
  const prev = (prevManifest && prevManifest.migrate) || null;

  // Re-run: the duplicate set is fixed at the first migrate pass. Honor the
  // recorded decisions and discover nothing new — otherwise the docs the base
  // pipeline instantiated last run would be mistaken for fresh duplicates
  // (FR-011, manifest-driven idempotency).
  if (prev) {
    return {
      duplicates: { ...(prev.duplicates || {}) },
      imported: [...(prev.imported || [])],
      archived: { ...(prev.archived || {}) },
    };
  }

  const record = { duplicates: {}, imported: [], archived: {} };
  const catalogRows = [];

  for (const m of findCollisions(sourceDir, targetDir)) {
    const dest = m.dest;
    const action = resolveDuplicate(dest, opts);
    const absDest = path.join(targetDir, dest);
    const templatePath = path.join(sourceDir, 'templates', m.template);

    if (action === 'archive') {
      const archiveAbs = uniqueArchivePath(path.join(targetDir, 'requirements', '_notes', 'archive', dest));
      fs.mkdirSync(path.dirname(archiveAbs), { recursive: true });
      fs.renameSync(absDest, archiveAbs);
      instantiate(templatePath, absDest); // fresh template at the dest
      record.archived[dest] = toPosix(path.relative(targetDir, archiveAbs));
      record.duplicates[dest] = 'archive';
    } else if (action === 'update') {
      const userContent = fs.readFileSync(absDest, 'utf8');
      const template = fs.readFileSync(templatePath, 'utf8').replace(/\s*$/, '');
      fs.writeFileSync(absDest, `${template}\n\n## Imported content\n\n${userContent.replace(/\s*$/, '')}\n`);
      record.duplicates[dest] = 'update';
    } else {
      // leave-alongside: keep the user's file, catalog it, coexist for guiding docs.
      record.duplicates[dest] = 'leave';
      record.imported.push(dest);
      catalogRows.push({ path: dest, role: roleFor(dest) });
      if (GUIDING.has(dest)) instantiate(templatePath, path.join(targetDir, namespaced(dest)));
    }
  }

  // Catalog + manifest.imported are written from the same set (analyze A6).
  if (catalogRows.length) updateCatalog(targetDir, catalogRows);

  return record;
}

module.exports = { findCollisions, resolveDuplicates, GUIDING, namespaced };
