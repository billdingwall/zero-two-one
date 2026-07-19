'use strict';

/**
 * feedback.test.js — Feedback Command (spec 010, `021-feedback`).
 *
 * Unit: payload/context block (T003), absent-manifest degrade (T004),
 * URL well-formedness + fixed slug (T007). Subprocess (with a recording `gh`
 * fake on PATH): transport selection incl. the auth gate (T005), no-autonomous-
 * post (T006), dispatch route (T008). Install: cross-stack render (T009).
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync, execFileSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..', '..');
const FEEDBACK = path.join(REPO_ROOT, 'scripts', 'feedback.js');
const BIN_021 = path.join(REPO_ROOT, 'bin', '021.js');
const fb = require('../../scripts/feedback.js');

const { initFramework } = require('../../scripts/init');

function tmp(pfx = 'zto-fb-') {
  return fs.mkdtempSync(path.join(os.tmpdir(), pfx));
}

/** A git project dir with an optional manifest and optional origin remote. */
function makeProject({ manifest, origin } = {}) {
  const dir = tmp('zto-fb-proj-');
  execFileSync('git', ['init', '-q'], { cwd: dir });
  execFileSync('git', ['config', 'user.email', 't@t'], { cwd: dir });
  execFileSync('git', ['config', 'user.name', 't'], { cwd: dir });
  if (manifest) fs.writeFileSync(path.join(dir, '.zero-two-one.json'), JSON.stringify(manifest));
  if (origin) execFileSync('git', ['remote', 'add', 'origin', origin], { cwd: dir });
  return dir;
}

const MANIFEST = { version: '9.9.9', phase: 'mvp', tools: { stack: 'claude' } };

/** A recording `gh` fake on PATH; exit codes controlled by env (research R2, A-fake). */
function fakeGhDir({ versionExit = 0, authExit = 0, createExit = 0 } = {}) {
  const dir = tmp('zto-fb-bin-');
  const log = path.join(dir, 'gh.log');
  const script = [
    '#!/bin/sh',
    `echo "$@" >> "${log}"`,
    'case "$1" in',
    `  --version) exit ${versionExit} ;;`,
    `  auth) exit ${authExit} ;;`,
    `  issue) echo "https://github.com/billdingwall/zero-two-one/issues/999"; exit ${createExit} ;;`,
    'esac',
    'exit 0',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'gh'), script, { mode: 0o755 });
  return { dir, log };
}

/**
 * Run feedback.js in `cwd`. PATH is `/usr/bin:/bin` (git present, real gh NOT,
 * since gh lives in /opt/homebrew or /usr/local) so the fake is the only gh;
 * `binDir` prepends the fake when a `gh` transport is wanted.
 */
function runFeedback(args, { cwd, binDir } = {}) {
  const PATH = binDir ? `${binDir}:/usr/bin:/bin` : '/usr/bin:/bin';
  return spawnSync(process.execPath, [FEEDBACK, ...args], {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, PATH },
  });
}

// --- T003 · payload / context block -----------------------------------------
test('T003 context block carries version/stack/phase + origin link', () => {
  const dir = makeProject({ manifest: MANIFEST, origin: 'https://github.com/acme/app.git' });
  const block = fb.contextBlock(dir);
  assert.match(block, /version: `9\.9\.9`/, 'version from manifest');
  assert.match(block, /stack: `claude`/, 'stack from facts');
  assert.match(block, /phase: `mvp`/, 'phase from facts');
  assert.match(block, /repo: https:\/\/github\.com\/acme\/app\.git/, 'origin link present');
});

test('T003b context block omits repo link with a note when no origin', () => {
  const dir = makeProject({ manifest: MANIFEST }); // no origin
  const block = fb.contextBlock(dir);
  assert.match(block, /no `origin` remote resolved/, 'origin absence noted');
});

// --- T004 · absent manifest degrades ----------------------------------------
test('T004 absent manifest degrades with an explicit marker, does not abort', () => {
  const dir = makeProject({}); // git repo, no manifest
  const block = fb.contextBlock(dir);
  assert.match(block, /manifest: not found/, 'explicit marker');
  const r = runFeedback(['Just a note'], { cwd: dir, binDir: fakeGhDir().dir });
  assert.equal(r.status, 0, 'still exits 0 without a manifest');
});

// --- T007 · fixed slug + URL well-formedness --------------------------------
test('T007 issueUrl targets the fixed slug and encodes params', () => {
  const url = fb.issueUrl('Hello world', 'line one\nline two');
  assert.ok(url.startsWith('https://github.com/billdingwall/zero-two-one/issues/new?'), 'fixed slug + issues/new');
  assert.match(url, /title=Hello%20world/, 'title encoded');
  assert.match(url, /body=line%20one%0Aline%20two/, 'body encoded (newline → %0A)');
  assert.equal(fb.REPO, 'billdingwall/zero-two-one', 'repo is the build-time constant');
});

test('T007b issueUrl truncates an over-long body under the ceiling', () => {
  const url = fb.issueUrl('t', 'x'.repeat(20000));
  assert.ok(url.length <= 8300, 'URL kept near the ceiling');
  assert.match(decodeURIComponent(url), /paste it in/, 'truncation note present');
});

// --- T005 · transport selection (incl. the auth gate) -----------------------
test('T005 transport = gh only when on PATH AND authed; else url', () => {
  const dir = makeProject({ manifest: MANIFEST });

  const authed = runFeedback(['t'], { cwd: dir, binDir: fakeGhDir({ authExit: 0 }).dir });
  assert.match(authed.stdout, /^Transport: gh/m, 'present + authed → gh');

  const unauthed = runFeedback(['t'], { cwd: dir, binDir: fakeGhDir({ authExit: 1 }).dir });
  assert.match(unauthed.stdout, /^Transport: url/m, 'present but unauthed → url (auth gate)');

  const absent = runFeedback(['t'], { cwd: dir }); // no gh on PATH
  assert.match(absent.stdout, /^Transport: url/m, 'gh absent → url');
});

// --- T006 · no autonomous post ----------------------------------------------
test('T006 dry mode makes no `gh issue create`; --submit makes exactly one', () => {
  const dir = makeProject({ manifest: MANIFEST });

  const dryGh = fakeGhDir({ authExit: 0 });
  const dry = runFeedback(['t', '--body', 'b'], { cwd: dir, binDir: dryGh.dir });
  assert.equal(dry.status, 0);
  const dryLog = fs.existsSync(dryGh.log) ? fs.readFileSync(dryGh.log, 'utf8') : '';
  assert.ok(!/issue create/.test(dryLog), 'dry mode never calls gh issue create');

  const subGh = fakeGhDir({ authExit: 0 });
  const sub = runFeedback(['t', '--body', 'b', '--submit'], { cwd: dir, binDir: subGh.dir });
  assert.equal(sub.status, 0);
  const subLog = fs.readFileSync(subGh.log, 'utf8');
  const creates = subLog.split('\n').filter((l) => /^issue create/.test(l));
  assert.equal(creates.length, 1, '--submit calls gh issue create exactly once');
  assert.match(subLog, /--repo billdingwall\/zero-two-one/, 'targets the fixed slug');
});

// --- T008 · dispatch route + usage ------------------------------------------
test('T008 `021 feedback` routes to feedback.js and requires a title', () => {
  const dir = makeProject({ manifest: MANIFEST });
  const gh = fakeGhDir({ authExit: 1 }); // force url so no posting
  const ok = spawnSync(process.execPath, [BIN_021, 'feedback', 'Routed title', '--body', 'x'], {
    cwd: dir,
    encoding: 'utf8',
    env: { ...process.env, PATH: `${gh.dir}:/usr/bin:/bin` },
  });
  assert.equal(ok.status, 0, 'dispatch exit 0');
  assert.match(ok.stdout, /Routed title/, 'args passed through to feedback.js');

  const noTitle = spawnSync(process.execPath, [BIN_021, 'feedback'], { cwd: dir, encoding: 'utf8' });
  assert.equal(noTitle.status, 1, 'no title → exit 1');
  assert.match(noTitle.stderr, /Usage: 021 feedback/, 'usage on missing title');
});

// --- T009 · cross-stack render ----------------------------------------------
function install(target, stack) {
  return initFramework(target, { sourceDir: REPO_ROOT, quiet: true, yes: true, stack });
}

test('T009 feedback command renders per stack; kiro installs without error', () => {
  const cl = tmp();
  assert.equal(install(cl, 'claude'), 0);
  assert.ok(fs.existsSync(path.join(cl, '.claude/commands/021-feedback.md')), 'claude command file');

  const ag = tmp();
  assert.equal(install(ag, 'antigravity'), 0);
  assert.ok(
    fs.existsSync(path.join(ag, '.agents/skills/021-feedback/SKILL.md')),
    'antigravity rendered SKILL'
  );

  // kiro reaches feedback via the 021 agent's CLI wrapper — no per-command skill (analyze A1).
  const ki = tmp();
  assert.equal(install(ki, 'kiro'), 0, 'kiro install does not error');
  assert.ok(!fs.existsSync(path.join(ki, '.claude')), 'no claude surface on kiro');
});
