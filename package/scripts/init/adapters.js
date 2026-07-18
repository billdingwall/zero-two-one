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
 * @typedef {object} RenderDescriptor
 * @property {string} fromDir  Source dir (relpath under the source root) holding the input files.
 * @property {string} match    Filename pattern — a built-in suffix/prefix mini-matcher, not a glob
 *   dependency (`*.md`, `021-*.md`); interpreted by surface.js (spec 007, analyze A6).
 * @property {string[]} [exclude]  Basenames to skip (e.g. `_INDEX.md`).
 * @property {string} toDir    Framework-owned dest dir the surface writes into (`.agents/skills`).
 * @property {'skill'|'command'} kind  Transform selector (surface.js). 008 adds `steering`/`agent-json`.
 *
 * @typedef {object} StackAdapter
 * @property {{ template: string, dest: string, honored?: string[] }} entrypoint
 *   Neutral source template (under `templates/`) → rendered entrypoint dest. `honored` lists
 *   target files that, when present, are the entrypoint instead of `dest` (spec 007 FR-004).
 * @property {string[]} surfaceDirs
 *   Layer-2 command/skill dirs this stack owns, copied verbatim (framework-owned when chosen).
 * @property {RenderDescriptor[]} [surfaceRenders]
 *   Rendered Layer-2 surfaces — files produced by a transform, not copied from a source dir
 *   (spec 007 FR-001). Their `toDir`s are framework-owned but are NOT walked as source dirs.
 */

/** @type {Record<string, StackAdapter>} */
const ADAPTERS = {
  claude: {
    entrypoint: { template: 'ASSISTANT-Template.md', dest: 'CLAUDE.md' },
    surfaceDirs: ['.claude/commands'],
  },
  antigravity: {
    // Entrypoint: AGENTS.md, or an existing GEMINI.md is honored in its place (spec 007 FR-004).
    entrypoint: { template: 'ASSISTANT-Template.md', dest: 'AGENTS.md', honored: ['GEMINI.md'] },
    surfaceDirs: [],
    // The skills library + lifecycle commands render into .agents/skills/021-*/SKILL.md (spec 007).
    surfaceRenders: [
      { fromDir: 'skills', match: '*.md', exclude: ['_INDEX.md'], toDir: '.agents/skills', kind: 'skill' },
      { fromDir: '.claude/commands', match: '021-*.md', toDir: '.agents/skills', kind: 'command' },
    ],
  },
  kiro: {
    // No entrypoint — steering is the instruction surface, not an ASSISTANT-Template
    // rendering (spec 008 FR-001). Every entrypoint reader null-guards this.
    surfaceDirs: [],
    surfaceRenders: [
      // Stable framework operating-guidance steering, flat-relocated (keep filename).
      { fromDir: 'templates/kiro-steering', match: '021-*.md', toDir: '.kiro/steering', kind: 'steering' },
      // The Kiro CLI agent definition.
      { fromDir: 'templates/kiro-agent', match: '021.json', toDir: '.kiro/agents', kind: 'agent-json' },
      // The skills library, materialized natively (reuses the spec 007 skill render).
      { fromDir: 'skills', match: '*.md', exclude: ['_INDEX.md'], toDir: '.kiro/skills', kind: 'skill' },
    ],
  },
};

/**
 * Stacks accepted by the CLI but not yet renderable (fail loudly — analyze A5).
 * Empty now that kiro is populated (spec 008); kept as the seam for any future
 * reserved stack.
 */
const RESERVED = new Set();

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
