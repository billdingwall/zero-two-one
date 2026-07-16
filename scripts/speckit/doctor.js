'use strict';

/**
 * doctor.js — Workflow-Manager read-only drift reporter (spec 004, TDD §13).
 *
 * Runs six pure reconciliation checks over repo state and prints the drift with
 * proposed corrections. READ-ONLY: opens nothing for writing, edits nothing,
 * commits nothing, and is never in the commit path. Exit is non-zero only when
 * a hard-severity finding exists (advisory-only ⇒ 0). Reuses spec 003's lib.js
 * for phase/spec state — no second manifest/spec parser. Zero dependencies.
 */

const fs = require('fs');
const path = require('path');
const lib = require('./lib');
const { repoRoot, listSpecs, readStatus, specPath, countTasks, manifestFacts, inferFacts } = lib;

// --- status vocabularies ----------------------------------------------------

/** Collapse the glyph/word statuses used across docs to a 3-way normal form. */
function normalizeStatus(raw) {
  const s = String(raw || '').toLowerCase();
  if (s.includes('✅') || /\b(done|delivered|completed)\b/.test(s)) return 'done';
  if (s.includes('🔜') || /\b(in progress|next)\b/.test(s)) return 'in-progress';
  if (s.includes('◻') || /\b(open|planned|todo|draft)\b/.test(s)) return 'open';
  return s.trim() || 'unknown';
}

/** Exact spec-lifecycle comparison (Draft/Approved/In Progress/Done, case-insensitive). */
function specStatusEq(a, b) {
  return String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase();
}

const finding = (check, location, actual, expected, proposedFix, severity) => ({
  check, location, actual, expected, proposedFix, severity,
});

// --- doc parsers (doctor-owned; lib.js does not cover these) ----------------

function readFile(root, ...rel) {
  const p = path.join(root, ...rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

/** Real cells of a markdown table row (drops the leading/trailing empties). */
function tableCells(line) {
  return line.split('|').slice(1, -1).map((c) => c.trim());
}

/** specs/_INDEX.md table → { specDir: status }. */
function parseIndexTable(root) {
  const text = readFile(root, 'specs', '_INDEX.md') || '';
  const map = {};
  for (const line of text.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = tableCells(line); // [Spec, Feature, Release, Status]
    const link = /\[[^\]]+\]\(([^)/]+)\/spec\.md\)/.exec(cells[0] || '');
    if (!link) continue;
    map[link[1]] = cells[cells.length - 1];
  }
  return map;
}

/** A spec's frontmatter `release:` value, or null. */
function specRelease(name, root) {
  const p = path.join(specPath(name, root), 'spec.md');
  const text = fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
  const fm = text && text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const m = fm && fm[1].match(/^release:[ \t]*(.+)$/im);
  return m ? m[1].trim() : null;
}

/** _releases/<rel>.md `- **Status:** …` value, or null. */
function releaseStatus(root, rel) {
  const text = readFile(root, 'requirements', '_releases', `${rel}.md`);
  const m = text && text.match(/^[-*]\s*\*\*Status:\*\*\s*(.+)$/im);
  return m ? m[1].trim() : null;
}

/** 05-ROADMAP.md MVP table rows → { release: statusCell }. */
function parseRoadmapRows(root) {
  const text = readFile(root, 'requirements', '05-ROADMAP.md') || '';
  const rows = {};
  for (const line of text.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = tableCells(line); // [Release, Description, Status, Priority, Dep, Phase]
    const link = /\[(mvp-\d+)\]/.exec(cells[0] || '');
    if (!link) continue;
    rows[link[1]] = cells[2] || '';
  }
  return rows;
}

/** 04-BACKLOG.md table rows → [{ status, release }]. */
function parseBacklogRows(root) {
  const text = readFile(root, 'requirements', '04-BACKLOG.md') || '';
  const rows = [];
  for (const line of text.split('\n')) {
    if (!line.trim().startsWith('|')) continue;
    const cells = tableCells(line); // [Description, Status, Ownership, Release]
    const release = cells[cells.length - 1];
    const status = cells[1];
    if (!/^mvp-\d+$/.test(release)) continue;
    rows.push({ status, release });
  }
  return rows;
}

/** Group spec names by their release. */
function specsByRelease(root) {
  const groups = {};
  for (const name of listSpecs(root)) {
    const rel = specRelease(name, root);
    if (!rel) continue;
    (groups[rel] = groups[rel] || []).push(name);
  }
  return groups;
}

// --- checks (pure: root → DriftFinding[]) -----------------------------------

function checkSpecIndex(root) {
  const out = [];
  const index = parseIndexTable(root);
  const specs = listSpecs(root);
  for (const name of specs) {
    const fm = readStatus(name, root);
    const idx = index[name];
    if (idx === undefined) {
      out.push(finding('spec-index', name, 'absent from _INDEX', fm, `add a ${fm} row for ${name} to specs/_INDEX.md`, 'hard'));
    } else if (!specStatusEq(idx, fm)) {
      out.push(finding('spec-index', name, `_INDEX: ${idx}`, `spec: ${fm}`, `update the _INDEX row to ${fm}`, 'hard'));
    }
  }
  for (const name of Object.keys(index)) {
    if (!specs.includes(name)) {
      out.push(finding('spec-index', name, '_INDEX row present', 'no spec dir', `remove the stale _INDEX row for ${name}`, 'hard'));
    }
  }
  return out;
}

function checkSpecWork(root) {
  const out = [];
  for (const name of listSpecs(root)) {
    if (!specStatusEq(readStatus(name, root), 'Done')) continue; // only Done asserts completion (R7)
    const tasks = readFile(specPath(name, root), 'tasks.md');
    if (!tasks) continue;
    const { remaining } = countTasks(tasks);
    if (remaining > 0) {
      out.push(finding('spec-work', name, `Done with ${remaining} unchecked task(s)`, 'all tasks checked', `finish or re-open ${name}`, 'hard'));
    }
  }
  return out;
}

function checkReleaseSpecs(root) {
  const out = [];
  const groups = specsByRelease(root);
  for (const [rel, names] of Object.entries(groups)) {
    const relStatus = releaseStatus(root, rel);
    if (relStatus == null) continue;
    const relNorm = normalizeStatus(relStatus);
    const allDone = names.every((n) => specStatusEq(readStatus(n, root), 'Done'));
    if (allDone && relNorm !== 'done') {
      out.push(finding('release-specs', rel, `Status: ${relStatus}`, 'all specs Done', `advance ${rel} Status to Delivered`, 'advisory'));
    } else if (relNorm === 'done' && !allDone) {
      out.push(finding('release-specs', rel, `Status: ${relStatus}`, 'a spec is not Done', `re-open ${rel} Status or finish its specs`, 'advisory'));
    }
  }
  return out;
}

function checkRoadmapRelease(root) {
  const out = [];
  const rows = parseRoadmapRows(root);
  for (const [rel, roadmapCell] of Object.entries(rows)) {
    const relStatus = releaseStatus(root, rel);
    if (relStatus == null) continue;
    if (normalizeStatus(roadmapCell) !== normalizeStatus(relStatus)) {
      out.push(finding('roadmap-release', rel, `roadmap: ${roadmapCell}`, `release: ${relStatus}`, `align the 05-ROADMAP row for ${rel} with its release file`, 'advisory'));
    }
  }
  return out;
}

function checkBacklogRelease(root) {
  const out = [];
  const rows = parseBacklogRows(root);
  const groups = specsByRelease(root);
  const byRelease = {};
  for (const r of rows) (byRelease[r.release] = byRelease[r.release] || []).push(r);
  for (const [rel, relRows] of Object.entries(byRelease)) {
    const names = groups[rel] || [];
    if (!names.length) continue;
    const allDone = names.every((n) => specStatusEq(readStatus(n, root), 'Done'));
    const openCount = relRows.filter((r) => normalizeStatus(r.status) === 'open').length;
    if (allDone && openCount > 0) {
      out.push(finding('backlog-release', rel, `${openCount} Open backlog row(s)`, 'specs all Done', `close or promote the ${rel} backlog rows`, 'advisory'));
    }
  }
  return out;
}

function checkManifestPhase(root) {
  const facts = manifestFacts(root);
  if (facts.source !== 'manifest') return [];
  const inferred = inferFacts(root);
  // Only flag when the repo looks *more advanced* than the recorded phase — the
  // real "advanced but forgot to update the manifest" signal. Inference is
  // conservative (it can lag a correct manifest), so inferred < recorded is
  // normal and never flagged.
  if (inferred.phaseNum > facts.phaseNum) {
    return [finding('manifest-phase', 'manifest', `phase: ${facts.phase}`, `repo looks like: ${inferred.phase}`, `check whether the recorded phase is stale (low-confidence)`, 'advisory')];
  }
  return [];
}

const CHECKS = [checkSpecIndex, checkSpecWork, checkReleaseSpecs, checkRoadmapRelease, checkBacklogRelease, checkManifestPhase];

function runDoctor(root = repoRoot()) {
  return CHECKS.flatMap((c) => c(root));
}

// --- render -----------------------------------------------------------------

const GROUP_ORDER = ['spec-index', 'spec-work', 'release-specs', 'roadmap-release', 'backlog-release', 'manifest-phase'];
const GROUP_LABEL = {
  'spec-index': 'spec ↔ index',
  'spec-work': 'spec ↔ tasks',
  'release-specs': 'release ↔ specs',
  'roadmap-release': 'roadmap ↔ release',
  'backlog-release': 'backlog ↔ release',
  'manifest-phase': 'manifest phase',
};

function render(findings) {
  const lines = ['', 'Zero Two One — workflow doctor', ''];
  if (!findings.length) {
    lines.push('  ✓ no drift', '');
    return lines.join('\n');
  }
  for (const group of GROUP_ORDER) {
    const inGroup = findings.filter((f) => f.check === group);
    if (!inGroup.length) continue;
    lines.push(`  ${GROUP_LABEL[group]}`);
    for (const f of inGroup) {
      const mark = f.severity === 'hard' ? '✗' : '•';
      lines.push(`    ${mark} ${f.location}: ${f.actual} (expected ${f.expected})`);
      lines.push(`        → ${f.proposedFix}`);
    }
    lines.push('');
  }
  const hard = findings.filter((f) => f.severity === 'hard').length;
  const advisory = findings.length - hard;
  lines.push(`  ${hard} hard, ${advisory} advisory drift finding(s).`, '');
  return lines.join('\n');
}

module.exports = {
  normalizeStatus, specStatusEq, runDoctor, render,
  checkSpecIndex, checkSpecWork, checkReleaseSpecs, checkRoadmapRelease, checkBacklogRelease, checkManifestPhase,
};

// --- CLI: `npm run 021-doctor` ----------------------------------------------
if (require.main === module) {
  const findings = runDoctor();
  process.stdout.write(render(findings));
  process.exit(findings.some((f) => f.severity === 'hard') ? 1 : 0);
}
