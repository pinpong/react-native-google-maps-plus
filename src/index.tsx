/**
 * @packageDocumentation
 *
 * # Installation
 *
 * `react-native-nitro-modules` is required as this library relies on Nitro Modules.
 *
 * ```sh
 * yarn add react-native-google-maps-plus react-native-nitro-modules
 * ```
 *
 * ## iOS Setup (Bare RN only)
 *
 * The native iOS dependencies (GoogleMaps, GoogleMapsUtils, SVGKit) are
 * integrated via Swift Package Manager automatically during `pod install`.
 *
 * ### Install the pods as frameworks
 *
 * Swift packages require the pods to be installed as frameworks, so add
 * `use_frameworks!` to your `Podfile`. React Native recommends dynamic
 * linking, static linking also works if another dependency requires it:
 *
 * ```ruby
 * platform :ios, 16.0
 * prepare_react_native_project!
 *
 * use_frameworks! :linkage => :dynamic
 * ```
 *
 * React Native does not call `use_frameworks!` on its own, so setting the
 * `USE_FRAMEWORKS` environment variable alone is not enough. The example app
 * reads that variable to make the linkage switchable:
 *
 * ```ruby
 * ENV['USE_FRAMEWORKS'] ||= 'dynamic'
 * use_frameworks! :linkage => ENV['USE_FRAMEWORKS'].to_sym
 * ```
 *
 * ### Configure the API key
 *
 * Add your API key to `Info.plist` and hand it to the SDK in your
 * `AppDelegate`, before the first map or Street View is created. Reading it
 * from `Info.plist` keeps the key out of your sources:
 *
 * ```xml
 * <key>MAPS_API_KEY</key>
 * <string>YOUR_IOS_MAPS_API_KEY</string>
 * ```
 *
 * ```swift
 * import GoogleMaps
 *
 * if let apiKey = Bundle.main.object(forInfoDictionaryKey: "MAPS_API_KEY") as? String {
 *   GMSServices.provideAPIKey(apiKey)
 * }
 * ```
 *
 * The Google Maps SDK raises an unrecoverable Objective-C exception when a map
 * is created without a valid key. That happens inside the SDK and is not
 * reported through `onMapError`, unlike on Android.
 *
 * ### Upgrading from a CocoaPods based version
 *
 * Remove the svgkit patch from your `Podfile`. The script no longer ships with
 * the package and `pod install` fails on the missing require:
 *
 * ```ruby
 * require_relative '../node_modules/react-native-google-maps-plus/scripts/svgkit_patch'
 * apply_svgkit_patch(installer)
 * ```
 *
 * ## Expo Setup
 *
 * Add your keys via the config plugin:
 *
 * ```json
 * {
 *   "expo": {
 *     "plugins": [
 *       [
 *         "react-native-google-maps-plus",
 *         {
 *           "googleMapsAndroidApiKey": "YOUR_ANDROID_MAPS_API_KEY",
 *           "googleMapsIosApiKey": "YOUR_IOS_MAPS_API_KEY"
 *         }
 *       ]
 *     ]
 *   }
 * }
 * ```
 *
 * On iOS the plugin writes the key to `Info.plist` and adds the matching
 * `GMSServices.provideAPIKey` call to the `AppDelegate`, so no manual setup is
 * needed. It also sets `ios.useFrameworks` to `dynamic` in
 * `Podfile.properties.json`, because the native iOS dependencies are Swift
 * packages. Set `ios.useFrameworks` yourself (e.g. via `expo-build-properties`)
 * if you need `static`, the plugin keeps that value.
 *
 * When upgrading from a CocoaPods based version, the plugin removes the svgkit
 * patch it generated into the `Podfile` before. Nothing has to be removed by
 * hand.
 *
 * # API Keys
 *
 * You need a valid Google Maps API key.
 *
 * Android Guide:
 * https://developers.google.com/maps/documentation/android-sdk/config
 *
 * iOS Guide:
 * https://developers.google.com/maps/documentation/ios-sdk/config
 *
 *
 * # Native Dependencies
 *
 * - iOS Google Maps SDK
 *   https://developers.google.com/maps/documentation/ios-sdk
 *
 * - Android Google Maps SDK
 *   https://developers.google.com/maps/documentation/android-sdk
 *
 * - SVG Rendering
 *   iOS: SVGKit
 *   Android: AndroidSVG
 *
 * The iOS SDKs are resolved via Swift Package Manager, so CocoaPods can no
 * longer deduplicate them against a `GoogleMaps` pod that another library pulls
 * in (e.g. react-native-maps, expo-maps or GooglePlaces). Such a setup ends up
 * with two copies of the SDK in the app, of which only one is configured by
 * `GMSServices.provideAPIKey`.
 *
 *
 * @example Map View
 * ```tsx
 * <GoogleMapsView
 *   style={{ flex: 1 }}
 *   initialProps={{
 *     camera: {
 *       center: { latitude: 37.7749, longitude: -122.4194 },
 *       zoom: 12,
 *     },
 *   }}
 * />
 * ```
 *
 * @example Street View
 * ```tsx
 * <GoogleMapsStreetView
 *   style={{ flex: 1 }}
 *   initialProps={{
 *     position: { latitude: 37.8090233, longitude: -122.4742005 },
 *     camera: { bearing: 315, tilt: 0, zoom: 0 },
 *   }}
 * />
 * ```
 *
 * Check out the example app in the [example directory](https://github.com/pinpong/react-native-google-maps-plus/tree/main/example).
 */

import {
  GoogleMapsModule,
  GoogleMapsView,
  GoogleMapsStreetView,
} from './GoogleMapsPlus';

import type { RNGoogleMapsPlusModule } from './RNGoogleMapsPlusModule.nitro';
import type {
  RNGoogleMapsPlusStreetViewMethods,
  RNGoogleMapsPlusStreetViewProps,
} from './RNGoogleMapsPlusStreetView.nitro';
import type {
  RNGoogleMapsPlusViewMethods,
  RNGoogleMapsPlusViewProps,
} from './RNGoogleMapsPlusView.nitro';

export * from './types';

export type {
  RNGoogleMapsPlusViewMethods,
  RNGoogleMapsPlusViewProps,
  RNGoogleMapsPlusStreetViewMethods,
  RNGoogleMapsPlusStreetViewProps,
  RNGoogleMapsPlusModule,
};

export { GoogleMapsView, GoogleMapsStreetView, GoogleMapsModule };
