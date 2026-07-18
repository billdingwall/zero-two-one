'use strict';

/**
 * instantiate.js — produce a user-owned doc from its template (spec 001 FR-017).
 *
 * Instantiation is a verbatim copy of `templates/<name>-Template.md` to its
 * destination — used for the common guiding docs (CODE/PRODUCT/DESIGN/README)
 * and the requirements docs. The stack **entrypoint** doc is instead produced
 * by `scripts/init/render.js` from the neutral `ASSISTANT-Template.md` source
 * (spec 006, TDD §9.1–9.2).
 */

const fs = require('fs');
const path = require('path');

/** Instantiate a template file to `destPath`, creating parent dirs. */
function instantiate(templatePath, destPath) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.copyFileSync(templatePath, destPath);
}

module.exports = { instantiate };
