#!/usr/bin/env node
'use strict';

/**
 * verify-spec-compliance.js — validate that a feature's Spec Kit artifact
 * set is complete, unambiguous, and cleared for implementation.
 *
 * This is the executable form of the refinement gate: hooks/pre-commit
 * runs it with --gate before allowing implementation commits on an
 * NNN-feature-name branch, and agents run it after generating code to
 * confirm the work still lines up with the downloaded spec definitions.
 *
 * Checks:
 *   G1  spec directory resolves (from arg or branch name)
 *   G2  spec.md exists and declares a recognized status
 *   G3  status passes the implementation gate (Approved / Ready for Dev /
 *       In Progress / Done)
 *   C1  plan.md and tasks.md exist (required once gate-passing)
 *   C2  data-model.md / contracts/ present (warn only — not every feature
 *       has a data surface)
 *   C3  no unresolved [NEEDS CLARIFICATION] markers in any artifact
 *   C4  a spec marked Done has no unchecked tasks
 *   C5  the .ai/context bundle is not stale relative to the spec sources
 *
 * Usage:
 *   node scripts/speckit/verify-spec-compliance.js [spec] [--gate] [--json]
 *
 * --gate  run only G1–G3 (fast path for the pre-commit hook)
 * --json  emit the findings as JSON (for agent consumption)
 *
 * Exit code is 1 if any FAIL-level finding exists, 0 otherwise.
 */

const fs = require('fs');
const path = require('path');
const lib = require('./lib');

function parseArgs(argv) {
  const args = { spec: null, gate: false, json: false };
  for (const a of argv) {
    if (a === '--gate') args.gate = true;
    else if (a === '--json') args.json = true;
    else if (!a.startsWith('--')) args.spec = a;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const findings = [];
const add = (id, level, message) => findings.push({ id, level, message });

// --- G1: resolve the spec --------------------------------------------------
const spec = lib.resolveSpec(args.spec);
if (!spec) {
  add(
    'G1',
    'FAIL',
    args.spec
      ? `No spec directory matches "${args.spec}".`
      : `No spec matches the current branch "${lib.currentBranch()}". Feature branches must be named NNN-feature-name with a matching specs/ directory (run /speckit-specify).`
  );
} else {
  add('G1', 'PASS', `Resolved spec: ${spec}`);
}

let status = null;
if (spec) {
  const specDir = lib.specPath(spec);

  // --- G2: spec.md + status -------------------------------------------------
  status = lib.readStatus(spec);
  if (status === null) {
    add('G2', 'FAIL', `${spec}/spec.md is missing.`);
  } else if (!lib.STATUSES.includes(status)) {
    add('G2', 'WARN', `Status "${status}" is not a recognized lifecycle status (${lib.STATUSES.join(' | ')}). Treating as blocking.`);
  } else {
    add('G2', 'PASS', `spec.md present with status "${status}".`);
  }

  // --- G3: implementation gate ----------------------------------------------
  if (status !== null) {
    if (lib.isGatePassing(status)) {
      add('G3', 'PASS', `Status "${status}" passes the implementation gate.`);
    } else {
      add(
        'G3',
        'FAIL',
        `Status "${status}" does not pass the implementation gate. Required: ${lib.GATE_PASSING.join(' | ')}. ` +
          `Once the spec is signed off, run: npm run 021-spec:status -- set ${spec} Approved`
      );
    }
  }

  if (!args.gate && status !== null) {
    // --- C1: required artifacts ----------------------------------------------
    for (const f of ['plan.md', 'tasks.md']) {
      const exists = fs.existsSync(path.join(specDir, f));
      if (exists) {
        add('C1', 'PASS', `${f} present.`);
      } else {
        add('C1', lib.isGatePassing(status) ? 'FAIL' : 'WARN', `${f} missing${lib.isGatePassing(status) ? ' — required for a gate-passing spec' : ''}. Run /speckit-plan and /speckit-tasks.`);
      }
    }

    // --- C2: optional artifacts ------------------------------------------------
    for (const f of ['data-model.md', 'contracts']) {
      if (!fs.existsSync(path.join(specDir, f))) {
        add('C2', 'WARN', `${f} not present — fine if this feature has no data/contract surface.`);
      }
    }

    // --- C3: unresolved clarifications ------------------------------------------
    let clarifications = 0;
    const scan = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) scan(p);
        else if (entry.name.endsWith('.md')) {
          clarifications += (fs.readFileSync(p, 'utf8').match(/\[NEEDS CLARIFICATION[^\]]*\]/g) || []).length;
        }
      }
    };
    scan(specDir);
    if (clarifications === 0) {
      add('C3', 'PASS', 'No unresolved [NEEDS CLARIFICATION] markers.');
    } else {
      add(
        'C3',
        lib.isGatePassing(status) ? 'FAIL' : 'WARN',
        `${clarifications} unresolved [NEEDS CLARIFICATION] marker(s). Run /speckit-clarify before approval.`
      );
    }

    // --- C4: Done means done -----------------------------------------------------
    const tasksFile = path.join(specDir, 'tasks.md');
    if (fs.existsSync(tasksFile)) {
      const t = lib.countTasks(fs.readFileSync(tasksFile, 'utf8'));
      if (status === 'Done' && t.remaining > 0) {
        add('C4', 'FAIL', `Spec is marked Done but ${t.remaining}/${t.total} task(s) remain unchecked in tasks.md.`);
      } else {
        add('C4', 'PASS', `Task progress: ${t.completed}/${t.total} complete.`);
      }
    }

    // --- C5: context bundle freshness ----------------------------------------------
    const bundle = path.join(lib.contextDir(), `${spec}.md`);
    if (fs.existsSync(bundle)) {
      const bundleTime = fs.statSync(bundle).mtimeMs;
      let newest = 0;
      const walk = (dir) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const p = path.join(dir, entry.name);
          if (entry.isDirectory()) walk(p);
          else newest = Math.max(newest, fs.statSync(p).mtimeMs);
        }
      };
      walk(specDir);
      if (newest > bundleTime) {
        add('C5', 'WARN', 'Spec artifacts changed after the .ai/context bundle was generated. Re-run: npm run 021-spec:context');
      } else {
        add('C5', 'PASS', 'Context bundle is up to date.');
      }
    } else {
      add('C5', 'WARN', `No context bundle at .ai/context/${spec}.md. Generate one with: npm run 021-spec:context`);
    }
  }
}

// --- Report ------------------------------------------------------------------
const failed = findings.some((f) => f.level === 'FAIL');

if (args.json) {
  console.log(JSON.stringify({ spec, status, gatePassing: spec ? lib.isGatePassing(status) : false, compliant: !failed, findings }, null, 2));
} else {
  const icons = { PASS: '✅', WARN: '⚠️ ', FAIL: '❌' };
  console.log(`\nSpec compliance report${spec ? `: ${spec}` : ''}${args.gate ? ' (gate checks only)' : ''}`);
  console.log('─'.repeat(60));
  for (const f of findings) {
    console.log(`${icons[f.level]} [${f.id}] ${f.message}`);
  }
  console.log('─'.repeat(60));
  console.log(failed ? 'RESULT: NON-COMPLIANT — see FAIL items above.\n' : 'RESULT: COMPLIANT.\n');
}

process.exit(failed ? 1 : 0);
