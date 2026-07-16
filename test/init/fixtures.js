'use strict';

/**
 * fixtures.js — test harness for the install engine (spec 001, task T002).
 *
 * Builds a controlled mini "package" source and throwaway target dirs under an
 * OS temp path, and snapshots whole trees so tests can assert dry-run purity
 * and idempotency. Node built-ins only.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

function mkdtemp(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `zto-${prefix}-`));
}

function write(root, rel, content) {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
  return abs;
}

/**
 * Build a minimal framework "source" package. Enough surface to exercise every
 * file class: framework dirs, template→doc sources, merged, a hook.
 */
function makeSourceFixture({ source = false } = {}) {
  const dir = mkdtemp('src');
  write(dir, 'package.json', JSON.stringify({ name: 'zero-two-one', version: '1.0.0' }, null, 2) + '\n');
  // framework-owned
  write(dir, 'scripts/run-qa.sh', '#!/bin/sh\necho qa v1\n');
  write(dir, 'scripts/workflow-status.js', '// status v1\n');
  write(dir, 'skills/verify.md', '# verify v1\n');
  write(dir, 'workflow/workflows.md', '# workflows v1\n');
  write(dir, '.github/ISSUE_TEMPLATE/bug.yml', 'name: bug\n');
  write(dir, 'hooks/pre-commit', '#!/bin/sh\nexit 0\n');
  write(dir, '.claude/commands/021-init.md', 'init v1\n');
  // templates (framework-owned AND instantiation source)
  write(dir, 'templates/CLAUDE-Template.md', '# CLAUDE (template)\n');
  write(dir, 'templates/01-PRD-Template.md', '# PRD (template)\n');
  // excluded from surface
  write(dir, 'bin/init.js', '// cli\n');
  write(dir, 'specs/_INDEX.md', '# framework specs\n');
  if (source) {
    // mode:source signature
    write(dir, 'scripts/sync-to-package.js', '// sync\n');
    write(dir, 'package/README.md', '# pkg snapshot\n');
  }
  return dir;
}

function makeTargetDir() {
  return mkdtemp('tgt');
}

/** sha256 of LF-normalized file content. */
function hashOf(abs) {
  const text = fs.readFileSync(abs, 'utf8').replace(/\r\n/g, '\n');
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

/** Map of relpath → hash for every file under dir, minus excludes. */
function snapshotTree(dir, excludes = []) {
  const out = {};
  const skip = new Set(['.git', ...excludes]);
  (function walk(rel) {
    const abs = path.join(dir, rel || '.');
    for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
      if (skip.has(entry.name)) continue;
      const childRel = rel ? path.join(rel, entry.name) : entry.name;
      if (excludes.includes(childRel.split(path.sep).join('/'))) continue;
      if (entry.isDirectory()) walk(childRel);
      else out[childRel.split(path.sep).join('/')] = hashOf(path.join(dir, childRel));
    }
  })('');
  return out;
}

function rm(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

function read(root, rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

function exists(root, rel) {
  return fs.existsSync(path.join(root, rel));
}

module.exports = { makeSourceFixture, makeTargetDir, snapshotTree, write, read, exists, rm, hashOf };
