#!/usr/bin/env node
'use strict';

/**
 * spec-status.js — read and set the lifecycle status of a feature spec.
 *
 * The status recorded in specs/NNN-feature-name/spec.md is the single
 * source of truth for the refinement gate: implementation commits are
 * blocked (via hooks/pre-commit) until the spec is 'Approved' or
 * 'Ready for Dev'.
 *
 * Usage:
 *   node scripts/speckit/spec-status.js list
 *   node scripts/speckit/spec-status.js get [spec]
 *   node scripts/speckit/spec-status.js set <spec> <status>
 *
 * <spec> may be a number (1, 001), a full directory name
 * (001-feature-name), or a name prefix. When omitted, the spec is derived
 * from the current NNN-feature-name branch.
 */

const lib = require('./lib');

function usage(code) {
  console.log(
    [
      'Usage:',
      '  spec-status.js list',
      '  spec-status.js get [spec]',
      '  spec-status.js set <spec> <status>',
      '',
      `Valid statuses: ${lib.STATUSES.join(' | ')}`,
      `Gate-passing:   ${lib.GATE_PASSING.join(' | ')}`,
    ].join('\n')
  );
  process.exit(code);
}

const [, , command, ...rest] = process.argv;

switch (command) {
  case 'list': {
    const specs = lib.listSpecs();
    if (specs.length === 0) {
      console.log('No specs found in specs/. Run /speckit-specify to create one.');
      break;
    }
    const primary = lib.engineFor().docs.primary;
    for (const s of specs) {
      const status = lib.readStatus(s) || `MISSING ${primary}`;
      const gate = lib.isGatePassing(status) ? '✅' : '⛔';
      console.log(`${gate} ${s.padEnd(40)} ${status}`);
    }
    break;
  }

  case 'get': {
    const spec = lib.resolveSpec(rest[0]);
    if (!spec) {
      console.error('Could not resolve a spec. Pass an id or run from an NNN-feature-name branch.');
      process.exit(1);
    }
    const status = lib.readStatus(spec);
    if (status === null) {
      console.error(`${spec}: ${lib.engineFor().docs.primary} is missing.`);
      process.exit(1);
    }
    console.log(`${spec}: ${status} (${lib.isGatePassing(status) ? 'gate-passing' : 'blocked from implementation'})`);
    break;
  }

  case 'set': {
    if (rest.length < 2) usage(1);
    // Status may contain spaces ("Ready for Dev"), so join the remainder.
    const status = rest.slice(1).join(' ');
    if (!lib.STATUSES.includes(status)) {
      console.error(`Invalid status "${status}". Valid: ${lib.STATUSES.join(' | ')}`);
      process.exit(1);
    }
    const spec = lib.resolveSpec(rest[0]);
    if (!spec) {
      console.error(`Could not resolve spec "${rest[0]}".`);
      process.exit(1);
    }
    const previous = lib.readStatus(spec);
    lib.writeStatus(spec, status);
    console.log(`${spec}: ${previous} → ${status}`);
    if (lib.isGatePassing(status) && !lib.isGatePassing(previous)) {
      console.log('Gate is now open: implementation commits are allowed on this feature branch.');
    }
    break;
  }

  default:
    usage(command ? 1 : 0);
}
