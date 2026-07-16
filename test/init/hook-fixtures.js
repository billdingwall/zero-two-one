'use strict';

/**
 * hook-fixtures.js — harness for the conflict-aware hook suite (spec 005, T001).
 * Builds a git-ish target with a source hooks/pre-commit and optional
 * plain/husky/lefthook setups, plus a sentinel for the guardrail test.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

const SENTINEL = 'SENTINEL-do-not-touch-9f3a';

function write(root, rel, content, mode) {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
  if (mode) fs.chmodSync(abs, mode);
}

/**
 * A target that has the framework's source gate (hooks/pre-commit) and a
 * `.git/hooks/` dir. Options seed a hook situation:
 *   plain:  a sentinel .git/hooks/pre-commit ending in `exit 0`
 *   husky:  a `.husky/` dir (+ optional sentinel .husky/pre-commit)
 *   lefthook: a lefthook.yml with a sentinel
 *   git:    create `.git/hooks/` (default true; false = non-git)
 */
function build({ plain = false, husky = false, huskyHook = false, lefthook = false, git = true } = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'zto-hook-'));
  write(dir, 'hooks/pre-commit', '#!/bin/sh\n# Zero Two One pre-commit hook\nexit 0\n', 0o755);
  if (git) fs.mkdirSync(path.join(dir, '.git', 'hooks'), { recursive: true });
  if (plain) write(dir, '.git/hooks/pre-commit', `#!/bin/sh\necho "${SENTINEL}"\nexit 0\n`, 0o755);
  if (husky) fs.mkdirSync(path.join(dir, '.husky'), { recursive: true });
  if (huskyHook) write(dir, '.husky/pre-commit', `#!/bin/sh\necho "${SENTINEL}"\n`, 0o755);
  if (lefthook) write(dir, 'lefthook.yml', `# ${SENTINEL}\npre-commit:\n  commands:\n    lint:\n      run: eslint\n`);
  return dir;
}

const read = (root, rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = (root, rel) => fs.existsSync(path.join(root, rel));
const isExec = (root, rel) => !!(fs.statSync(path.join(root, rel)).mode & 0o100);
const rm = (d) => fs.rmSync(d, { recursive: true, force: true });

module.exports = { build, read, exists, isExec, rm, SENTINEL };
