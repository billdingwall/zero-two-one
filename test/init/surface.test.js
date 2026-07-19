'use strict';

/**
 * surface.test.js — Antigravity adapter (spec 007).
 * renderSurface unit (T003); real installs from the repo root: antigravity
 * skills surface + frontmatter (T006), GEMINI.md honoring (T007), stack-aware
 * ownership (T008), --upgrade (T010), migrate wire-through (T011), MCP note
 * (T012). The claude golden bar (T005) lives in renderer.test.js.
 */

const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');

const { initFramework } = require('../../scripts/init');
const { loadManifest } = require('../../scripts/init/manifest');
const { renderSurface } = require('../../scripts/init/surface');
const { classify, CLASS } = require('../../scripts/init/classes');

const REPO_ROOT = path.join(__dirname, '..', '..');

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'zto-r7-'));
}
function install(target, stack, opts = {}) {
  return initFramework(target, { sourceDir: REPO_ROOT, quiet: true, yes: true, stack, ...opts });
}
/** Every file path (POSIX) under dir, relative. */
function tree(dir) {
  const out = [];
  (function walk(rel) {
    for (const e of fs.readdirSync(path.join(dir, rel || '.'), { withFileTypes: true })) {
      if (e.name === '.git') continue;
      const childRel = (rel ? rel + '/' : '') + e.name;
      if (e.isDirectory()) walk(childRel);
      else out.push(childRel);
    }
  })('');
  return out;
}

const EXPECTED_SKILLS = [
  '021-check-framework-compliance',
  '021-fetch-speckit-context',
  '021-generate-backlog',
  '021-generate-edd',
  '021-generate-frontend-component',
  '021-generate-prd',
  '021-generate-tdd',
  '021-verify-spec-compliance',
];
const EXPECTED_COMMANDS = ['021-init', '021-status', '021-feedback', '021-design', '021-prototype'];

// --- T003 · renderSurface unit ----------------------------------------------
test('T003 renderSurface: antigravity yields skills + commands; claude yields none', () => {
  const surface = renderSurface(REPO_ROOT, 'antigravity');
  const dests = surface.map((s) => s.dest);

  for (const name of [...EXPECTED_SKILLS, ...EXPECTED_COMMANDS]) {
    assert.ok(dests.includes(`.agents/skills/${name}/SKILL.md`), `surface includes ${name}`);
  }
  assert.ok(
    !dests.some((d) => d.includes('021-_INDEX')),
    '_INDEX.md is excluded (not a skill)'
  );

  // kind:'skill' — frontmatter is present because it was added to the source at rest.
  const prd = surface.find((s) => s.dest === '.agents/skills/021-generate-prd/SKILL.md');
  assert.match(prd.content, /^---\nname: 021-generate-prd\ndescription: /, 'skill frontmatter passthrough');

  // kind:'command' — frontmatter synthesized (the source .claude/commands file has none).
  const init = surface.find((s) => s.dest === '.agents/skills/021-init/SKILL.md');
  assert.match(init.content, /^---\nname: 021-init\ndescription: \S/, 'command frontmatter synthesized');

  // deterministic + sorted
  assert.deepEqual(dests, [...dests].sort(), 'sorted by dest');
  assert.deepEqual(renderSurface(REPO_ROOT, 'claude'), [], 'claude has no rendered surface');
});

// --- T006 · antigravity install surface -------------------------------------
test('T006 antigravity install renders the skills tree + entrypoint; no claude surface', () => {
  const target = tmp();
  install(target, 'antigravity');

  for (const name of [...EXPECTED_SKILLS, ...EXPECTED_COMMANDS]) {
    const skillPath = path.join(target, '.agents/skills', name, 'SKILL.md');
    assert.ok(fs.existsSync(skillPath), `${name}/SKILL.md written`);
    assert.match(fs.readFileSync(skillPath, 'utf8'), /^---\nname: /, `${name} has frontmatter`);
  }
  assert.ok(fs.existsSync(path.join(target, 'AGENTS.md')), 'AGENTS.md at root');
  assert.ok(!fs.existsSync(path.join(target, 'CLAUDE.md')), 'no CLAUDE.md');
  assert.ok(!tree(target).some((p) => p.startsWith('.claude/')), 'no .claude surface');

  // manifest records the rendered surface as framework files.
  const m = loadManifest(target);
  assert.equal(m.tools.stack, 'antigravity');
  assert.ok(m.files['.agents/skills/021-init/SKILL.md'], 'surface file in manifest inventory');
});

// --- T007 · GEMINI.md honored -----------------------------------------------
test('T007 an existing GEMINI.md is honored as the entrypoint; no AGENTS.md', () => {
  const target = tmp();
  const gemini = '# my gemini entrypoint\n';
  fs.writeFileSync(path.join(target, 'GEMINI.md'), gemini);
  install(target, 'antigravity');

  assert.equal(fs.readFileSync(path.join(target, 'GEMINI.md'), 'utf8'), gemini, 'GEMINI.md untouched');
  assert.ok(!fs.existsSync(path.join(target, 'AGENTS.md')), 'no AGENTS.md when GEMINI.md present');

  const fresh = tmp();
  install(fresh, 'antigravity');
  assert.ok(fs.existsSync(path.join(fresh, 'AGENTS.md')), 'AGENTS.md when no GEMINI.md');
});

// --- T008 · stack-aware ownership -------------------------------------------
test('T008 classify: .agents surface framework-owned under antigravity, null under claude', () => {
  assert.equal(classify('.agents/skills/021-init/SKILL.md', 'antigravity'), CLASS.FRAMEWORK);
  assert.equal(classify('.agents/skills/021-init/SKILL.md', 'claude'), null);
  assert.equal(classify('AGENTS.md', 'antigravity'), CLASS.USER);
  assert.equal(classify('GEMINI.md', 'antigravity'), CLASS.USER);
  assert.equal(classify('.claude/commands/021-status.md', 'antigravity'), null);
});

// --- T010 · --upgrade honors the recorded stack -----------------------------
test('T010 --upgrade on an antigravity manifest refreshes .agents, adds no claude surface', () => {
  const target = tmp();
  install(target, 'antigravity');
  install(target, undefined, { upgrade: true }); // stack read from manifest

  assert.ok(fs.existsSync(path.join(target, '.agents/skills/021-init/SKILL.md')), '.agents surface intact');
  assert.ok(!fs.existsSync(path.join(target, 'CLAUDE.md')), 'upgrade added no CLAUDE.md');
  assert.ok(!tree(target).some((p) => p.startsWith('.claude/')), 'upgrade added no .claude surface');
  assert.equal(loadManifest(target).tools.stack, 'antigravity');
});

// --- T011 · migrate wire-through --------------------------------------------
test('T011 migrate detects antigravity from .agents/ and installs the surface', () => {
  const target = tmp();
  fs.writeFileSync(path.join(target, 'src.js'), "console.log('app');\n"); // non-empty → migrate
  fs.mkdirSync(path.join(target, '.agents'), { recursive: true });
  fs.writeFileSync(path.join(target, 'AGENTS.md'), '# existing agents\n');

  install(target, undefined, { now: '2026-02-01T00:00:00.000Z' }); // no --stack; detection runs

  const m = loadManifest(target);
  assert.equal(m.mode, 'migrate');
  assert.equal(m.tools.stack, 'antigravity', 'detected antigravity from .agents/AGENTS.md');
  assert.ok(fs.existsSync(path.join(target, '.agents/skills/021-init/SKILL.md')), 'surface installed in migrate');
  assert.equal(fs.readFileSync(path.join(target, 'AGENTS.md'), 'utf8'), '# existing agents\n', 'AGENTS.md honored');
});

// --- T012 · MCP post-install note -------------------------------------------
test('T012 antigravity install emits an MCP note; nothing written to ~/.gemini', () => {
  const target = tmp();
  const lines = [];
  const orig = console.log;
  console.log = (m) => lines.push(String(m));
  try {
    initFramework(target, { sourceDir: REPO_ROOT, yes: true, stack: 'antigravity' });
  } finally {
    console.log = orig;
  }
  const out = lines.join('\n');
  assert.match(out, /mcp_config\.json/, 'MCP note mentions mcp_config.json');
  assert.match(out, /~\/\.gemini/, 'MCP note references the gemini config path');
  assert.ok(!fs.existsSync(path.join(target, '.gemini')), 'no .gemini written into the target');
});

// === spec 008 · Kiro adapter (Part A — install) =============================

// --- 008-T004 · renderSurface for kiro --------------------------------------
test('008-T004 renderSurface(kiro): steering (flat) + agent-json + materialized skills', () => {
  const surface = renderSurface(REPO_ROOT, 'kiro');
  const dests = surface.map((s) => s.dest);

  for (const s of ['021-product', '021-tech', '021-structure']) {
    assert.ok(dests.includes(`.kiro/steering/${s}.md`), `flat steering ${s}.md (keep filename, no SKILL.md)`);
  }
  assert.ok(dests.includes('.kiro/agents/021.json'), 'agent-json relocated flat');
  for (const name of EXPECTED_SKILLS) {
    assert.ok(dests.includes(`.kiro/skills/${name}/SKILL.md`), `skill ${name} materialized under .kiro`);
  }
  // steering content is the template verbatim (frontmatter authored at rest)
  const product = surface.find((s) => s.dest === '.kiro/steering/021-product.md');
  assert.match(product.content, /^---\ninclusion: always\n---/, 'steering inclusion-mode frontmatter');
  assert.deepEqual(dests, [...dests].sort(), 'sorted by dest');
});

// --- 008-T005 · kiro install surface (scaffold + migrate) -------------------
test('008-T005 kiro install: steering + agent + skills; no other stack surface', () => {
  const target = tmp();
  install(target, 'kiro');

  for (const s of ['021-product', '021-tech', '021-structure']) {
    assert.ok(fs.existsSync(path.join(target, '.kiro/steering', `${s}.md`)), `${s}.md written`);
  }
  assert.ok(fs.existsSync(path.join(target, '.kiro/agents/021.json')), '021.json written');
  assert.ok(fs.existsSync(path.join(target, '.kiro/skills/021-generate-prd/SKILL.md')), 'skills materialized');
  assert.ok(!fs.existsSync(path.join(target, 'CLAUDE.md')), 'no CLAUDE.md');
  assert.ok(!fs.existsSync(path.join(target, 'AGENTS.md')), 'no AGENTS.md (kiro is entrypoint-less)');
  assert.ok(!tree(target).some((p) => p.startsWith('.claude/') || p.startsWith('.agents/')), 'no claude/agents surface');

  const m = loadManifest(target);
  assert.equal(m.tools.stack, 'kiro');
  assert.equal(m.tools.ssd, 'kiro-specs');
  assert.ok(m.files['.kiro/steering/021-product.md'], 'steering in manifest inventory');

  // migrate path: a .kiro/ repo with no --stack detects kiro and installs the surface
  const mig = tmp();
  fs.writeFileSync(path.join(mig, 'src.js'), "console.log('x');\n");
  fs.mkdirSync(path.join(mig, '.kiro'), { recursive: true });
  install(mig, undefined, { now: '2026-02-01T00:00:00.000Z' });
  assert.equal(loadManifest(mig).tools.stack, 'kiro', 'migrate detected kiro');
  assert.ok(fs.existsSync(path.join(mig, '.kiro/steering/021-product.md')), 'surface installed in migrate');
});

// --- 008-T006 · entrypoint-optional ownership; .kiro/specs unmanaged --------
test('008-T006 classify: kiro .kiro surface owned; entrypoint-less; .kiro/specs unmanaged', () => {
  assert.equal(classify('.kiro/steering/021-product.md', 'kiro'), CLASS.FRAMEWORK);
  assert.equal(classify('.kiro/agents/021.json', 'kiro'), CLASS.FRAMEWORK);
  assert.equal(classify('.kiro/skills/021-generate-prd/SKILL.md', 'kiro'), CLASS.FRAMEWORK);
  assert.equal(classify('.kiro/steering/021-product.md', 'claude'), null, 'unmanaged under other stacks');
  assert.equal(classify('CLAUDE.md', 'kiro'), null, 'kiro has no CLAUDE.md entrypoint');
  assert.equal(classify('AGENTS.md', 'kiro'), null, 'kiro has no AGENTS.md entrypoint');
  // analyze A3: engine spec state is disjoint from the install surface
  assert.equal(classify('.kiro/specs/my-feature/requirements.md', 'kiro'), null, '.kiro/specs unmanaged by install');
});
