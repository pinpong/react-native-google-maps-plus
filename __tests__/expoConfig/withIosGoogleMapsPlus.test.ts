import fs from 'fs';
import path from 'path';

import withIosGoogleMapsPlus from '../../expoConfig/src/ios/withIosGoogleMapsPlus';

import type { RNGoogleMapsPlusExpoPluginProps } from '../../expoConfig/src/types';

jest.mock('@expo/config-plugins', () => {
  const actual = jest.requireActual('@expo/config-plugins');
  const applyMod =
    (key: string) =>
    (
      config: { __mods: Record<string, unknown> },
      action: (conf: unknown) => { modResults: unknown }
    ) => {
      const result = action({ ...config, modResults: config.__mods[key] });
      config.__mods[key] = result.modResults;
      return config;
    };
  return {
    ...actual,
    withInfoPlist: applyMod('infoPlist'),
    withPodfile: applyMod('podfile'),
    withPodfileProperties: applyMod('podfileProperties'),
    withAppDelegate: applyMod('appDelegate'),
  };
});

const PROPS: RNGoogleMapsPlusExpoPluginProps = {
  googleMapsAndroidApiKey: 'unused-android-key',
  googleMapsIosApiKey: 'ios-key',
};

const LEGACY_PODFILE_BLOCK = `# @generated begin react-native-google-maps-svgkit-patch - expo prebuild (DO NOT MODIFY) sync-ed16ec228929e9f6bcce5f8654ab58fb1bdadeea
  require File.join(File.dirname(\`node --print "require.resolve('react-native-google-maps-plus/package.json')"\`), 'scripts', 'svgkit_patch')
  apply_svgkit_patch(installer)
# @generated end react-native-google-maps-svgkit-patch
`;

const LEGACY_MODULAR_HEADERS_BLOCK = `# @generated begin react-native-google-maps-modular-headers - expo prebuild (DO NOT MODIFY) sync-b7c1d0c0f4d0a3e1e0f2a0d6f1c4c1b0d1a2e3f4
use_modular_headers!
# @generated end react-native-google-maps-modular-headers
`;

const LEGACY_APP_DELEGATE_IMPORT = `// @generated begin react-native-google-maps-import - expo prebuild (DO NOT MODIFY) sync-3b9e722debd3c073b9705963208f8121ec9f576c
import GoogleMaps
// @generated end react-native-google-maps-import
`;

const LEGACY_APP_DELEGATE_INIT = `// @generated begin react-native-google-maps-init - expo prebuild (DO NOT MODIFY) sync-ed7def55dfd1b52fb685aa33a269aeb34fc6ab13

    if let apiKey = Bundle.main.object(forInfoDictionaryKey: "MAPS_API_KEY") as? String {
      GMSServices.provideAPIKey(apiKey)
    }
// @generated end react-native-google-maps-init
`;

const LEGACY_APP_DELEGATE = `import UIKit
import React

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
    return true
  }
}
`;

type PluginMods = {
  infoPlist: Record<string, unknown>;
  podfileProperties: Record<string, string>;
  podfile: { path: string; language: string; contents: string };
  appDelegate: { path: string; language: string; contents: string };
};

type ApplyOptions = {
  props?: Partial<RNGoogleMapsPlusExpoPluginProps>;
  infoPlist?: Record<string, unknown>;
  podfileProperties?: Record<string, string>;
  podfile?: string;
  appDelegate?: string;
  appDelegateLanguage?: string;
};

function readFixture(name: string): string {
  return fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');
}

function applyPlugin({
  props,
  infoPlist = {},
  podfileProperties = {},
  podfile = readFixture('Podfile'),
  appDelegate = readFixture('AppDelegate.swift'),
  appDelegateLanguage = 'swift',
}: ApplyOptions = {}): PluginMods {
  const config = {
    name: 'example',
    slug: 'example',
    __mods: {
      infoPlist,
      podfileProperties,
      podfile: { path: 'ios/Podfile', language: 'rb', contents: podfile },
      appDelegate: {
        path: 'ios/AppDelegate.swift',
        language: appDelegateLanguage,
        contents: appDelegate,
      },
    },
  };
  withIosGoogleMapsPlus(
    config as never,
    props as RNGoogleMapsPlusExpoPluginProps
  );
  return config.__mods as PluginMods;
}

function reapply(mods: PluginMods, props?: ApplyOptions['props']): PluginMods {
  return applyPlugin({
    props,
    infoPlist: mods.infoPlist,
    podfileProperties: mods.podfileProperties,
    podfile: mods.podfile.contents,
    appDelegate: mods.appDelegate.contents,
  });
}

function count(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

describe('withIosGoogleMapsPlus', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    delete process.env.GOOGLE_MAPS_API_KEY_IOS;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Info.plist', () => {
    it('sets MAPS_API_KEY from the plugin props', () => {
      const { infoPlist } = applyPlugin({ props: PROPS });
      expect(infoPlist.MAPS_API_KEY).toBe('ios-key');
    });

    it('falls back to the GOOGLE_MAPS_API_KEY_IOS env var', () => {
      process.env.GOOGLE_MAPS_API_KEY_IOS = 'env-key';
      const { infoPlist } = applyPlugin({ props: {} });
      expect(infoPlist.MAPS_API_KEY).toBe('env-key');
    });

    it('warns and leaves the plist untouched when no key is provided', () => {
      const { infoPlist } = applyPlugin({ props: {} });
      expect(infoPlist).not.toHaveProperty('MAPS_API_KEY');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('No iOS API key')
      );
    });

    it('does not crash when the plugin is used without props', () => {
      expect(() => applyPlugin({ props: undefined })).not.toThrow();
    });
  });

  describe('Podfile.properties.json', () => {
    it('opts into dynamically linked frameworks', () => {
      const { podfileProperties } = applyPlugin({ props: PROPS });

      expect(podfileProperties['ios.useFrameworks']).toBe('dynamic');
    });

    it('keeps a linkage the app already chose', () => {
      const { podfileProperties } = applyPlugin({
        props: PROPS,
        podfileProperties: { 'ios.useFrameworks': 'static' },
      });

      expect(podfileProperties['ios.useFrameworks']).toBe('static');
    });
  });

  describe('Podfile', () => {
    it('adds use_modular_headers! after the platform line', () => {
      const { contents } = applyPlugin({ props: PROPS }).podfile;

      expect(count(contents, 'use_modular_headers!')).toBe(1);
      expect(contents.indexOf('use_modular_headers!')).toBeGreaterThan(
        contents.search(/platform\s+:ios/)
      );
    });

    it('keeps a single use_modular_headers! when the app already has one', () => {
      const legacy = readFixture('Podfile').replace(
        /^(platform\s+:ios.*\n)/m,
        `$1${LEGACY_MODULAR_HEADERS_BLOCK}`
      );

      const { contents } = applyPlugin({
        props: PROPS,
        podfile: legacy,
      }).podfile;

      expect(contents.match(/use_modular_headers!/g)).toHaveLength(1);
    });

    it('is idempotent when applied twice', () => {
      const first = applyPlugin({ props: PROPS });
      const second = reapply(first, PROPS);

      expect(second.podfile.contents).toBe(first.podfile.contents);
    });

    it('removes the svgkit patch block generated by previous versions', () => {
      const legacy = readFixture('Podfile').replace(
        'post_install do |installer|\n',
        `post_install do |installer|\n${LEGACY_PODFILE_BLOCK}`
      );
      expect(legacy).toContain('apply_svgkit_patch(installer)');

      const { contents } = applyPlugin({
        props: PROPS,
        podfile: legacy,
      }).podfile;

      expect(contents).not.toContain('svgkit_patch');
      expect(contents).not.toContain('react-native-google-maps-svgkit-patch');
    });

    it('matches the snapshot for the current Expo template', () => {
      const { contents } = applyPlugin({ props: PROPS }).podfile;
      expect(contents).toMatchSnapshot();
    });
  });

  describe('AppDelegate', () => {
    it('adds the GoogleMaps import after import React', () => {
      const { contents } = applyPlugin({ props: PROPS }).appDelegate;

      expect(count(contents, 'import GoogleMaps')).toBe(1);
      expect(contents.indexOf('import GoogleMaps')).toBeGreaterThan(
        contents.indexOf('import React')
      );
    });

    it('initializes GMSServices inside didFinishLaunchingWithOptions before the super call', () => {
      const { contents } = applyPlugin({ props: PROPS }).appDelegate;

      const initIndex = contents.indexOf('GMSServices.provideAPIKey');
      expect(initIndex).toBeGreaterThan(
        contents.indexOf('didFinishLaunchingWithOptions')
      );
      expect(initIndex).toBeLessThan(
        contents.indexOf(
          'return super.application(application, didFinishLaunchingWithOptions: launchOptions)'
        )
      );
    });

    it('is idempotent when applied twice', () => {
      const first = applyPlugin({ props: PROPS });
      const second = reapply(first, PROPS);

      expect(second.appDelegate.contents).toBe(first.appDelegate.contents);
    });

    it('falls back to the didFinishLaunchingWithOptions anchor when there is no super call', () => {
      const { contents } = applyPlugin({
        props: PROPS,
        appDelegate: LEGACY_APP_DELEGATE,
      }).appDelegate;

      const initIndex = contents.indexOf('GMSServices.provideAPIKey');
      expect(initIndex).toBeGreaterThan(
        contents.indexOf('didFinishLaunchingWithOptions')
      );
      expect(initIndex).toBeLessThan(contents.indexOf('return true'));
    });

    it('skips injection and warns for a non-swift AppDelegate', () => {
      const objcAppDelegate = '#import "AppDelegate.h"\n';
      const { contents } = applyPlugin({
        props: PROPS,
        appDelegate: objcAppDelegate,
        appDelegateLanguage: 'objcpp',
      }).appDelegate;

      expect(contents).toBe(objcAppDelegate);
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('AppDelegate is not Swift')
      );
    });

    it('does not duplicate the blocks generated by previous versions', () => {
      const legacy = readFixture('AppDelegate.swift')
        .replace(
          'import React\n',
          `import React\n${LEGACY_APP_DELEGATE_IMPORT}`
        )
        .replace(
          /^(\s*return super\.application\()/m,
          `${LEGACY_APP_DELEGATE_INIT}$1`
        );

      const { contents } = applyPlugin({
        props: PROPS,
        appDelegate: legacy,
      }).appDelegate;

      expect(count(contents, 'import GoogleMaps')).toBe(1);
      expect(count(contents, 'GMSServices.provideAPIKey')).toBe(1);
      expect(contents).toBe(applyPlugin({ props: PROPS }).appDelegate.contents);
    });

    it('matches the snapshot for the current Expo template', () => {
      const { contents } = applyPlugin({ props: PROPS }).appDelegate;
      expect(contents).toMatchSnapshot();
    });
  });
});
