/**
 * Recursively patches all generated Android files:
 *  - Replaces 'com.margelo.nitro.googlemapsnitro' -> 'com.googlemapsnitro'
 *  - Replaces 'com/margelo/nitro/googlemapsnitro' -> 'com/googlemapsnitro' (for C++ descriptors)
 *  - Removes 'margelo/nitro/' in GoogleMapsNitroOnLoad.cpp
 */
const path = require('node:path');
const { readdir, readFile, writeFile } = require('node:fs/promises');

const ROOT_DIR = path.join(process.cwd(), 'nitrogen', 'generated', 'android');
console.log(ROOT_DIR);
const ANDROID_ONLOAD_FILE = path.join(ROOT_DIR, 'GoogleMapsNitroOnLoad.cpp');

const REPLACEMENTS = [
  {
    regex: /com\.margelo\.nitro\.googlemapsnitro/g,
    replacement: 'com.googlemapsnitro',
  },
  {
    regex: /com\/margelo\/nitro\/googlemapsnitro/g,
    replacement: 'com/googlemapsnitro',
  },
];

async function processFile(filePath) {
  const content = await readFile(filePath, { encoding: 'utf8' });
  let updated = content;

  for (const { regex, replacement } of REPLACEMENTS) {
    updated = updated.replace(regex, replacement);
  }

  if (path.resolve(filePath) === path.resolve(ANDROID_ONLOAD_FILE)) {
    updated = updated.replace(/margelo\/nitro\//g, '');
  }

  if (updated !== content) {
    await writeFile(filePath, updated);
    console.log(`✔ Updated: ${filePath}`);
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

(async () => {
  try {
    await start(ROOT_DIR);
    console.log('All occurrences patched successfully.');
  } catch (err) {
    console.error('Error while processing files:', err);
    process.exit(1);
  }
})();
