'use strict';

/**
 * hash.js — content hashing for the install manifest (spec 001, FR-015).
 *
 * Hashes are taken over LF-normalized content so a Windows/`autocrlf`
 * checkout does not report every framework file as modified. The trade-off
 * (accepted, clarify round 3): a CRLF-only change is not a modification.
 *
 * Zero runtime dependencies — `node:crypto` only.
 */

const crypto = require('crypto');
const fs = require('fs');

/** Normalize CRLF (and lone CR) to LF, so hashing is line-ending agnostic. */
function normalize(text) {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/** sha256 (hex) of LF-normalized string content. */
function hashContent(text) {
  return crypto.createHash('sha256').update(normalize(text), 'utf8').digest('hex');
}

/** sha256 (hex) of a file's LF-normalized content, or null if absent. */
function hashFile(filePath) {
  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) return null;
  return hashContent(fs.readFileSync(filePath, 'utf8'));
}

module.exports = { normalize, hashContent, hashFile };
