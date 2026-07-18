import path from 'path';

import { readAndroidManifestAsync } from '@expo/config-plugins/build/android/Manifest';

import withAndroidGoogleMapsPlus from '../../expoConfig/src/android/withAndroidGoogleMapsPlus';

import type { RNGoogleMapsPlusExpoPluginProps } from '../../expoConfig/src/types';
import type { AndroidConfig } from '@expo/config-plugins';

type AndroidManifest = AndroidConfig.Manifest.AndroidManifest;

jest.mock('@expo/config-plugins', () => {
  const actual = jest.requireActual('@expo/config-plugins');
  return {
    ...actual,
    withAndroidManifest: (
      config: { __mods: { androidManifest: unknown } },
      action: (conf: unknown) => { modResults: unknown }
    ) => {
      const result = action({
        ...config,
        modResults: config.__mods.androidManifest,
      });
      config.__mods.androidManifest = result.modResults;
      return config;
    },
  };
});

const API_KEY_NAME = 'com.google.android.geo.API_KEY';

async function loadManifest(): Promise<AndroidManifest> {
  return readAndroidManifestAsync(
    path.join(__dirname, 'fixtures', 'AndroidManifest.xml')
  );
}

function applyPlugin(
  manifest: AndroidManifest,
  props?: Partial<RNGoogleMapsPlusExpoPluginProps>
): AndroidManifest {
  const config = {
    name: 'example',
    slug: 'example',
    __mods: { androidManifest: manifest },
  };
  withAndroidGoogleMapsPlus(
    config as never,
    props as RNGoogleMapsPlusExpoPluginProps
  );
  return config.__mods.androidManifest;
}

function apiKeyEntries(manifest: AndroidManifest) {
  const metaData = manifest.manifest.application?.[0]?.['meta-data'] ?? [];
  return metaData.filter((item) => item.$['android:name'] === API_KEY_NAME);
}

describe('withAndroidGoogleMapsPlus', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    delete process.env.GOOGLE_MAPS_API_KEY_ANDROID;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('adds the API key from the plugin props to the manifest', async () => {
    const manifest = applyPlugin(await loadManifest(), {
      googleMapsAndroidApiKey: 'props-key',
    });

    const entries = apiKeyEntries(manifest);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.$['android:value']).toBe('props-key');
  });

  it('falls back to the GOOGLE_MAPS_API_KEY_ANDROID env var', async () => {
    process.env.GOOGLE_MAPS_API_KEY_ANDROID = 'env-key';

    const manifest = applyPlugin(await loadManifest(), {});

    expect(apiKeyEntries(manifest)[0]?.$['android:value']).toBe('env-key');
  });

  it('prefers the plugin props over the env var', async () => {
    process.env.GOOGLE_MAPS_API_KEY_ANDROID = 'env-key';

    const manifest = applyPlugin(await loadManifest(), {
      googleMapsAndroidApiKey: 'props-key',
    });

    expect(apiKeyEntries(manifest)[0]?.$['android:value']).toBe('props-key');
  });

  it('overwrites an existing API key instead of duplicating it', async () => {
    let manifest = applyPlugin(await loadManifest(), {
      googleMapsAndroidApiKey: 'old-key',
    });
    manifest = applyPlugin(manifest, { googleMapsAndroidApiKey: 'new-key' });

    const entries = apiKeyEntries(manifest);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.$['android:value']).toBe('new-key');
  });

  it('removes an existing API key and warns when no key is provided', async () => {
    let manifest = applyPlugin(await loadManifest(), {
      googleMapsAndroidApiKey: 'old-key',
    });
    manifest = applyPlugin(manifest, {});

    expect(apiKeyEntries(manifest)).toHaveLength(0);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('No Android API key')
    );
  });

  it('does not crash when the plugin is used without props', async () => {
    process.env.GOOGLE_MAPS_API_KEY_ANDROID = 'env-key';
    const manifest = await loadManifest();

    expect(() => applyPlugin(manifest, undefined)).not.toThrow();
    expect(apiKeyEntries(manifest)[0]?.$['android:value']).toBe('env-key');
  });
});
