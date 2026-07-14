import {
  type ConfigPlugin,
  withAppDelegate,
  withInfoPlist,
  withPodfile,
} from '@expo/config-plugins';
import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';

import type { RNGoogleMapsPlusExpoPluginProps } from '../types';

const withIosGoogleMapsPlus: ConfigPlugin<RNGoogleMapsPlusExpoPluginProps> = (
  config,
  props
) => {
  config = withInfoPlist(config, (conf) => {
    const apiKey =
      props.googleMapsIosApiKey ?? process.env.GOOGLE_MAPS_API_KEY_IOS ?? null;

    if (!apiKey) {
      console.warn(
        '[react-native-google-maps-plus] No iOS API key provided. Google Maps may fail to initialize.'
      );
    }
    if (apiKey) {
      conf.modResults.MAPS_API_KEY = apiKey;
    }
    return conf;
  });

  config = withPodfile(config, (conf) => {
    let src = conf.modResults.contents;
    if (!src.includes('use_modular_headers!')) {
      src = mergeContents({
        tag: 'react-native-google-maps-modular-headers',
        src,
        newSrc: 'use_modular_headers!',
        anchor: /use_frameworks!|platform\s+:ios.*/,
        offset: 1,
        comment: '#',
      }).contents;
    }

    // Resolve svgkit_patch.rb via Node at pod-install time (mirrors how the RN/Expo Podfile
    // resolves its own scripts). Robust to monorepos where node_modules is hoisted to a workspace
    // root — the old hardcoded '../node_modules/...' path only resolved for non-hoisted layouts.
    const podFilePatch = `  require File.join(File.dirname(\`node --print "require.resolve('react-native-google-maps-plus/package.json')"\`), 'scripts', 'svgkit_patch')\n  apply_svgkit_patch(installer)`;

    if (src.includes('post_install do |installer|')) {
      // Anchor on the post_install line via mergeContents instead of a non-greedy
      // /post_install ... ([\s\S]*?) end/ regex. The old regex stopped at the FIRST `end`, so when
      // another config plugin had already injected post_install content with a nested `if ... end`
      // block, apply_svgkit_patch was placed inside that block and never applied.
      src = mergeContents({
        tag: 'react-native-google-maps-svgkit-patch',
        src,
        newSrc: podFilePatch,
        anchor: /post_install do \|installer\|/,
        offset: 1,
        comment: '#',
      }).contents;
    } else {
      src += `\npost_install do |installer|\n${podFilePatch}\nend\n`;
    }

    conf.modResults.contents = src;
    return conf;
  });

  config = withAppDelegate(config, (conf) => {
    const { language } = conf.modResults;
    if (language !== 'swift') {
      console.warn(
        '[react-native-google-maps-plus] AppDelegate is not Swift; skipping GMSServices injection.'
      );
      return conf;
    }

    let src = conf.modResults.contents;

    if (!src.includes('import GoogleMaps')) {
      src = mergeContents({
        tag: 'react-native-google-maps-import',
        src,
        newSrc: 'import GoogleMaps',
        anchor: /^import React/m,
        offset: 1,
        comment: '//',
      }).contents;
    }

    const initSnippet = `
    if let apiKey = Bundle.main.object(forInfoDictionaryKey: "MAPS_API_KEY") as? String {
      GMSServices.provideAPIKey(apiKey)
    }`;

    try {
      src = mergeContents({
        tag: 'react-native-google-maps-init',
        src,
        newSrc: initSnippet,
        anchor:
          /return\s+super\.application\s*\(\s*application\s*,\s*didFinishLaunchingWithOptions:\s*launchOptions\s*\)/,
        offset: -1,
        comment: '//',
      }).contents;
    } catch (error: any) {
      if (error.code === 'ERR_NO_MATCH') {
        src = mergeContents({
          tag: 'react-native-google-maps-init',
          src,
          newSrc: initSnippet,
          anchor: /didFinishLaunchingWithOptions[^{]*\{/,
          offset: 1,
          comment: '//',
        }).contents;
      } else {
        throw error;
      }
    }

    conf.modResults.contents = src;
    return conf;
  });

  return config;
};

export default withIosGoogleMapsPlus;
