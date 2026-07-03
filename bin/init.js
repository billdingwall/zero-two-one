#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const targetDir = process.argv[2] || process.cwd();
const sourceDir = path.join(__dirname, '..');

console.log(`Initializing Zero Two One AI Framework in ${targetDir}...`);

// Directories to copy
const dirsToCopy = [
  'prototype',
  'requirements',
  'skills',
  'specs',
  'templates',
  'workflow',
  '.github'
];

// Files to copy
const filesToCopy = [
  'CLAUDE.md',
  'README.md',
  'AI_CODING_GUIDELINES.md',
  'LIFECYCLE_WORKFLOW.md'
];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    // Skip node_modules and .git
    if (entry.name === 'node_modules' || entry.name === '.git') continue;

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy directories
dirsToCopy.forEach(dir => {
  const src = path.join(sourceDir, dir);
  const dest = path.join(targetDir, dir);
  if (fs.existsSync(src)) {
    console.log(`Copying ${dir}/...`);
    copyDir(src, dest);
  }
});

// Copy files
filesToCopy.forEach(file => {
  const src = path.join(sourceDir, file);
  const dest = path.join(targetDir, file);
  if (fs.existsSync(src)) {
    console.log(`Copying ${file}...`);
    fs.copyFileSync(src, dest);
  }
});

console.log('✅ Framework initialized successfully!');
console.log('\nNext Steps:');
console.log('1. Review README.md');
console.log('2. Ensure Claude Code is configured to use memory');
console.log('3. Fill in templates in requirements/');
