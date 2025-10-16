import {
  withInfoPlist,
  withPodfile,
  withAppDelegate,
  type ConfigPlugin,
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

    const patchSnippet = `
  # Force iOS 16+ to avoid deployment target warnings
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '16.0'
    end
  end

  # --- SVGKit Patch ---
  require 'fileutils'
  svgkit_path = File.join(installer.sandbox.pod_dir('SVGKit'), 'Source')

  # --- Patch Node.h imports ---
  Dir.glob(File.join(svgkit_path, '**', '*.{h,m}')).each do |file|
    FileUtils.chmod("u+w", file)
    text = File.read(file)
    new_contents = text.gsub('#import "Node.h"', '#import "SVGKit/Node.h"')
    File.open(file, 'w') { |f| f.write(new_contents) }
  end

  # --- Patch CSSValue.h imports ---
  Dir.glob(File.join(svgkit_path, '**', '*.{h,m}')).each do |file|
    FileUtils.chmod("u+w", file)
    text = File.read(file)
    new_contents = text.gsub('#import "CSSValue.h"', '#import "SVGKit/CSSValue.h"')
    File.open(file, 'w') { |f| f.write(new_contents) }
  end

  # --- Patch SVGLength.h imports ---
  Dir.glob(File.join(svgkit_path, '**', '*.{h,m}')).each do |file|
    FileUtils.chmod("u+w", file)
    text = File.read(file)
    new_contents = text.gsub('#import "SVGLength.h"', '#import "SVGKit/SVGLength.h"')
    File.open(file, 'w') { |f| f.write(new_contents) }
  end
  `;

    if (src.includes('post_install do |installer|')) {
      src = src.replace(
        /post_install do \|installer\|([\s\S]*?)end/,
        (match, inner) => {
          if (inner.includes('SVGKit Patch')) return match; // idempotent
          return `post_install do |installer|${inner}\n${patchSnippet}\nend`;
        }
      );
    } else {
      src += `\npost_install do |installer|\n${patchSnippet}\nend\n`;
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
