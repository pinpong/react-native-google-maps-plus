/**
 * Recursively patches all generated Nitro files (Android & iOS):
 *
 * ANDROID
 *  - Replaces 'com.margelo.nitro.rngooglemapsplus' -> 'com.rngooglemapsplus'
 *  - Replaces 'com/margelo/nitro/rngooglemapsplus' -> 'com/rngooglemapsplus'
 *  - Removes 'margelo/nitro/' in RNGoogleMapsPlusOnLoad.cpp
 *  - Inserts `prepareToRecycleView()`
 *  nitrogen/generated/android/kotlin/com/margelo/nitro/rngooglemapsplus/views/HybridRNGoogleMapsPlusViewManager.kt
 *
 * iOS
 *  - Inserts `+ (BOOL)shouldBeRecycled`
 *  nitrogen/generated/ios/c++/views/HybridRNGoogleMapsPlusViewComponent.mm
 */
import { fileURLToPath } from 'url';
import { basename } from 'path';
import path from 'node:path';
import { readdir, readFile, writeFile } from 'node:fs/promises';

const ROOT_ANDROID = path.join(
  process.cwd(),
  'nitrogen',
  'generated',
  'android'
);
const ROOT_IOS = path.join(process.cwd(), 'nitrogen', 'generated', 'ios');
const ANDROID_ONLOAD_FILE = path.join(
  ROOT_ANDROID,
  'RNGoogleMapsPlusOnLoad.cpp'
);

const HYBRID_VIEW_MANAGER = path.join(
  ROOT_ANDROID,
  'kotlin/com/margelo/nitro/rngooglemapsplus/views/HybridRNGoogleMapsPlusViewManager.kt'
);

const HYBRID_VIEW_COMPONENT_IOS = path.join(
  ROOT_IOS,
  'c++/views/HybridRNGoogleMapsPlusViewComponent.mm'
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

const RECYCLE_METHOD_ANDROID = `
  /// added by ${filename}
  override fun prepareToRecycleView(reactContext: ThemedReactContext, view: View): View? {
    return null
  }
`;

const RECYCLE_METHOD_IOS = `
/// added by ${filename}
+ (BOOL)shouldBeRecycled
{
  return NO;
}
`;

async function processFile(filePath) {
  let content = await readFile(filePath, 'utf8');
  let updated = content;

  for (const { regex, replacement } of REPLACEMENTS) {
    updated = updated.replace(regex, replacement);
  }

  if (path.resolve(filePath) === path.resolve(ANDROID_ONLOAD_FILE)) {
    updated = updated.replace(/margelo\/nitro\//g, '');
  }

  if (path.resolve(filePath) === path.resolve(HYBRID_VIEW_MANAGER)) {
    if (!/override fun prepareToRecycleView/.test(updated)) {
      const pattern =
        /(override fun onDropViewInstance\(view: View\)\s*\{[^}]+\}\s*)/m;

      if (pattern.test(updated)) {
        updated = updated.replace(pattern, `$1${RECYCLE_METHOD_ANDROID}\n`);
      } else {
        throw new Error(
          `Pattern for "onDropViewInstance" not found in ${filePath}`
        );
      }
    }
  }

  if (path.resolve(filePath) === path.resolve(HYBRID_VIEW_COMPONENT_IOS)) {
    if (!/\+\s*\(BOOL\)\s*shouldBeRecycled/.test(updated)) {
      const pattern =
        /(- \(instancetype\)\s*init\s*\{(?:[^{}]|\{[^{}]*\})*\})/m;

      if (pattern.test(updated)) {
        updated = updated.replace(pattern, `$1\n${RECYCLE_METHOD_IOS}`);
      } else {
        throw new Error(`Pattern for "init" not found in ${filePath}`);
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
    await start(ROOT_ANDROID);
    await start(ROOT_IOS);
    console.log('All Nitrogen files patched successfully.');
  } catch (err) {
    console.error('Error while processing files:', err);
    process.exit(1);
  }
})();
