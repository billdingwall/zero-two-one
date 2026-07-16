'use strict';

/**
 * hook.js — conflict-aware pre-commit install (spec 005, TDD §1.3).
 *
 * Replaces spec 001's backup-and-overwrite installHook. Detects the target's
 * hook setup and CHAINS the refinement gate in — never clobbering a user's
 * hook or a hook manager:
 *   none     → install the gate directly (spec 001 behavior)
 *   plain    → gate → .git/hooks/pre-commit.zto; insert a guarded block after
 *              the shebang of the user's hook (gate-first)
 *   husky    → same, into .husky/pre-commit (v9 layout)
 *   lefthook → report the snippet (strategy: manual); never edit the config
 * Idempotent via a guard marker. Zero dependencies.
 */

const fs = require('fs');
const path = require('path');

const DIRECT_MARKER = 'Zero Two One pre-commit hook'; // in the gate script itself
const BLOCK_START = '# >>> zero-two-one gate >>>';
const BLOCK_END = '# <<< zero-two-one gate <<<';

const ZTO = '"$(git rev-parse --show-toplevel)/.git/hooks/pre-commit.zto"';
const GUARD_BLOCK = [BLOCK_START, `[ -x ${ZTO} ] && ${ZTO} "$@" || exit $?`, BLOCK_END].join('\n');

const LEFTHOOK_SNIPPET = [
  'pre-commit:',
  '  commands:',
  '    zto-gate:',
  '      run: sh "$(git rev-parse --show-toplevel)/hooks/pre-commit"',
].join('\n');

function readIf(p) {
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null;
}

/** True if `text` is a framework install — the direct gate or a chained block. */
function hasFrameworkGate(text) {
  return !!text && (text.includes(DIRECT_MARKER) || text.includes(BLOCK_START));
}

function detectLefthook(targetDir) {
  for (const f of ['lefthook.yml', 'lefthook.yaml', 'lefthook.toml', 'lefthook.json', '.lefthook.yml']) {
    if (fs.existsSync(path.join(targetDir, f))) return true;
  }
  const pkg = readIf(path.join(targetDir, 'package.json'));
  if (pkg) {
    try {
      if (JSON.parse(pkg).lefthook) return true;
    } catch (_) { /* ignore */ }
  }
  return false;
}

/** Classify the target's hook situation (read-only, FR-001). */
function detectHookSituation(targetDir) {
  const preCommit = path.join(targetDir, '.git', 'hooks', 'pre-commit');
  const huskyHook = path.join(targetDir, '.husky', 'pre-commit');
  if (hasFrameworkGate(readIf(preCommit)) || hasFrameworkGate(readIf(huskyHook))) return 'already-installed';
  if (fs.existsSync(path.join(targetDir, '.husky'))) return 'husky';
  if (detectLefthook(targetDir)) return 'lefthook';
  if (fs.existsSync(preCommit)) return 'plain';
  return 'none';
}

/**
 * Insert the guarded block after the shebang (gate-first), or create a minimal
 * v9-style file when absent. Idempotent by marker. Never truncates/reorders.
 */
function insertGuarded(file) {
  if (!fs.existsSync(file)) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `#!/bin/sh\n${GUARD_BLOCK}\n`);
    fs.chmodSync(file, 0o755);
    return;
  }
  const text = fs.readFileSync(file, 'utf8');
  if (text.includes(BLOCK_START)) return; // already chained
  const lines = text.split('\n');
  const at = lines[0] && lines[0].startsWith('#!') ? 1 : 0;
  lines.splice(at, 0, GUARD_BLOCK);
  fs.writeFileSync(file, lines.join('\n'));
  fs.chmodSync(file, 0o755);
}

function installGateZto(targetDir) {
  const src = path.join(targetDir, 'hooks', 'pre-commit');
  const dest = path.join(targetDir, '.git', 'hooks', 'pre-commit.zto');
  fs.copyFileSync(src, dest);
  fs.chmodSync(dest, 0o755);
}

/** The strategy an already-installed target reflects (no writes, self-heals .zto). */
function existingStrategy(targetDir) {
  const pre = readIf(path.join(targetDir, '.git', 'hooks', 'pre-commit'));
  const husky = readIf(path.join(targetDir, '.husky', 'pre-commit'));
  let strategy = 'direct';
  if (pre && pre.includes(BLOCK_START)) strategy = 'chain-plain';
  else if (husky && husky.includes(BLOCK_START)) strategy = 'husky';
  if ((strategy === 'chain-plain' || strategy === 'husky') &&
      !fs.existsSync(path.join(targetDir, '.git', 'hooks', 'pre-commit.zto'))) {
    installGateZto(targetDir); // self-heal a missing gate artifact
  }
  return strategy;
}

/**
 * Install / chain the gate. Returns { strategy, message? }.
 * @returns strategy ∈ direct | chain-plain | husky | manual | inactive-no-git | no-source
 */
function installHook(targetDir) {
  const src = path.join(targetDir, 'hooks', 'pre-commit');
  if (!fs.existsSync(src)) return { strategy: 'no-source' };
  const gitHooks = path.join(targetDir, '.git', 'hooks');
  if (!fs.existsSync(gitHooks)) return { strategy: 'inactive-no-git' };

  const dest = path.join(gitHooks, 'pre-commit');
  switch (detectHookSituation(targetDir)) {
    case 'already-installed':
      return { strategy: existingStrategy(targetDir) };
    case 'none':
      fs.copyFileSync(src, dest);
      fs.chmodSync(dest, 0o755);
      return { strategy: 'direct' };
    case 'plain':
      installGateZto(targetDir);
      insertGuarded(dest);
      return { strategy: 'chain-plain' };
    case 'husky':
      installGateZto(targetDir);
      insertGuarded(path.join(targetDir, '.husky', 'pre-commit'));
      return { strategy: 'husky' };
    case 'lefthook':
      return { strategy: 'manual', message: LEFTHOOK_SNIPPET };
    default:
      return { strategy: 'none' };
  }
}

module.exports = {
  detectHookSituation, insertGuarded, installHook,
  GUARD_BLOCK, LEFTHOOK_SNIPPET, DIRECT_MARKER, BLOCK_START, BLOCK_END,
};
