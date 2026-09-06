import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const script = path.resolve(__dirname, '../scripts/nitrogen-patch.js');
let root: string;
let component: string;

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), 'nitrogen-patch-'));
  const generated = path.join(root, 'nitrogen/generated');
  component = path.join(
    generated,
    'shared/c++/views/HybridRNGoogleMapsPlusViewComponent.cpp'
  );
  await mkdir(path.dirname(component), { recursive: true });
  await mkdir(path.join(generated, 'android'), { recursive: true });
  await mkdir(path.join(generated, 'shared/json'), { recursive: true });
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

function runPatch() {
  return spawnSync(process.execPath, [script], { cwd: root, encoding: 'utf8' });
}

test.each([
  [
    'ReactProp (Nitrogen 0.37+)',
    'enableStrictMarkerPressHitbox(nitro::ReactProp<std::optional<bool>>::fromRawValue("RNGoogleMapsPlusView", "enableStrictMarkerPressHitbox", rawProps, sourceProps.enableStrictMarkerPressHitbox))',
    'return nitro::ReactProp<std::optional<bool>>(std::nullopt, cache.makeShared(std::move(value)));',
  ],
  [
    'legacy CachedProp',
    'return CachedProp<std::optional<bool>>::fromRawValue(*runtime, value, sourceProps.enableStrictMarkerPressHitbox);',
    'return CachedProp<std::optional<bool>>::fromRawValue(*runtime, jsi::Value::undefined(), sourceProps.enableStrictMarkerPressHitbox);',
  ],
])(
  'patches %s and can run twice without changing output',
  async (_, input, reset) => {
    await writeFile(component, input);

    const first = runPatch();
    expect(first.status).toBe(0);
    const patched = await readFile(component, 'utf8');
    expect(patched).toContain('if (value.isNull())');
    expect(patched).toContain(reset);
    // Keep the generator's normal conversion path for booleans and omitted props.
    expect(patched).toContain('sourceProps.enableStrictMarkerPressHitbox');

    const second = runPatch();
    expect(second.status).toBe(0);
    expect(await readFile(component, 'utf8')).toBe(patched);
  }
);

test('rejects an unknown generated format without changing the component', async () => {
  const input = '// unexpected generator output';
  await writeFile(component, input);

  const result = runPatch();
  expect(result.status).toBe(1);
  expect(result.stderr).toContain(
    'Unable to patch enableStrictMarkerPressHitbox null handling'
  );
  expect(await readFile(component, 'utf8')).toBe(input);
});
