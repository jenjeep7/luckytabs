#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read package.json to get the version
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Create build timestamp
const buildDate = new Date().toISOString();

// Update version.ts file
const versionFilePath = path.join(__dirname, '..', 'src', 'utils', 'version.ts');
const currentVersionFile = fs.readFileSync(versionFilePath, 'utf8');

// Extract current version from version.ts
const currentAppVersion = currentVersionFile.match(/APP_VERSION = '([^']+)'/)?.[1] || version;

// Update the version.ts file with build date comment
const updatedVersionFile = currentVersionFile.replace(
  /(export const APP_VERSION = '[^']+';)/,
  `$1 // Last updated: ${buildDate}`
);

fs.writeFileSync(versionFilePath, updatedVersionFile, 'utf8');

// Create or update .env.local with version info
const envLocalPath = path.join(__dirname, '..', '.env.local');
let envContent = '';

// Read existing .env.local if it exists
if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf8');
}

// Remove existing version and build date lines
envContent = envContent.replace(/^REACT_APP_VERSION=.*$/gm, '');
envContent = envContent.replace(/^REACT_APP_BUILD_DATE=.*$/gm, '');

// Add new version and build date
envContent += `\n# Auto-generated build info\n`;
envContent += `REACT_APP_VERSION=${version}\n`;
envContent += `REACT_APP_BUILD_DATE=${buildDate}\n`;

// Clean up extra newlines
envContent = envContent.replace(/\n+/g, '\n').trim() + '\n';

fs.writeFileSync(envLocalPath, envContent, 'utf8');

console.log(`✅ Version info updated:`);
console.log(`   Package Version: ${version}`);
console.log(`   App Version: ${currentAppVersion}`);
console.log(`   Build Date: ${buildDate}`);
console.log(`   Updated files: src/utils/version.ts, .env.local`);