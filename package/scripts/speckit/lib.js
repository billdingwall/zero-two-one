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
const githubSpeckit = require('./engines/github-speckit');
const kiroSpecs = require('./engines/kiro-specs');

const STATUSES = ['Draft', 'In Review', 'Approved', 'Ready for Dev', 'In Progress', 'Done'];
const GATE_PASSING = ['Approved', 'Ready for Dev', 'In Progress', 'Done'];

/**
 * Resolve the active SSD engine from the manifest `tools.ssd` (spec 008 FR-007).
 * Anything other than `kiro-specs` (absent, `github-speckit`, unknown) → the
 * default `github-speckit`, preserving pre-mvp-4 / claude / antigravity behavior.
 */
function engineFor(root = repoRoot()) {
  return manifestFacts(root).ssd === 'kiro-specs' ? kiroSpecs : githubSpeckit;
}

function repoRoot() {
  try {
    return execSync('git rev-parse --show-toplevel', { stdio: ['pipe', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch (_) {
    return process.cwd();
  }
}

function specsDir(root = repoRoot()) {
  return engineFor(root).specsDir(root);
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

/** All spec directories for the active engine, sorted (delegates — spec 008). */
function listSpecs(root = repoRoot()) {
  return engineFor(root).listSpecs(root);
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

function specPath(name, root = repoRoot()) {
  return engineFor(root).specPath(name, root);
}

/**
 * Read the lifecycle status for a feature via the active engine (spec 008).
 * `github-speckit` reads `spec.md`; `kiro-specs` reads `requirements.md`.
 * Returns null when the primary doc is missing, 'Draft' when undeclared.
 */
function readStatus(name, root = repoRoot()) {
  return engineFor(root).readStatus(name, root);
}

/** Persist a lifecycle status via the active engine (spec 008). */
function writeStatus(name, status, root = repoRoot()) {
  return engineFor(root).writeStatus(name, status, root);
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

/**
 * Stage-specific review template (mvp-5): resolve the refinement-loop review
 * template from the lifecycle phase, so the loop's step-1 template selection is
 * driven by the manifest `phase` rather than picked by hand. Planning/MVP/Growth
 * each map to a staged template under `templates/reviews/`; an unknown phase
 * falls back to the generic `templates/06-REVIEW-Template.md`. Repo-relative,
 * framework-owned paths (present in every install). Pure — no fs.
 * @param {string|number} phase - a phase key (`planning`/`mvp`/`growth`) or num (0/1/2).
 */
function reviewTemplateForPhase(phase) {
  const key = typeof phase === 'number' ? PHASE_KEY_BY_NUM[phase] : phase && String(phase).toLowerCase();
  const staged = { planning: 'planning', mvp: 'mvp', growth: 'growth' }[key];
  return staged
    ? `templates/reviews/06-REVIEW-${staged}-Template.md`
    : 'templates/06-REVIEW-Template.md';
}

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
    ssd: 'github-speckit',
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
      ssd: (manifest.tools && manifest.tools.ssd) || 'github-speckit',
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
  PHASE_KEY_BY_NUM,
  reviewTemplateForPhase,
  readManifest,
  manifestFacts,
  inferFacts,
  engineFor,
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
