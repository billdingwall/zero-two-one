'use strict';

/**
 * surface.js — rendered Layer-2 surface producer (spec 007, FR-001).
 *
 * Some stacks expose the framework's skills/commands not as a verbatim dir copy
 * (claude's `.claude/commands`, handled by `surfaceDirs`) but as a *transform*:
 * antigravity renders flat `skills/*.md` + the lifecycle commands into a per-skill
 * `.agents/skills/021-<name>/SKILL.md` tree. Those dest files don't exist in the
 * source, so they can't be enumerated by walking a dir — this module produces them.
 *
 * `fs`/`path` + string ops only — no glob/YAML dependency (FR-010). The `match`
 * pattern is handled by a tiny built-in suffix/prefix matcher (analyze A6).
 *
 * Pure producer: returns `[{ dest, content }]`; writes nothing. `classify.js`
 * runs the ownership state machine over the results; `apply.js` writes them.
 */

const fs = require('fs');
const path = require('path');
const { getAdapter } = require('./adapters');
const { toPosix } = require('./classes');

/**
 * Match a basename against a simple pattern with at most one `*` wildcard
 * (`*.md`, `021-*.md`, `021-init.md`). Not a glob library — just prefix/suffix.
 */
function matchName(name, pattern) {
  const star = pattern.indexOf('*');
  if (star === -1) return name === pattern;
  const prefix = pattern.slice(0, star);
  const suffix = pattern.slice(star + 1);
  return name.length >= prefix.length + suffix.length && name.startsWith(prefix) && name.endsWith(suffix);
}

/** Apply the framework naming convention (§6): ensure a single `021-` prefix. */
function namespaced(base) {
  return base.startsWith('021-') ? base : `021-${base}`;
}

/** First non-empty, trimmed line of a body — the synthesized SKILL.md description. */
function firstLine(body) {
  for (const raw of body.split('\n')) {
    const line = raw.replace(/^#+\s*/, '').trim();
    if (line) return line;
  }
  return '';
}

/** Descriptor kinds that relocate a file flat (keep its filename), vs. the
 * per-item `021-<name>/SKILL.md` subdir shape used by skills/commands. */
const FLAT_KINDS = new Set(['steering', 'agent-json']);

/**
 * Render one descriptor's files into `{ dest, content }` entries.
 * - `kind: 'skill'`     → per-item `<toDir>/021-<name>/SKILL.md`, source verbatim
 *   (frontmatter already added at rest, FR-002).
 * - `kind: 'command'`   → per-item `SKILL.md` with synthesized `name`/`description`
 *   frontmatter + body (the command source is golden-pinned — research R2).
 * - `kind: 'steering'`  → flat `<toDir>/<basename>`, source verbatim (the steering
 *   template already carries its Kiro inclusion-mode frontmatter — spec 008 FR-002).
 * - `kind: 'agent-json'`→ flat `<toDir>/021.json`, source verbatim (spec 008 FR-003).
 */
function renderDescriptor(sourceDir, desc) {
  const dirAbs = path.join(sourceDir, desc.fromDir);
  if (!fs.existsSync(dirAbs)) return [];
  const exclude = new Set(desc.exclude || []);
  const flat = FLAT_KINDS.has(desc.kind);
  const out = [];

  for (const entry of fs.readdirSync(dirAbs, { withFileTypes: true })) {
    if (!entry.isFile() || exclude.has(entry.name) || !matchName(entry.name, desc.match)) continue;

    const body = fs.readFileSync(path.join(dirAbs, entry.name), 'utf8');

    if (flat) {
      // Keep the filename (already 021-namespaced in the source); no subdir, no rename.
      out.push({ dest: toPosix(path.join(desc.toDir, entry.name)), content: body });
      continue;
    }

    const base = namespaced(entry.name.replace(/\.md$/, ''));
    const dest = toPosix(path.join(desc.toDir, base, 'SKILL.md'));
    const content =
      desc.kind === 'command'
        ? `---\nname: ${base}\ndescription: ${firstLine(body)}\n---\n\n${body}`
        : body;

    out.push({ dest, content });
  }
  return out;
}

/**
 * The full rendered Layer-2 surface for `stack`, sorted by dest. Empty for a
 * stack with no `surfaceRenders` (e.g. claude), so callers stay stack-agnostic.
 * @param {string} sourceDir
 * @param {string} [stack]
 * @returns {{ dest: string, content: string }[]}
 */
function renderSurface(sourceDir, stack) {
  const { surfaceRenders } = getAdapter(stack);
  if (!surfaceRenders || surfaceRenders.length === 0) return [];

  const out = [];
  for (const desc of surfaceRenders) out.push(...renderDescriptor(sourceDir, desc));
  return out.sort((a, b) => (a.dest < b.dest ? -1 : a.dest > b.dest ? 1 : 0));
}

module.exports = { renderSurface, matchName, namespaced };
