'use strict';

/**
 * migrate/growth-entry.js — Growth-phase entry shape (spec 002 FR-009).
 *
 * When the confirmed phase is `growth`, ensure `05-ROADMAP.md`/`04-BACKLOG.md`
 * exist in post-transition shape (Releases active, MVP frozen as history) per
 * mvp-to-growth-transition.md. Precedence (analyze A1): duplicate resolution
 * governs a file the user already has — growth-entry only fills a *missing*
 * roadmap/backlog and never overwrites an existing one. The post-transition
 * content *variant* rides on the shipped template (a template concern); this
 * step owns the "present, never overwritten" guarantee.
 */

const fs = require('fs');
const path = require('path');
const { instantiate } = require('../instantiate');

const DOCS = [
  { dest: 'requirements/05-ROADMAP.md', template: '05-ROADMAP-Template.md' },
  { dest: 'requirements/04-BACKLOG.md', template: '04-BACKLOG-Template.md' },
];

/** @returns {string[]} the docs newly created (existing files left untouched). */
function growthEntry({ sourceDir, targetDir }) {
  const created = [];
  for (const d of DOCS) {
    const abs = path.join(targetDir, d.dest);
    const template = path.join(sourceDir, 'templates', d.template);
    if (fs.existsSync(abs)) continue; // duplicate resolution governs (A1)
    if (!fs.existsSync(template)) continue;
    instantiate(template, abs);
    created.push(d.dest);
  }
  return created;
}

module.exports = { growthEntry };
