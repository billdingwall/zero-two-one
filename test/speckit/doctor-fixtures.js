'use strict';

/**
 * doctor-fixtures.js — harness for the doctor suite (spec 004, T001).
 * Builds temp repos with seeded specs/_INDEX/releases/roadmap/backlog/manifest.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

function write(root, rel, content) {
  const abs = path.join(root, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
}

/**
 * @param {object} o
 *   specs      [{ name, status, release?, tasks? }]
 *   indexRows  optional override [{ name, status, release? }] (else derived from specs)
 *   releases   { 'mvp-3': 'In progress' }
 *   roadmap    { 'mvp-3': '🔜 Next' }
 *   backlog    [{ status, release, desc? }]
 *   manifest   { phase, ... } | null
 *   extraFiles { relpath: content }   (e.g. a top-level specs/foo.md for inference)
 */
function build(o = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'zto-doc-'));
  const specs = o.specs || [];
  for (const s of specs) {
    write(dir, `specs/${s.name}/spec.md`, `---\nstatus: ${s.status}\nrelease: ${s.release || 'mvp-3'}\n---\n# ${s.name}\n`);
    write(dir, `specs/${s.name}/tasks.md`, s.tasks || '- [x] T001 done\n');
  }
  const rows = o.indexRows || specs.map((s) => ({ name: s.name, status: s.status, release: s.release || 'mvp-3' }));
  let idx = '# Specs\n\n| Spec | Feature | Release | Status |\n|---|---|---|---|\n';
  for (const r of rows) idx += `| [${r.name}](${r.name}/spec.md) | ${r.name} | ${r.release || 'mvp-3'} | ${r.status} |\n`;
  write(dir, 'specs/_INDEX.md', idx);

  for (const [rel, status] of Object.entries(o.releases || {})) {
    write(dir, `requirements/_releases/${rel}.md`, `# Release: ${rel}\n\n- **Status:** ${status}\n`);
  }
  if (o.roadmap && Object.keys(o.roadmap).length) {
    let rm = '# Roadmap\n\n| Release | Description | Status | Priority | Dep | Phase |\n|---|---|---|---|---|---|\n';
    for (const [rel, status] of Object.entries(o.roadmap)) rm += `| [${rel}](_releases/${rel}.md) | d | ${status} | High | — | MVP |\n`;
    write(dir, 'requirements/05-ROADMAP.md', rm);
  }
  if (o.backlog && o.backlog.length) {
    let bl = '# Backlog\n\n| Description | Status | Ownership | Release |\n|---|---|---|---|\n';
    for (const b of o.backlog) bl += `| ${b.desc || 'item'} | ${b.status} | Eng | ${b.release} |\n`;
    write(dir, 'requirements/04-BACKLOG.md', bl);
  }
  if (o.manifest) write(dir, '.zero-two-one.json', JSON.stringify(o.manifest));
  for (const [rel, content] of Object.entries(o.extraFiles || {})) write(dir, rel, content);
  return dir;
}

function snapshot(dir) {
  const out = {};
  (function walk(rel) {
    for (const e of fs.readdirSync(path.join(dir, rel || '.'), { withFileTypes: true })) {
      const child = rel ? path.join(rel, e.name) : e.name;
      if (e.isDirectory()) walk(child);
      else out[child] = crypto.createHash('sha256').update(fs.readFileSync(path.join(dir, child))).digest('hex');
    }
  })('');
  return out;
}

const rm = (d) => fs.rmSync(d, { recursive: true, force: true });

module.exports = { build, snapshot, rm };
