#!/usr/bin/env node
/**
 * Script to wrap console.log statements in development checks
 * This ensures console logs are stripped in production builds
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

// Patterns to match console statements
const consolePatterns = [
  /^(\s*)console\.(log|debug|info)\(/gm,
];

// Files/directories to skip
const skipPatterns = [
  'node_modules',
  'build',
  'dist',
  '.test.',
  '.spec.',
  'setupTests.ts'
];

function shouldSkipFile(filePath) {
  return skipPatterns.some(pattern => filePath.includes(pattern));
}

function wrapConsoleLogs(content, filePath) {
  let modified = false;
  let newContent = content;

  // Check if already has development check nearby
  const lines = content.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip if already wrapped
    if (i > 0 && lines[i - 1].includes("process.env.NODE_ENV === 'development'")) {
      continue;
    }
    
    // Check for console.log, console.debug, console.info
    const match = line.match(/^(\s*)console\.(log|debug|info)\(/);
    if (match) {
      const indent = match[1];
      const method = match[2];
      
      // Check if this console statement is standalone or needs wrapping
      if (!line.includes('//')) {
        lines[i] = `${indent}if (process.env.NODE_ENV === 'development') {\n${line}\n${indent}}`;
        modified = true;
      }
    }
  }

  if (modified) {
    newContent = lines.join('\n');
    console.log(`✓ Modified: ${filePath}`);
  }

  return { content: newContent, modified };
}

function processFile(filePath) {
  if (shouldSkipFile(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const { content: newContent, modified } = wrapConsoleLogs(content, filePath);

  if (modified) {
    fs.writeFileSync(filePath, newContent, 'utf8');
  }
}

function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!shouldSkipFile(fullPath)) {
        processDirectory(fullPath);
      }
    } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      processFile(fullPath);
    }
  }
}

console.log('🔍 Scanning for console.log statements...\n');
processDirectory(srcDir);
console.log('\n✅ Done! Console logs are now wrapped in development checks.');
console.log('💡 Tip: Run "npm run build" to create a production build without console logs.\n');
