'use strict';

/**
 * report.js — human-readable rendering of an action plan (spec 001).
 *
 * A machine-readable `--json` emission is deferred to the repo's `--json`
 * contract (workflow-status.js) — see contracts/cli-contract.md.
 */

const { ACTION } = require('./classify');

function counts(actions) {
  const c = {};
  for (const a of actions) c[a.action] = (c[a.action] || 0) + 1;
  return c;
}

function summaryLine(actions) {
  const c = counts(actions);
  const order = [ACTION.CREATE, ACTION.REFRESH, ACTION.FORCE, ACTION.MERGE, ACTION.SKIP, ACTION.ADOPT, ACTION.CONFLICT, ACTION.ORPHAN];
  return order
    .filter((k) => c[k])
    .map((k) => `${c[k]} ${k}`)
    .join(', ');
}

function renderPlan(plan, { dryRun } = {}) {
  const lines = [];
  lines.push(dryRun ? '\nDRY RUN — classified action plan (no changes written):' : '\nAction plan:');
  lines.push(`  ${summaryLine(plan.actions) || 'nothing to do'}`);

  if (dryRun) {
    for (const a of plan.actions) {
      if (a.action === ACTION.SKIP) continue; // keep the preview focused
      lines.push(`  ${a.action.padEnd(9)} ${a.path}   (${a.reason})`);
    }
  }

  if (plan.conflicts.length) {
    lines.push('\n  Conflicts (left unchanged — hand-modified vs the recorded hash):');
    for (const a of plan.conflicts) lines.push(`    ⚠ ${a.path}`);
    lines.push('    Resolve with `--upgrade` after review, or keep your version.');
  }
  if (plan.orphans.length) {
    lines.push('\n  Orphans (no longer shipped — kept, remove manually if desired):');
    for (const a of plan.orphans) lines.push(`    • ${a.path}`);
  }
  if (plan.prereqs.length) {
    lines.push('\n  Prerequisites:');
    for (const p of plan.prereqs) lines.push(`    - ${p}`);
  }
  return lines.join('\n');
}

module.exports = { renderPlan, summaryLine };
