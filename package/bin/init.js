#!/usr/bin/env node
'use strict';

/**
 * zero-two-one-init — CLI wrapper over the Safe Install & Merge Engine.
 *
 * Thin arg-parsing layer only; all behavior lives in scripts/init/ (spec 001).
 * Non-destructive: user-owned docs are create-if-missing, framework files are
 * refreshed only when unmodified, conflicts report and exit 0.
 *
 * Usage: npx zero-two-one-init [target-dir] [options]
 */

const path = require('path');
const { initFramework } = require('../scripts/init');

const PACKAGE_ROOT = path.join(__dirname, '..');

const USAGE = [
  'Usage: npx zero-two-one-init [target-dir] [options]',
  '',
  'Scaffold the Zero Two One framework into target-dir (default: cwd),',
  'non-destructively. User-owned docs are create-if-missing; framework files',
  'are refreshed only when unmodified; conflicts are reported (exit 0).',
  '',
  'Options:',
  '  --dry-run           Print the classified action plan; write nothing',
  '  --upgrade           Refresh unmodified framework files; list conflicts/orphans',
  '  --force <path>      Overwrite a user-owned file (repeatable; user-owned only)',
  '  --phase <p>        planning | mvp | growth   (scaffold default: planning)',
  '  --design <system>  none | material-3 | <system>   (default: none)',
  '  --stack <s>        claude | antigravity | kiro   (default: claude)',
  '  --dup <path=act>   Pre-resolve a migrate duplicate: archive|update|leave (repeatable)',
  '  --yes              Accept inferred defaults; no prompts (migrate)',
  '  --help             Show this help and exit',
  '  --version          Print the framework version and exit',
].join('\n');

const PHASES = ['planning', 'mvp', 'growth'];
const STACKS = ['claude', 'antigravity', 'kiro'];
const DUP_ACTIONS = ['archive', 'update', 'leave'];

function parseArgs(argv) {
  const opts = { force: [], dup: {} };
  const positionals = [];
  const takesValue = new Set(['--force', '--phase', '--design', '--stack', '--dup']);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '-h') return { help: true };
    if (arg === '--version' || arg === '-v') return { version: true };
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--upgrade') opts.upgrade = true;
    else if (arg === '--yes' || arg === '-y') opts.yes = true;
    else if (takesValue.has(arg)) {
      const val = argv[++i];
      if (val === undefined) return { error: `Option ${arg} requires a value.` };
      if (arg === '--force') opts.force.push(val);
      else if (arg === '--dup') {
        const eq = val.indexOf('=');
        const p = eq === -1 ? '' : val.slice(0, eq);
        const act = eq === -1 ? '' : val.slice(eq + 1);
        if (!p || !DUP_ACTIONS.includes(act)) {
          return { error: `--dup expects <path>=<${DUP_ACTIONS.join('|')}>, got: ${val}` };
        }
        opts.dup[p] = act;
      } else opts[arg.slice(2)] = val;
    } else if (arg.startsWith('-')) {
      return { error: `Unknown option: ${arg}` };
    } else {
      positionals.push(arg);
    }
  }
  if (opts.phase && !PHASES.includes(opts.phase)) return { error: `--phase must be one of ${PHASES.join('|')}` };
  if (opts.stack && !STACKS.includes(opts.stack)) return { error: `--stack must be one of ${STACKS.join('|')}` };
  if (positionals.length > 1) {
    return { error: `Expected at most one target directory, got: ${positionals.join(' ')}` };
  }
  opts.target = positionals[0];
  return { opts };
}

function main() {
  const parsed = parseArgs(process.argv.slice(2));

  if (parsed.help) {
    console.log(USAGE);
    return 0;
  }
  if (parsed.version) {
    console.log(require(path.join(PACKAGE_ROOT, 'package.json')).version);
    return 0;
  }
  if (parsed.error) {
    console.error(`${parsed.error}\n\n${USAGE}`);
    return 1;
  }

  const targetDir = path.resolve(parsed.opts.target || process.cwd());
  console.log(`Initializing Zero Two One in ${targetDir}...`);
  return initFramework(targetDir, parsed.opts);
}

process.exit(main());
