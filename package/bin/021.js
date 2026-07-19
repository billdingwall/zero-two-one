#!/usr/bin/env node
'use strict';

/**
 * 021 — the assistant-agnostic lifecycle CLI (spec 009).
 *
 * A routing shell over the existing scripts — no logic lives here. All three
 * stacks (Claude, Antigravity, Kiro) reference `npx 021 …` in their rendered
 * instructions, so every stack issues identical commands. npm scripts stay as
 * aliases for the dogfood repo/CI.
 *
 * Script paths resolve package-relative (the CLI ships with its scripts); the
 * wrapped scripts operate on the invoking project via `repoRoot()` because we
 * exec with the caller's cwd. Node built-ins only (no dependencies).
 *
 * Usage: npx 021 <status|qa|doctor|phase|spec <status|context|verify>> [args…]
 */

const path = require('path');
const { spawnSync } = require('child_process');

const PACKAGE_ROOT = path.join(__dirname, '..');
const script = (...parts) => path.join(PACKAGE_ROOT, 'scripts', ...parts);

const USAGE = [
  'Usage: 021 <command> [args…]',
  '',
  'Commands:',
  '  status                 project lifecycle phase & health (workflow-status)',
  '  qa                     run the QA suite (run-qa)',
  '  doctor                 workflow drift report (021-doctor)',
  '  phase                  print the lifecycle phase number (for scripts/hooks)',
  '  feedback "<title>"     file a feedback issue to the framework repo (gh / pre-filled URL)',
  '  spec status [args]     list / show spec status',
  '  spec context <spec>    build a spec context bundle',
  '  spec verify [spec]     run the spec-compliance gate',
  '',
  'npm-script aliases (dogfood/CI): npm run 021-status | 021-qa | 021-spec:verify …',
].join('\n');

/**
 * Resolve a subcommand to a runnable: { cmd, args } where cmd is a node script
 * (run via process.execPath) or a shell script (run via sh), plus any leading
 * args the script needs. Returns null for an unknown/absent command.
 */
function resolve(argv) {
  const [sub, ...rest] = argv;
  switch (sub) {
    case 'status':
      return { runner: 'node', file: script('workflow-status.js'), lead: [], rest };
    case 'qa':
      return { runner: 'sh', file: script('run-qa.sh'), lead: [], rest };
    case 'doctor':
      return { runner: 'node', file: script('speckit', 'doctor.js'), lead: [], rest };
    case 'phase':
      return { runner: 'node', file: script('speckit', 'lib.js'), lead: ['phase'], rest };
    case 'feedback':
      return { runner: 'node', file: script('feedback.js'), lead: [], rest };
    case 'spec': {
      const leaf = { status: 'spec-status.js', context: 'fetch-speckit-context.js', verify: 'verify-spec-compliance.js' }[rest[0]];
      if (!leaf) return null;
      return { runner: 'node', file: script('speckit', leaf), lead: [], rest: rest.slice(1) };
    }
    default:
      return null;
  }
}

function main(argv) {
  const first = argv[0];
  if (first === '-h' || first === '--help') {
    process.stdout.write(USAGE + '\n');
    return 0;
  }
  const r = resolve(argv);
  if (!r) {
    process.stderr.write((first ? `Unknown command: ${argv.join(' ')}\n\n` : '') + USAGE + '\n');
    return 1;
  }
  const cmd = r.runner === 'sh' ? 'sh' : process.execPath;
  const result = spawnSync(cmd, [r.file, ...r.lead, ...r.rest], { stdio: 'inherit', cwd: process.cwd() });
  if (result.error) {
    process.stderr.write(`021: failed to run ${path.basename(r.file)} — ${result.error.message}\n`);
    return 1;
  }
  return result.status === null ? 1 : result.status;
}

process.exit(main(process.argv.slice(2)));
