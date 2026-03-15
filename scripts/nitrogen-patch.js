/**
 * Recursively patches all generated Nitro files (Android & iOS):
 *
 * ANDROID
 *  - Replaces 'com.margelo.nitro.rngooglemapsplus' -> 'com.rngooglemapsplus'
 *  - Replaces 'com/margelo/nitro/rngooglemapsplus' -> 'com/rngooglemapsplus'
 *  - Removes 'margelo/nitro/' in RNGoogleMapsPlusOnLoad.cpp
 * iOS
 */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT_ANDROID = path.join(
  process.cwd(),
  'nitrogen',
  'generated',
  'android'
);

const SRC_JSON_DIR = path.join(
  process.cwd(),
  'nitrogen',
  'generated',
  'shared',
  'json'
);

const DEST_JSON_DIR = path.join(
  process.cwd(),
  'lib',
  'nitrogen',
  'generated',
  'shared',
  'json'
);

const ANDROID_ONLOAD_FILE = path.join(
  ROOT_ANDROID,
  'RNGoogleMapsPlusOnLoad.cpp'
);

const REPLACEMENTS = [
  {
    regex: /com\.margelo\.nitro\.rngooglemapsplus/g,
    replacement: 'com.rngooglemapsplus',
  },
  {
    regex: /com\/margelo\/nitro\/rngooglemapsplus/g,
    replacement: 'com/rngooglemapsplus',
  },
];

async function processFile(filePath) {
  let content = await readFile(filePath, 'utf8');
  let updated = content;

  for (const { regex, replacement } of REPLACEMENTS) {
    updated = updated.replace(regex, replacement);
  }

  if (path.resolve(filePath) === path.resolve(ANDROID_ONLOAD_FILE)) {
    updated = updated.replace(/margelo\/nitro\//g, '');
  }

  if (updated !== content) {
    await writeFile(filePath, updated, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

async function start(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await start(fullPath);
    } else if (entry.isFile()) {
      await processFile(fullPath);
    }
  }
}

async function copyJsonFiles() {
  try {
    await mkdir(DEST_JSON_DIR, { recursive: true });
    const files = await readdir(SRC_JSON_DIR);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const src = path.join(SRC_JSON_DIR, file);
        const dest = path.join(DEST_JSON_DIR, file);
        await copyFile(src, dest);
        console.log(`Copied JSON: ${file}`);
      }
    }
  } catch (err) {
    console.warn('Failed to copy JSON view configs:', err.message);
  }
}

(async () => {
  try {
    await copyJsonFiles();
    await start(ROOT_ANDROID);
    console.log('All Nitrogen files patched successfully.');
  } catch (err) {
    console.error('Error while processing files:', err);
    process.exit(1);
  }
})();
