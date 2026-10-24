// Takes the screenshots of the examples for the website from the example app,
// on an Android emulator or an iOS simulator:
//
//   node docs/scripts/capture-screenshots.mjs android [--device <serial>] [id...]
//   node docs/scripts/capture-screenshots.mjs ios [--device <udid>] [--scale 3] [id...]
//
// Needs the example app installed and Metro running for it (`yarn example
// start`, on Android also `adb reverse tcp:8081 tcp:8081`), and cwebp
// (`brew install webp`). macOS only, the crop uses sips.
//
// The script sets docs/examples/capture.ts to one example after the other and
// restarts the app, which then shows that example in a 260 dp wide 3:4 frame.
// Each screenshot is cropped to the frame and saved as
// docs/static/img/screens/<platform>/<id>.webp.
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docsRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);
const captureFile = path.join(docsRoot, 'examples', 'capture.ts');
const appId = 'rngooglemapsplus.example';
// Same as CAPTURE_WIDTH in example/src/screens/DocsExampleScreen.tsx.
const frameWidth = 260;
// Terrain, satellite, 3D buildings, indoor maps, remote tiles and examples that
// act once the map has loaded take longer.
const waitSeconds = {
  'navigation': 25,
  'street-view': 30,
  'hiking': 35,
  'drone': 35,
  'indoor': 25,
  'tiles': 25,
  'camera': 20,
  'snapshot': 20,
  'clustering': 20,
  'advanced-markers': 20,
  'traffic': 20,
};
// The location example shows the device position, set to the Ferry Building.
const position = { latitude: 37.7955, longitude: -122.3937 };

const args = process.argv.slice(2);
const platform = args.shift();
const option = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args.splice(i, 2)[1];
};
const device = option('--device');
const iosScale = Number(option('--scale') ?? 3);
if (platform !== 'android' && platform !== 'ios') {
  console.error(
    'Usage: capture-screenshots.mjs <android|ios> [--device <id>] [id...]'
  );
  process.exit(1);
}

const registry = await readFile(
  path.join(docsRoot, 'examples', 'index.ts'),
  'utf8'
);
const ids =
  args.length > 0
    ? args
    : [...registry.matchAll(/id: '([\w-]+)'/g)].map(([, id]) => id);

const run = (command, commandArgs) =>
  execFileSync(command, commandArgs, {
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
const sleep = (seconds) =>
  new Promise((resolve) => setTimeout(resolve, seconds * 1000));

// adb drops the connection now and then, e.g. right after the emulator booted.
const adb = (...adbArgs) => {
  const withDevice = device ? ['-s', device, ...adbArgs] : adbArgs;
  try {
    return run('adb', withDevice);
  } catch {
    run(
      'adb',
      device ? ['-s', device, 'wait-for-device'] : ['wait-for-device']
    );
    return run('adb', withDevice);
  }
};
const simctl = (...simctlArgs) => run('xcrun', ['simctl', ...simctlArgs]);

const devices = {
  android: {
    grantLocation() {
      for (const permission of ['FINE', 'COARSE']) {
        adb(
          'shell',
          'pm',
          'grant',
          appId,
          `android.permission.ACCESS_${permission}_LOCATION`
        );
      }
      adb(
        'emu',
        'geo',
        'fix',
        String(position.longitude),
        String(position.latitude)
      );
    },
    scale() {
      const out = adb('shell', 'wm', 'density').toString();
      const density =
        out.match(/Override density: (\d+)/) ?? out.match(/density: (\d+)/);
      return Number(density[1]) / 160;
    },
    restart() {
      adb('shell', 'am', 'force-stop', appId);
      adb(
        'shell',
        'monkey',
        '-p',
        appId,
        '-c',
        'android.intent.category.LAUNCHER',
        '1'
      );
    },
    async screenshot(file) {
      await writeFile(file, adb('exec-out', 'screencap', '-p'));
    },
  },
  ios: {
    grantLocation() {
      simctl('privacy', device ?? 'booted', 'grant', 'location', appId);
      simctl(
        'location',
        device ?? 'booted',
        'set',
        `${position.latitude},${position.longitude}`
      );
    },
    scale: () => iosScale,
    restart() {
      try {
        simctl('terminate', device ?? 'booted', appId);
      } catch {
        // not running
      }
      simctl('launch', device ?? 'booted', appId);
    },
    async screenshot(file) {
      simctl('io', device ?? 'booted', 'screenshot', '--type=png', file);
    },
  },
}[platform];

const size = (file) => {
  const out = run('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file]);
  const [, width, height] = out
    .toString()
    .match(/pixelWidth: (\d+)\s+pixelHeight: (\d+)/);
  return { width: Number(width), height: Number(height) };
};

// The frame is centered on the screen. Two pixels are cut off on each side
// to stay clear of the edge.
async function crop(screenshot, out) {
  const screen = size(screenshot);
  const scale = devices.scale();
  const width = Math.floor(frameWidth * scale) - 4;
  const height = Math.floor((frameWidth * 4 * scale) / 3) - 4;
  const x = Math.round((screen.width - width) / 2);
  const y = Math.round((screen.height - height) / 2);
  const cropped = `${screenshot}.crop.png`;
  run('sips', [
    '-c',
    String(height),
    String(width),
    '--cropOffset',
    String(y),
    String(x),
    screenshot,
    '--out',
    cropped,
  ]);
  run('sips', ['-z', '800', '600', cropped, '--out', cropped]);
  run('cwebp', ['-quiet', '-q', '84', cropped, '-o', out]);
}

const original = await readFile(captureFile, 'utf8');
const setCapture = (id) =>
  writeFile(
    captureFile,
    original.replace(
      /export const capture: string \| null = .*;/,
      `export const capture: string | null = ${id ? `'${id}'` : 'null'};`
    )
  );

devices.grantLocation();
const tmp = await mkdtemp(path.join(tmpdir(), 'rngmp-screens-'));
try {
  for (const id of ids) {
    await setCapture(id);
    // Give Metro a moment to pick up the change before the app reloads.
    await sleep(2);
    devices.restart();
    await sleep(waitSeconds[id] ?? 15);
    const screenshot = path.join(tmp, `${id}.png`);
    await devices.screenshot(screenshot);
    const out = path.join(
      docsRoot,
      'static',
      'img',
      'screens',
      platform,
      `${id}.webp`
    );
    await crop(screenshot, out);
    console.log(`${platform}/${id}.webp`);
  }
} finally {
  await writeFile(captureFile, original);
  await rm(tmp, { recursive: true, force: true });
}
