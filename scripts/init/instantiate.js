'use strict';

/**
 * instantiate.js — produce a user-owned doc from its template (spec 001 FR-017).
 *
 * Default `claude`-stack mapping: instantiation is a verbatim copy of
 * `templates/<name>-Template.md` to its destination. Stack-aware rendering of
 * the neutral `ASSISTANT-Template.md` (per-stack output names/formats,
 * TDD §9.1–9.2) is deferred to mvp-4.
 */

const fs = require('fs');
const path = require('path');

/** Instantiate a template file to `destPath`, creating parent dirs. */
function instantiate(templatePath, destPath) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(templatePath, destPath);
}

module.exports = { instantiate };
