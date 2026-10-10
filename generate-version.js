#!/usr/bin/env node
// ============================================================
// generate-version.js
// Auto-update VERSION.md berdasarkan isi file game
// ------------------------------------------------------------
// Cara pakai:
//   node generate-version.js
// Atau (jika package.json ada):
//   npm run version
// ============================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = __dirname;
const VERSION_FILE = path.join(ROOT, 'VERSION.md');

// ------------------------------------------------------------
// HELPER: Safe file read
// ------------------------------------------------------------
function readFile(filename) {
  try {
    return fs.readFileSync(path.join(ROOT, filename), 'utf8');
  } catch (e) {
    return null;
  }
}

function fileExists(filename) {
  return fs.existsSync(path.join(ROOT, filename));
}

function padEnd(str, len) {
  str = String(str);
  while (str.length < len) str += ' ';
  return str;
}

// ------------------------------------------------------------
// EXTRACT VERSION
// ------------------------------------------------------------

// Dari sw.js: const CACHE_NAME = 'pahlawan-bintang-v20.10.1';
function extractCacheVersion() {
  const content = readFile('sw.js');
  if (!content) return null;
  const match = content.match(/CACHE_NAME\s*=\s*['"]pahlawan-bintang-(v[\d.]+)['"]/);
  return match ? match[1] : null;
}

function extractCacheName() {
  const content = readFile('sw.js');
  if (!content) return null;
  const match = content.match(/CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
  return match ? match[1] : null;
}

// Dari index.html: <script src="./game.js?v=20.10.1"> atau <link href="./style.css?v=20.10.1">
function extractQueryVersion(filename) {
  const content = readFile('index.html');
  if (!content) return null;
  // Escape special regex chars in filename
  const escaped = filename.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escaped + '\\?v=([\\d.]+)');
  const match = content.match(regex);
  return match ? 'v' + match[1] : null;
}

// Dari header JS: // PAHLAWAN BINTANG — game.js v20.10.1
function extractJsHeaderVersion(filename) {
  const content = readFile(filename);
  if (!content) return null;
  const firstLines = content.split('\n').slice(0, 15).join('\n');
  // Cari pattern "v20.10.1" di header (2 baris pertama yang mengandung "—" atau "v")
  const match = firstLines.match(/v(\d+\.\d+\.\d+)/);
  return match ? 'v' + match[1] : null;
}

// ------------------------------------------------------------
// GIT INFO
// ------------------------------------------------------------
function gitCmd(cmd, fallback) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
  } catch (e) {
    return fallback;
  }
}

function getGitInfo() {
  return {
    commit: gitCmd('git rev-parse --short HEAD', 'n/a'),
    branch: gitCmd('git rev-parse --abbrev-ref HEAD', 'n/a'),
    lastCommitDate: gitCmd('git log -1 --format=%cd --date=short', new Date().toISOString().split('T')[0]),
    dirty: gitCmd('git status --porcelain', '').length > 0
  };
}

// ------------------------------------------------------------
// SCAN ALL GAME FILES
// ------------------------------------------------------------
function scanFiles(cacheVersion) {
  const defs = [
    { name: 'index.html',      get: () => extractQueryVersion('index.html') },
    { name: 'style.css',       get: () => extractQueryVersion('style.css') },
    { name: 'game.js',         get: () => extractQueryVersion('game.js') || extractJsHeaderVersion('game.js') },
    { name: 'multiplayer.js',  get: () => extractQueryVersion('multiplayer.js') || extractJsHeaderVersion('multiplayer.js') },
    { name: 'sw.js',           get: () => extractCacheVersion() },
    { name: 'achievements.json', get: () => '—' },
    { name: 'levels.json',     get: () => '—' },
    { name: 'manifest.json',   get: () => '—' },
    { name: 'server.js',       get: () => '—' }
  ];

  return defs.map(d => {
    const exists = fileExists(d.name);
    const version = exists ? (d.get() || '—') : '—';
    const isChanged = version === cacheVersion;
    return {
      name: d.name,
      exists,
      version,
      changed: isChanged,
      status: !exists ? 'Missing' : (isChanged ? 'Changed' : 'Stable')
    };
  });
}

// ------------------------------------------------------------
// BUILD TABLE STRING
// ------------------------------------------------------------
function buildFilesTable(files) {
  return files.map(f => {
    const icon = !f.exists ? '❌' : (f.changed ? '🔴' : '🟢');
    return `| \`${f.name}\` | ${f.version} | ${icon} ${f.status} |`;
  }).join('\n');
}

// ------------------------------------------------------------
// UPDATE VERSION.md BETWEEN MARKERS
// ------------------------------------------------------------
function updateBetweenMarkers(content, startMarker, endMarker, newContent) {
  const startIdx = content.indexOf(startMarker);
  const endIdx = content.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1) {
    console.warn(`⚠️  Marker tidak ditemukan: ${startMarker} ... ${endMarker}`);
    return content;
  }
  const before = content.slice(0, startIdx + startMarker.length);
  const after = content.slice(endIdx);
  return before + '\n' + newContent + '\n' + after;
}

// ------------------------------------------------------------
// MAIN
// ------------------------------------------------------------
function main() {
  console.log('');
  console.log('🔧 [VERSION] Auto-generating VERSION.md...');
  console.log('');

  if (!fs.existsSync(VERSION_FILE)) {
    console.error('❌ VERSION.md tidak ditemukan di root project.');
    console.error('   Copy VERSION.md dulu dari template.');
    process.exit(1);
  }

  const cacheVersion = extractCacheVersion();
  const cacheName = extractCacheName();
  const git = getGitInfo();
  const today = new Date().toISOString().split('T')[0];

  if (!cacheVersion) {
    console.error('❌ Tidak bisa baca CACHE_NAME dari sw.js');
    process.exit(1);
  }

  const files = scanFiles(cacheVersion);

  console.log('📌 Info:');
  console.log(`   Game Version : ${cacheVersion}`);
  console.log(`   Cache Name   : ${cacheName}`);
  console.log(`   Git Commit   : ${git.commit} (${git.branch})`);
  console.log(`   Last Commit  : ${git.lastCommitDate}`);
  console.log(`   Today        : ${today}`);
  console.log('');

  console.log('📁 Files detected:');
  files.forEach(f => {
    const icon = !f.exists ? '❌' : (f.changed ? '🔴' : '🟢');
    console.log(`   ${icon} ${padEnd(f.name, 20)} ${padEnd(f.version, 12)} ${f.status}`);
  });
  console.log('');

  // ---------- Section 1: Info block ----------
  const infoBlock = [
    '| Field | Value |',
    '|---|---|',
    `| **Game Version** | \`${cacheVersion}\` |`,
    `| **Cache Name** | \`${cacheName}\` |`,
    `| **Last Updated** | \`${today}\` |`,
    `| **Git Commit** | \`${git.commit}\` (branch: \`${git.branch}\`) |`,
    `| **Last Commit Date** | \`${git.lastCommitDate}\` |`,
    `| **Working Tree** | ${git.dirty ? '🟡 Uncommitted changes' : '🟢 Clean'} |`
  ].join('\n');

  // ---------- Section 2: Files table ----------
  const filesBlock = [
    '| File | Version | Status |',
    '|---|---|---|',
    buildFilesTable(files)
  ].join('\n');

  // ---------- Read + Update ----------
  let content = fs.readFileSync(VERSION_FILE, 'utf8');
  const originalContent = content;

  content = updateBetweenMarkers(
    content,
    '<!-- AUTO-INFO-START -->',
    '<!-- AUTO-INFO-END -->',
    infoBlock
  );

  content = updateBetweenMarkers(
    content,
    '<!-- AUTO-FILES-START -->',
    '<!-- AUTO-FILES-END -->',
    filesBlock
  );

  if (content === originalContent) {
    console.log('ℹ️  VERSION.md tidak berubah (content sama).');
  } else {
    fs.writeFileSync(VERSION_FILE, content, 'utf8');
    console.log('✅ VERSION.md updated!');
  }

  console.log('');
  console.log('💡 Next steps:');
  console.log('   - Review VERSION.md');
  console.log('   - Commit ke Git: git add VERSION.md && git commit -m "chore: bump version"');
  console.log('   - Copy isi VERSION.md saat mulai chat AI baru');
  console.log('');
}

// ------------------------------------------------------------
// RUN
// ------------------------------------------------------------
try {
  main();
} catch (err) {
  console.error('');
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  process.exit(1);
}
