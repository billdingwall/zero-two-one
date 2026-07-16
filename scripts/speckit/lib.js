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

// --- Manifest as QA contract (spec 003) ---------------------------------
//
// The single place the lifecycle scripts (run-qa.sh, workflow-status.js, the
// gate) read the project's phase/stack. The install engine under scripts/init/
// keeps its own manifest I/O (specs 001/002) and is out of scope here.

/** Canonical phase vocabulary — the one copy (TDD §7). Labels are exact for parity. */
const PHASE = {
  planning: { num: 0, label: 'Planning (Zero)' },
  prebuild: { num: 0, label: 'Planning (Zero)' }, // legacy alias → Planning (r6)
  mvp: { num: 1, label: 'MVP Build (One)' },
  growth: { num: 2, label: 'Growth' },
};
const PHASE_KEY_BY_NUM = { 0: 'planning', 1: 'mvp', 2: 'growth' };

function manifestFile(root) {
  return path.join(root || repoRoot(), '.zero-two-one.json');
}

/** Parsed `.zero-two-one.json`, or null when absent/unparseable. Never throws. */
function readManifest(root = repoRoot()) {
  const p = manifestFile(root);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (_) {
    return null;
  }
}

/**
 * Infer phase from repo state when there is no manifest (spec 003 FR-006).
 * Preserves the former workflow-status.js heuristic: a top-level specs/*.md
 * ⇒ MVP Build; otherwise Planning (the old PRD sub-check resolved to Planning
 * either way, so it is elided without behavior change).
 */
function inferFacts(root) {
  const dir = path.join(root, 'specs');
  let hasSpecs = false;
  if (fs.existsSync(dir)) {
    hasSpecs = fs.readdirSync(dir).some((f) => f.endsWith('.md') && f !== '_INDEX.md');
  }
  const num = hasSpecs ? 1 : 0;
  return {
    phase: PHASE_KEY_BY_NUM[num],
    phaseNum: num,
    phaseLabel: num === 1 ? 'MVP Build (One)' : 'Planning (Zero)',
    stack: null,
    mode: null,
    source: 'inferred',
  };
}

/**
 * The whole phase/stack resolution (spec 003 FR-001): manifest → inference →
 * Planning. Always returns a fully-populated ManifestFacts. An unparseable
 * manifest warns once (to stderr) and falls through to inference.
 */
function manifestFacts(root = repoRoot()) {
  const p = manifestFile(root);
  const manifest = readManifest(root);
  if (fs.existsSync(p) && manifest === null) {
    console.warn('⚠️  Could not parse .zero-two-one.json; falling back to inference.');
  }
  const key = manifest && typeof manifest.phase === 'string' ? manifest.phase.toLowerCase() : null;
  if (key && PHASE[key]) {
    const v = PHASE[key];
    return {
      phase: PHASE_KEY_BY_NUM[v.num],
      phaseNum: v.num,
      phaseLabel: v.label,
      stack: (manifest.tools && manifest.tools.stack) || null,
      mode: manifest.mode || null,
      source: 'manifest',
    };
  }
  return inferFacts(root);
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
  PHASE,
  readManifest,
  manifestFacts,
};

// --- CLI (spec 003): `node scripts/speckit/lib.js phase` → phaseNum ---------
if (require.main === module) {
  const sub = process.argv[2];
  if (sub === 'phase') {
    process.stdout.write(String(manifestFacts().phaseNum) + '\n');
    process.exit(0);
  }
  process.stderr.write('Usage: node scripts/speckit/lib.js phase\n');
  process.exit(1);
}
