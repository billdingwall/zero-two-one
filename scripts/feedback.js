#!/usr/bin/env node
'use strict';

/**
 * feedback.js — the mechanical layer behind `021 feedback` (spec 010, TDD §10).
 *
 * Files feedback from an installed repo into the framework's GitHub issues.
 * The LLM-driven `/021-feedback` surface gathers the text and confirms; this
 * script does the mechanical work: read the manifest context block, resolve the
 * repo link, detect `gh`, and assemble either a `gh issue create` invocation or
 * a pre-filled new-issue URL. Auth stays entirely on GitHub's side — the
 * framework never handles a token and issues no HTTP of its own.
 *
 * Dry by default (assemble + print, never post); `--submit` posts via `gh`
 * only, and only when the walkthrough reaches it after user confirmation — so
 * "no autonomous posting" (FR-006) is a structural property, not a promise.
 *
 * Usage: node scripts/feedback.js "<title>" [--body <text>] [--submit]
 *
 * Node built-ins only (no dependencies).
 */

const { spawnSync } = require('child_process');
const lib = require('./speckit/lib.js');

/** Build-time constant — the destination is never a runtime parameter (FR-007). */
const REPO = 'billdingwall/zero-two-one';
/** Safe URL length ceiling; longer bodies are truncated in the URL path (research R3). */
const URL_CEILING = 8000;

/** Parse argv into { title, body, submit }. */
function parseArgs(argv) {
  let title = null;
  let body = '';
  let submit = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--submit') submit = true;
    else if (a === '--body') body = argv[++i] || '';
    else if (!a.startsWith('--') && title === null) title = a;
  }
  return { title, body, submit };
}

/** `gh` on PATH AND authenticated — the only case we hand the user a gh path (FR-004). */
function ghReady() {
  const quiet = { stdio: ['ignore', 'ignore', 'ignore'] };
  const onPath = spawnSync('gh', ['--version'], quiet).status === 0;
  if (!onPath) return false;
  return spawnSync('gh', ['auth', 'status'], quiet).status === 0;
}

/** The `origin` remote URL, or null when there is no origin (FR-002). */
function gitOrigin(root) {
  const r = spawnSync('git', ['remote', 'get-url', 'origin'], { cwd: root, encoding: 'utf8' });
  if (r.status !== 0) return null;
  const url = (r.stdout || '').trim();
  return url || null;
}

/**
 * The auto-attached context block. Reads `version` directly from the manifest
 * (manifestFacts does not expose it — research R1) and `stack`/`phase` from the
 * resolver. Degrades with an explicit marker when there is no manifest (FR-003).
 */
function contextBlock(root) {
  const manifest = lib.readManifest(root);
  const lines = ['---', '**021 context** (auto-attached):', ''];
  if (!manifest) {
    lines.push('- manifest: not found (`.zero-two-one.json` absent)');
  } else {
    const facts = lib.manifestFacts(root);
    lines.push(`- version: \`${manifest.version || 'unknown'}\``);
    lines.push(`- stack: \`${facts.stack || 'unknown'}\``);
    lines.push(`- phase: \`${facts.phase || 'unknown'}\``);
  }
  const origin = gitOrigin(root);
  lines.push(origin ? `- repo: ${origin}` : '- repo: (no `origin` remote resolved)');
  return lines.join('\n');
}

/** Assemble the full issue body: user detail, then the context block. */
function assembleBody(userBody, root) {
  const parts = [];
  if (userBody) parts.push(userBody);
  parts.push(contextBlock(root));
  return parts.join('\n\n');
}

/** Pre-filled new-issue URL for the fallback transport (FR-005, C4). */
function issueUrl(title, body) {
  const base = `https://github.com/${REPO}/issues/new`;
  let b = body;
  let url = `${base}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(b)}`;
  if (url.length > URL_CEILING) {
    b = body.slice(0, 1500) + '\n\n… (full context printed above — paste it in)';
    url = `${base}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(b)}`;
  }
  return url;
}

function usage(stream) {
  stream.write('Usage: 021 feedback "<title>" [--body <text>] [--submit]\n');
}

function main(argv) {
  const { title, body, submit } = parseArgs(argv);
  if (!title) {
    usage(process.stderr);
    return 1;
  }

  const root = lib.repoRoot();
  const fullBody = assembleBody(body, root);
  const transport = ghReady() ? 'gh' : 'url';

  process.stdout.write(`Transport: ${transport}\n\n`);
  process.stdout.write(`Title: ${title}\n\n${fullBody}\n\n`);

  if (transport === 'gh') {
    if (submit) {
      const r = spawnSync(
        'gh',
        ['issue', 'create', '--repo', REPO, '--title', title, '--body', fullBody],
        { stdio: 'inherit' }
      );
      return r.status == null ? 1 : r.status;
    }
    process.stdout.write(
      'Would run (confirm, then re-run with --submit):\n' +
        `  gh issue create --repo ${REPO} --title ${JSON.stringify(title)} --body <body above>\n`
    );
    return 0;
  }

  // url transport
  process.stdout.write('Open this pre-filled issue in your browser:\n  ' + issueUrl(title, fullBody) + '\n');
  if (submit) {
    process.stdout.write('\n(Note: on the URL transport, submitting is your browser action — --submit has no effect.)\n');
  }
  return 0;
}

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}

module.exports = {
  REPO,
  parseArgs,
  ghReady,
  gitOrigin,
  contextBlock,
  assembleBody,
  issueUrl,
  main,
};
