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
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { basename } from 'path';
import { fileURLToPath } from 'url';

const ROOT_ANDROID = path.join(
  process.cwd(),
  'nitrogen',
  'generated',
  'android'
);
const ROOT_IOS = path.join(process.cwd(), 'nitrogen', 'generated', 'ios');
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

const ANDROID_VIEW_MANAGER_METHODS =
  /override fun onDropViewInstance\(view: View\)\s*\{\s*super\.onDropViewInstance\(view\)\s*views\.remove\(view\)\s*\}/m;

const ANDROID_VIEW_MANAGER_METHODS_NEW = `
  override fun onDropViewInstance(view: View) {
    super.onDropViewInstance(view)
    views.remove(view)
  /// added by ${filename}
    if (view is GoogleMapsViewImpl) {
      view.destroyInternal()
    }
  }

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

/// added by ${filename}
- (void)dealloc {
  if (_hybridView) {
    RNGoogleMapsPlus::HybridRNGoogleMapsPlusViewSpec_cxx& swiftPart = _hybridView->getSwiftPart();
    swiftPart.dispose();
    _hybridView.reset();
  }
}`;

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
    if (ANDROID_VIEW_MANAGER_METHODS.test(updated)) {
      updated = updated.replace(
        ANDROID_VIEW_MANAGER_METHODS,
        ANDROID_VIEW_MANAGER_METHODS_NEW
      );
    } else {
      throw new Error(
        `Pattern for HybridRNGoogleMapsPlusViewManager not found in ${filePath}`
      );
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
    await start(ROOT_IOS);
    console.log('All Nitrogen files patched successfully.');
  } catch (err) {
    console.error('Error while processing files:', err);
    process.exit(1);
  }
})();
