'use strict';

/**
 * migrate/interview.js — resolve phase / stack / duplicate decisions
 * (spec 002 FR-003/004/012).
 *
 * Resolution precedence: an explicit flag → an interactive prompt (only when a
 * TTY is present and neither --yes nor --non-interactive) → a non-destructive
 * safe default. No TTY ⇒ zero prompts, safe defaults, never blocks (FR-012).
 * Sync stdin keeps the engine synchronous; the prompt path is skipped whenever
 * `canPrompt` is false, so tests exercise the flag/default paths only.
 */

const fs = require('fs');

const PHASES = ['planning', 'mvp', 'growth'];
const STACKS = ['claude', 'antigravity', 'kiro'];
const DUP_ACTIONS = ['archive', 'update', 'leave'];

function canPrompt(opts) {
  return !opts.yes && !opts.nonInteractive && !!process.stdin.isTTY && !!process.stdout.isTTY;
}

/** Blocking single-line read from stdin fd 0 (real TTY only). */
function askSync(question, fallback) {
  try {
    process.stdout.write(question);
    const buf = Buffer.alloc(4096);
    const bytes = fs.readSync(0, buf, 0, buf.length, null);
    const answer = buf.toString('utf8', 0, bytes).trim();
    return answer || fallback;
  } catch (_) {
    return fallback;
  }
}

/** FR-003 — inferred phase unless --phase; prompt on TTY; default = inferred. */
function resolvePhase(inferred, opts) {
  if (opts.phase) return opts.phase;
  if (canPrompt(opts)) {
    const a = askSync(`Lifecycle phase [${PHASES.join('/')}] (${inferred}): `, inferred);
    return PHASES.includes(a) ? a : inferred;
  }
  return inferred;
}

/** FR-004 — --stack, else unambiguous detected surface, else prompt, else claude. */
function resolveStack(detected, opts) {
  if (opts.stack) return opts.stack;
  if (detected.stack && !detected.ambiguous) return detected.stack;
  if (canPrompt(opts)) {
    const dflt = detected.stack || 'claude';
    const a = askSync(`Tool stack [${STACKS.join('/')}] (${dflt}): `, dflt);
    return STACKS.includes(a) ? a : dflt;
  }
  return 'claude'; // documented safe default
}

/** FR-007/012 — --dup <path>=<action>, else prompt, else safe default leave. */
function resolveDuplicate(destPath, opts) {
  const preset = (opts.dup || {})[destPath];
  if (preset && DUP_ACTIONS.includes(preset)) return preset;
  if (canPrompt(opts)) {
    const a = askSync(`Existing ${destPath} — [archive/update/leave] (leave): `, 'leave');
    return DUP_ACTIONS.includes(a) ? a : 'leave';
  }
  return 'leave';
}

module.exports = { canPrompt, resolvePhase, resolveStack, resolveDuplicate, PHASES, STACKS, DUP_ACTIONS };
