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
    withAppDelegate: applyMod('appDelegate'),
  };
});

const PROPS: RNGoogleMapsPlusExpoPluginProps = {
  googleMapsAndroidApiKey: 'unused-android-key',
  googleMapsIosApiKey: 'ios-key',
};

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
  podfile: { path: string; language: string; contents: string };
  appDelegate: { path: string; language: string; contents: string };
};

type ApplyOptions = {
  props?: Partial<RNGoogleMapsPlusExpoPluginProps>;
  infoPlist?: Record<string, unknown>;
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
  podfile = readFixture('Podfile'),
  appDelegate = readFixture('AppDelegate.swift'),
  appDelegateLanguage = 'swift',
}: ApplyOptions = {}): PluginMods {
  const config = {
    name: 'example',
    slug: 'example',
    __mods: {
      infoPlist,
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
    podfile: mods.podfile.contents,
    appDelegate: mods.appDelegate.contents,
    appDelegateLanguage: mods.appDelegate.language,
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

  describe('Podfile', () => {
    it('adds use_modular_headers! after the platform line', () => {
      const { contents } = applyPlugin({ props: PROPS }).podfile;

      expect(count(contents, 'use_modular_headers!')).toBe(1);
      expect(contents.indexOf('use_modular_headers!')).toBeGreaterThan(
        contents.search(/platform\s+:ios/)
      );
    });

    it('injects the svgkit patch into the existing post_install block', () => {
      const { contents } = applyPlugin({ props: PROPS }).podfile;

      expect(contents).toContain(
        `require File.join(File.dirname(\`node --print "require.resolve('react-native-google-maps-plus/package.json')"\`), 'scripts', 'svgkit_patch')`
      );
      expect(count(contents, 'post_install do |installer|')).toBe(1);
      expect(contents.indexOf('apply_svgkit_patch(installer)')).toBeGreaterThan(
        contents.indexOf('post_install do |installer|')
      );
    });

    it('places the patch outside a nested if/end block from another plugin', () => {
      const nestedEndPodfile = `platform :ios, '16.0'

target 'Example' do
  post_install do |installer|
    if ENV['CI'] == 'true'
      puts 'ci run'
    end
    react_native_post_install(installer)
  end
end
`;
      const { contents } = applyPlugin({
        props: PROPS,
        podfile: nestedEndPodfile,
      }).podfile;

      expect(count(contents, 'apply_svgkit_patch(installer)')).toBe(1);
      expect(contents.indexOf('apply_svgkit_patch(installer)')).toBeLessThan(
        contents.indexOf("if ENV['CI']")
      );
    });

    it('appends a post_install block when the Podfile has none', () => {
      const minimalPodfile = `platform :ios, '16.0'

target 'Example' do
end
`;
      const { contents } = applyPlugin({
        props: PROPS,
        podfile: minimalPodfile,
      }).podfile;

      expect(count(contents, 'post_install do |installer|')).toBe(1);
      expect(contents).toContain('apply_svgkit_patch(installer)');
    });

    it('is idempotent when applied twice', () => {
      const first = applyPlugin({ props: PROPS });
      const second = reapply(first, PROPS);

      expect(second.podfile.contents).toBe(first.podfile.contents);
    });

    it('stays idempotent when the first run had to append the post_install block', () => {
      const minimalPodfile = `platform :ios, '16.0'

target 'Example' do
end
`;
      const first = applyPlugin({ props: PROPS, podfile: minimalPodfile });
      const second = reapply(first, PROPS);

      expect(second.podfile.contents).toBe(first.podfile.contents);
      expect(
        count(first.podfile.contents, 'apply_svgkit_patch(installer)')
      ).toBe(1);
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

    it('matches the snapshot for the current Expo template', () => {
      const { contents } = applyPlugin({ props: PROPS }).appDelegate;
      expect(contents).toMatchSnapshot();
    });
  });
});
