/**
 * Recursively patches all generated Android files:
 *  - Replaces 'com.margelo.nitro.rngooglemapsplus' -> 'com.rngooglemapsplus'
 *  - Replaces 'com/margelo/nitro/rngooglemapsplus' -> 'com/rngooglemapsplus'
 *  - Removes 'margelo/nitro/' in RNGoogleMapsPlusOnLoad.cpp
 *  - Inserts `prepareToRecycleView()` under `onDropViewInstance()` if missing
 */
import { fileURLToPath } from 'url';
import { basename } from 'path';
import path from 'node:path';
import { readdir, readFile, writeFile } from 'node:fs/promises';

const ROOT_DIR = path.join(process.cwd(), 'nitrogen', 'generated', 'android');
console.log(ROOT_DIR);
const ANDROID_ONLOAD_FILE = path.join(ROOT_DIR, 'RNGoogleMapsPlusOnLoad.cpp');

const HYBRID_VIEW_MANAGER = path.join(
  ROOT_DIR,
  'kotlin/com/margelo/nitro/rngooglemapsplus/views/HybridRNGoogleMapsPlusViewManager.kt'
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

const __filename = fileURLToPath(import.meta.url);
const filename = basename(__filename);

const RECYCLE_METHOD = `
  /// added by ${filename}
  override fun prepareToRecycleView(reactContext: ThemedReactContext, view: View): View? {
    return null
  }
`;

// Patch-Routine
async function processFile(filePath) {
  let content = await readFile(filePath, 'utf8');
  let updated = content;

  for (const { regex, replacement } of REPLACEMENTS) {
    updated = updated.replace(regex, replacement);
  }

  if (path.resolve(filePath) === path.resolve(ANDROID_ONLOAD_FILE)) {
    updated = updated.replace(/margelo\/nitro\//g, '');
  }

  console.log(filePath);
  if (path.resolve(filePath) === path.resolve(HYBRID_VIEW_MANAGER)) {
    if (!/override fun prepareToRecycleView/.test(updated)) {
      const pattern =
        /(override fun onDropViewInstance\(view: View\)\s*\{[^}]+\}\s*)/m;

      if (pattern.test(updated)) {
        updated = updated.replace(pattern, `$1${RECYCLE_METHOD}\n`);
      } else {
        updated = updated.replace(/}\s*$/m, `${RECYCLE_METHOD}\n}\n`);
      }
    }
  }

  if (updated !== content) {
    await writeFile(filePath, updated, 'utf8');
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
