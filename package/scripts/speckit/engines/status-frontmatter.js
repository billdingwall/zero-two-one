'use strict';

/**
 * status-frontmatter.js — read/write a lifecycle `status:` in a spec document
 * (spec 008). Extracted verbatim from the pre-008 lib.js so both SSD engines
 * (`github-speckit` → spec.md, `kiro-specs` → requirements.md) share one copy of
 * the frontmatter/inline logic. Zero dependencies.
 */

const fs = require('fs');
const path = require('path');

/**
 * Read the lifecycle status from a spec file, preferring YAML frontmatter
 * (`status: Approved`) over an inline `**Status**:` line. Returns null when the
 * file is missing, 'Draft' when present but no status is declared.
 */
function readStatusFromFile(specFile) {
  if (!fs.existsSync(specFile)) return null;
  const text = fs.readFileSync(specFile, 'utf8');

  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm) {
    const m = fm[1].match(/^status:[ \t]*(.+)$/im);
    if (m) return m[1].trim().replace(/^['"]|['"]$/g, '');
  }
  const inline = text.match(/^\*\*Status\*\*:[ \t]*(.+)$/im);
  if (inline) return inline[1].replace(/\*+\s*$/, '').trim();

  return 'Draft';
}

/**
 * Persist a lifecycle status into a spec file, updating whichever declaration
 * style it already uses (frontmatter preferred), or inserting an inline
 * `**Status**:` line under the first heading. Throws if the file is absent.
 */
function writeStatusToFile(specFile, status) {
  if (!fs.existsSync(specFile)) {
    throw new Error(`${path.basename(specFile)} not found at ${specFile}`);
  }
  let text = fs.readFileSync(specFile, 'utf8');

  const fm = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (fm) {
    if (/^status:[ \t]*.+$/im.test(fm[1])) {
      const updated = fm[1].replace(/^status:[ \t]*.+$/im, `status: ${status}`);
      text = text.replace(fm[0], `---\n${updated}\n---`);
    } else {
      text = text.replace(fm[0], `---\n${fm[1]}\nstatus: ${status}\n---`);
    }
  } else if (/^\*\*Status\*\*:[ \t]*.+$/im.test(text)) {
    text = text.replace(/^\*\*Status\*\*:[ \t]*.+$/im, `**Status**: ${status}`);
  } else {
    const lines = text.split('\n');
    const headingIdx = lines.findIndex((l) => /^#/.test(l));
    const insertAt = headingIdx === -1 ? 0 : headingIdx + 1;
    lines.splice(insertAt, 0, '', `**Status**: ${status}`);
    text = lines.join('\n');
  }

  fs.writeFileSync(specFile, text);
}

module.exports = { readStatusFromFile, writeStatusToFile };
