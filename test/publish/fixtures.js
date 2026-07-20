'use strict';

/**
 * fixtures.js — test harness for the pre-publish gate (spec 014, T002).
 *
 * Builds a minimal fixture pair under an OS temp path: a `packageDir` (a
 * `package.json` + a seeded shippable file set) and a repo `root` (LICENSE + a
 * clean Markdown file). `npm pack --json --dry-run` runs in the fixture
 * packageDir, so injected files are seen exactly as they would ship. Mutators
 * apply each violation the gate must catch. Node built-ins only.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');

function mkdtemp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'zto-gate-'));
}

function write(root, rel, body) {
  const p = path.join(root, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, body);
  return p;
}

const README_BODY =
  '# zero-two-one\n\nInstall-focused shipped README with enough content to be non-trivial. ' +
  'Run `npx zero-two-one-init` to scaffold the framework into your repository, then use ' +
  '`npx 021 status` to check the lifecycle phase.\n';

/**
 * A clean fixture that mirrors a hygienic package: a `files`-whitelisted
 * package.json, LICENSE, a non-trivial README, an empty `.ai/context/.gitkeep`
 * scaffold, and a couple of shippable content files. Returns { root, packageDir }.
 */
function makeClean() {
  const root = mkdtemp();
  const packageDir = path.join(root, 'package');

  // Repo-root files the gate checks directly.
  write(root, 'LICENSE', 'MIT License\n\nCopyright (c)\n');
  write(root, 'README.md', '# repo (contributor)\n\nContributor-facing.\n');
  // NOTE: the link check is NOT scanned from the fixture — `check-links.js`
  // hardcodes its own repo root (`__dirname/..`), so tests exercise check (d)
  // by injecting a fake `checkLinks` into the gate, not via fixture Markdown.

  // The shipped package/ tree — only files that belong in the tarball.
  write(packageDir, 'package.json', JSON.stringify({
    name: 'zero-two-one',
    version: '1.1.0',
    bin: { 'zero-two-one-init': 'bin/init.js' },
    files: ['bin/', '.ai/', 'hooks/', 'scripts/', 'README.md', 'LICENSE'],
  }, null, 2) + '\n');
  write(packageDir, 'README.md', README_BODY);
  write(packageDir, 'LICENSE', 'MIT License\n\nCopyright (c)\n');
  write(packageDir, '.ai/context/.gitkeep', '');
  write(packageDir, 'bin/init.js', '#!/usr/bin/env node\n');
  write(packageDir, 'hooks/pre-commit', '#!/bin/sh\nexit 0\n');
  write(packageDir, 'scripts/run-qa.sh', '#!/bin/sh\n');

  return { root, packageDir };
}

// --- Mutators (each injects one violation the gate must catch) --------------

/** (a) A manifest `main` pointing at a file not in the tarball. */
function injectDanglingMain(fx, mainValue = './nope.js') {
  const pj = path.join(fx.packageDir, 'package.json');
  const m = JSON.parse(fs.readFileSync(pj, 'utf8'));
  m.main = mainValue;
  m.files.push('README.md'); // keep README shipping
  fs.writeFileSync(pj, JSON.stringify(m, null, 2) + '\n');
}

/** (b) Remove the root LICENSE. */
function removeLicense(fx) {
  fs.rmSync(path.join(fx.root, 'LICENSE'), { force: true });
}

/** (c) A generated `.ai/context` bundle in the tarball (not .gitkeep). */
function injectAiBundle(fx, name = '013-e2e-test.md') {
  write(fx.packageDir, path.join('.ai/context', name), '# generated bundle\n');
}

/**
 * (e) An internal feature spec that would ship. Simulates the realistic
 * regression: a misconfigured `files` whitelist that lets `specs/` through
 * (otherwise npm pack excludes it and there is nothing to catch).
 */
function injectSpecLeak(fx, rel = 'specs/099-leak/spec.md') {
  write(fx.packageDir, rel, '# leaked internal spec\n');
  const pj = path.join(fx.packageDir, 'package.json');
  const m = JSON.parse(fs.readFileSync(pj, 'utf8'));
  const top = rel.split('/')[0] + '/';
  if (!m.files.includes(top)) m.files.push(top);
  fs.writeFileSync(pj, JSON.stringify(m, null, 2) + '\n');
}

/** (f) A trivial (empty) shipped README. */
function makeReadmeTrivial(fx) {
  fs.writeFileSync(path.join(fx.packageDir, 'README.md'), '');
}

function cleanup(fx) {
  fs.rmSync(fx.root, { recursive: true, force: true });
}

module.exports = {
  makeClean,
  injectDanglingMain,
  removeLicense,
  injectAiBundle,
  injectSpecLeak,
  makeReadmeTrivial,
  cleanup,
  README_BODY,
};
