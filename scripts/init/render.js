'use strict';

/**
 * render.js — entrypoint renderer (spec 006, FR-002, TDD §9.1).
 *
 * Transforms the neutral `templates/ASSISTANT-Template.md` source into a stack's
 * entrypoint document (claude → CLAUDE.md, antigravity → AGENTS.md). Runs inside
 * the apply pipeline (apply.js render branch), not the bin/init.js shell.
 *
 * `fs`/`path` + string ops only — no templating/YAML library; frontmatter (if
 * any) is emitted as plain text (zero-dependency constraint, FR-011).
 *
 * The `claude` render MUST be byte-identical to the pre-006 template output (the
 * regression bar, FR-010) — so the neutral source is authored such that the
 * claude token set is empty (identity). Per-stack phrasing for antigravity/kiro
 * is added by their specs (007/008) as tokens below; claude stays identity.
 */

const fs = require('fs');

/**
 * Per-stack substitution tokens applied to the neutral source. Empty in 006 —
 * the neutral body is already assistant-agnostic. 007/008 populate the
 * antigravity/kiro maps; `claude` must remain empty to hold the byte bar.
 * @type {Record<string, Record<string, string>>}
 */
const STACK_TOKENS = {
  claude: {},
  antigravity: {},
};

/** Markers wrapping a user-owned local section preserved across re-renders (FR-003). */
const LOCAL_START = '<!-- 021:local:start -->';
const LOCAL_END = '<!-- 021:local:end -->';

/**
 * Extract a marked local section (inclusive of markers) from existing content,
 * or null if none. Used to carry a user's dogfood/local preamble through a
 * re-render (FR-003).
 */
function extractLocalSection(existing) {
  if (!existing) return null;
  const start = existing.indexOf(LOCAL_START);
  const end = existing.indexOf(LOCAL_END);
  if (start === -1 || end === -1 || end < start) return null;
  return existing.slice(start, end + LOCAL_END.length);
}

/**
 * Render the entrypoint document for `stack` from the neutral source at
 * `templatePath`.
 * @param {string} templatePath - path to ASSISTANT-Template.md
 * @param {string} stack - 'claude' | 'antigravity'
 * @param {object} [opts] - { existing?: string } current dest content, for
 *   local-section preservation
 * @returns {string} the rendered entrypoint text
 */
function renderEntrypoint(templatePath, stack, opts = {}) {
  const source = fs.readFileSync(templatePath, 'utf8');
  const tokens = STACK_TOKENS[stack] || {};

  let out = source;
  for (const [needle, value] of Object.entries(tokens)) {
    out = out.split(needle).join(value);
  }

  // Preserve a user-owned local section from the existing entrypoint, if the
  // rendered output has a matching placeholder or the existing file carried one.
  const local = extractLocalSection(opts.existing);
  if (local) {
    if (out.includes(LOCAL_START) && out.includes(LOCAL_END)) {
      const start = out.indexOf(LOCAL_START);
      const end = out.indexOf(LOCAL_END) + LOCAL_END.length;
      out = out.slice(0, start) + local + out.slice(end);
    } else {
      out = out.replace(/\n*$/, '\n') + '\n' + local + '\n';
    }
  }

  return out;
}

module.exports = { renderEntrypoint, STACK_TOKENS, LOCAL_START, LOCAL_END, extractLocalSection };
