'use strict';

/**
 * adapters.js — the stack-adapter registry (spec 006, FR-006, TDD §9.1).
 *
 * The single source of truth for per-stack Layer-2 bindings: which entrypoint
 * doc is rendered, and which command/skill directories that stack owns. Both
 * `classes.js` (ownership) and `sources.js` (install surface) read it. Adding a
 * stack = adding one entry here; specs 007 (Antigravity skills) and 008 (Kiro)
 * extend this table rather than editing scattered constants.
 *
 * Imports nothing from classes/sources — keeps the dependency edges one-way
 * (classes → adapters, sources → adapters) with no cycle. Zero deps.
 */

/**
 * @typedef {object} StackAdapter
 * @property {{ template: string, dest: string }} entrypoint
 *   Neutral source template (under `templates/`) → rendered entrypoint dest.
 * @property {string[]} surfaceDirs
 *   Layer-2 command/skill dirs this stack owns (framework-owned when chosen).
 */

/** @type {Record<string, StackAdapter>} */
const ADAPTERS = {
  claude: {
    entrypoint: { template: 'ASSISTANT-Template.md', dest: 'CLAUDE.md' },
    surfaceDirs: ['.claude/commands'],
  },
  antigravity: {
    // Skills tree (.agents/skills/021-*) is spec 007; 006 renders the entrypoint only.
    entrypoint: { template: 'ASSISTANT-Template.md', dest: 'AGENTS.md' },
    surfaceDirs: [],
  },
  // kiro — reserved; populated by spec 008 (steering + .kiro/agents + kiro-specs dispatch).
};

/** Stacks accepted by the CLI but not yet renderable (fail loudly — analyze A5). */
const RESERVED = new Set(['kiro']);

/**
 * Resolve a stack's adapter. Absent/unknown → `claude` (FR-007 back-compat for
 * pre-mvp-4 manifests). A known-but-unpopulated stack (`kiro`) throws rather
 * than silently rendering a claude tree under a mismatched manifest (analyze A5).
 * @param {string} [stack]
 * @returns {StackAdapter}
 */
function getAdapter(stack) {
  if (stack && RESERVED.has(stack)) {
    throw new Error(`stack '${stack}' is not yet supported — it lands in a later mvp-4 spec (008). Use --stack claude or antigravity.`);
  }
  return ADAPTERS[stack] || ADAPTERS.claude;
}

module.exports = { ADAPTERS, RESERVED, getAdapter };
