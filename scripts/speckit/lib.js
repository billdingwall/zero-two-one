'use strict';

/**
 * lib.js — shared helpers for the Zero Two One Speckit integration scripts.
 *
 * Conventions encoded here (see workflow/workflows.md):
 * - Feature specs live in specs/NNN-feature-name/ (Spec Kit layout).
 * - Feature branches are named NNN-feature-name and map 1:1 to a spec dir.
 * - Every spec.md carries a lifecycle status, either as YAML frontmatter
 *   (`status: Approved`) or an inline line (`**Status**: Approved`).
 * - Implementation may only begin once the status is gate-passing.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const STATUSES = ['Draft', 'In Review', 'Approved', 'Ready for Dev', 'In Progress', 'Done'];
const GATE_PASSING = ['Approved', 'Ready for Dev', 'In Progress', 'Done'];

function repoRoot() {
  try {
    return execSync('git rev-parse --show-toplevel', { stdio: ['pipe', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch (_) {
    return process.cwd();
  }
}

function specsDir() {
  return path.join(repoRoot(), 'specs');
}

function contextDir() {
  return path.join(repoRoot(), '.ai', 'context');
}

function currentBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD', { stdio: ['pipe', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch (_) {
    return null;
  }
}

/** All spec directories following the NNN-feature-name convention, sorted. */
function listSpecs() {
  const dir = specsDir();
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d{3}-/.test(e.name))
    .map((e) => e.name)
    .sort();
}

/**
 * Resolve a spec directory name from an explicit id/name, or fall back to
 * the current git branch when it follows the NNN-feature-name convention.
 * Accepts: "1", "001", "001-feature-name", "feature-name" (prefix match).
 */
function resolveSpec(idOrName) {
  const specs = listSpecs();
  if (idOrName) {
    const id = String(idOrName).trim();
    if (specs.includes(id)) return id;
    if (/^\d+$/.test(id)) {
      const padded = id.padStart(3, '0');
      return specs.find((s) => s.startsWith(padded + '-')) || null;
    }
    return specs.find((s) => s.startsWith(id) || s.slice(4) === id) || null;
  }
  const branch = currentBranch();
  if (branch && /^\d{3}-/.test(branch)) {
    return specs.find((s) => s === branch) || specs.find((s) => s.startsWith(branch.slice(0, 4))) || null;
  }
  return null;
}

function specPath(name) {
  return path.join(specsDir(), name);
}

/**
 * Read the lifecycle status from a spec's spec.md.
 * Returns null when spec.md is missing, 'Draft' when no status is declared.
 */
function readStatus(name) {
  const specFile = path.join(specPath(name), 'spec.md');
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
 * Persist a lifecycle status into spec.md, updating whichever declaration
 * style the file already uses (frontmatter preferred), or inserting an
 * inline `**Status**:` line directly under the first heading.
 */
function writeStatus(name, status) {
  const specFile = path.join(specPath(name), 'spec.md');
  if (!fs.existsSync(specFile)) {
    throw new Error(`spec.md not found for ${name}`);
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
    // Insert after the first markdown heading so the status is always visible.
    const lines = text.split('\n');
    const headingIdx = lines.findIndex((l) => /^#/.test(l));
    const insertAt = headingIdx === -1 ? 0 : headingIdx + 1;
    lines.splice(insertAt, 0, '', `**Status**: ${status}`);
    text = lines.join('\n');
  }

  fs.writeFileSync(specFile, text);
}

function isGatePassing(status) {
  return GATE_PASSING.includes(status);
}

/** Count checkbox tasks in a tasks.md body. */
function countTasks(text) {
  const total = (text.match(/^[ \t]*[-*][ \t]+\[[ xX]\]/gm) || []).length;
  const completed = (text.match(/^[ \t]*[-*][ \t]+\[[xX]\]/gm) || []).length;
  return { total, completed, remaining: total - completed };
}

/**
 * Extract acceptance/success criteria bullets from a markdown body:
 * every list item under a heading whose text mentions
 * "acceptance criteria" or "success criteria", until the next heading of
 * the same or higher level.
 */
function extractCriteria(text) {
  const criteria = [];
  const lines = text.split('\n');
  let capturing = false;
  let captureLevel = 0;
  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      if (capturing && level <= captureLevel) capturing = false;
      if (/(acceptance|success)\s+criteria/i.test(heading[2])) {
        capturing = true;
        captureLevel = level;
      }
      continue;
    }
    if (capturing) {
      const item = line.match(/^[ \t]*(?:[-*]|\d+\.)[ \t]+(.*\S)/);
      if (item) criteria.push(item[1].replace(/^\[[ xX]\][ \t]*/, ''));
    }
  }
  return criteria;
}

module.exports = {
  STATUSES,
  GATE_PASSING,
  repoRoot,
  specsDir,
  contextDir,
  currentBranch,
  listSpecs,
  resolveSpec,
  specPath,
  readStatus,
  writeStatus,
  isGatePassing,
  countTasks,
  extractCriteria,
};
