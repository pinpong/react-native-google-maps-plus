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
 * The native iOS dependencies (GoogleMaps, GoogleMapsUtils) are
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
 * ## Android Setup (Bare RN only)
 *
 * `android-maps-utils` 6.x is built with Kotlin 2.4, so the app has to build
 * with Kotlin 2.3.0 or newer. React Native 0.88 defaults to 2.2.0 and fails
 * the build with an "incompatible version of Kotlin" error.
 *
 * Set the version in `android/build.gradle`:
 *
 * ```groovy
 * buildscript {
 *   ext {
 *     kotlinVersion = "2.3.0"
 *   }
 *   dependencies {
 *     classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
 *   }
 * }
 * ```
 *
 * Setting `ext.kotlinVersion` alone is not enough. React Native resolves the
 * Kotlin Gradle plugin through its own version catalog, so the classpath entry
 * has to be pinned explicitly.
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
 * On iOS the plugin writes the key to `Info.plist` and adds the
 * `GMSServices.provideAPIKey` call to the `AppDelegate`. It also sets
 * `ios.useFrameworks` to `dynamic` in `Podfile.properties.json`. Set
 * `ios.useFrameworks` yourself with `expo-build-properties` if you need
 * `static`, the plugin keeps that value.
 *
 * The Kotlin requirement from the Android setup applies here as well. Expo
 * generates the Android project, so set the version through
 * `expo-build-properties`:
 *
 * ```json
 * {
 *   "expo": {
 *     "plugins": [
 *       [
 *         "expo-build-properties",
 *         {
 *           "android": {
 *             "kotlinVersion": "2.3.0"
 *           }
 *         }
 *       ]
 *     ]
 *   }
 * }
 * ```
 *
 * # Upgrading from 1.x
 *
 * ## React Native
 *
 * react-native 0.87.0 or newer is required.
 *
 * ## Props
 *
 * `initialProps` is now `mapOptions` on `GoogleMapsView` and `panoramaOptions`
 * on `GoogleMapsStreetView`. The types `RNInitialProps` and
 * `RNStreetViewInitialProps` are now `RNMapOptions` and `RNPanoramaOptions`.
 *
 * ## Location updates
 *
 * Location updates used to run for every view. They are off by default now.
 * Set `locationConfig={{ enabled: true }}` if you use the location callbacks
 * without `myLocationEnabled`.
 *
 * Android reports an unknown `bearing` and `speed` as `-1` instead of `0`.
 *
 * ## iOS
 *
 * The native dependencies are Swift packages now and SVGKit is no longer used.
 * Install the pods as frameworks, see
 * [iOS Setup](#install-the-pods-as-frameworks), and remove the svgkit patch
 * from your `Podfile`. The script no longer ships with the package and
 * `pod install` fails on the missing require:
 *
 * ```ruby
 * require_relative '../node_modules/react-native-google-maps-plus/scripts/svgkit_patch'
 * apply_svgkit_patch(installer)
 * ```
 *
 * Expo: the config plugin sets `ios.useFrameworks` and removes the patch it
 * generated before.
 *
 * ## Android
 *
 * `android-maps-utils` 6.x needs Kotlin 2.3.0 or newer in the app, see
 * [Android Setup](#android-setup-bare-rn-only). Expo: set `kotlinVersion`
 * through `expo-build-properties`, see [Expo Setup](#expo-setup).
 *
 * ## SVG rendering
 *
 * `iconSvg` and `infoWindowIconSvg` are rendered by lunasvg instead of
 * androidsvg and SVGKit. An SVG can look different than before, check your
 * markers:
 *
 * - `dominant-baseline` is applied. Manual `y` offsets that compensated for it
 *   shift the text now.
 * - Trailing whitespace inside `<text>` shifts centered text to the left.
 *   Write `<text>label</text>` without whitespace around the label.
 * - Raster images in `<image>` are not resampled smoothly. Provide them in
 *   device resolution.
 *
 * See [SVG markers](#svg-markers) and [Limitations](#limitations).
 *
 * # Location
 *
 * Location updates are off by default. They run while `myLocationEnabled` or
 * `locationConfig.enabled` is set and the view is visible, and stop in
 * background. `onLocationUpdate`, `onLocationError`, `onLocationStatusChange`
 * and `onHeadingUpdate` only fire while they run.
 *
 * `getLocationPermission` and `requestLocationPermission` work independently
 * of that.
 *
 * iOS: the blue dot is drawn by the Maps SDK with its own location manager.
 * `locationConfig` does not affect it, and the SDK asks for the location
 * permission as soon as `myLocationEnabled` is set.
 *
 * # SVG markers
 *
 * `iconSvg` and `infoWindowIconSvg` are rendered by
 * [lunasvg](https://github.com/sammycage/lunasvg) on iOS and Android.
 *
 * - **Size:** the SVG is fitted into `width` x `height` and centered. It keeps
 *   its aspect ratio.
 * - **Images:** `<image>` may reference PNG, JPEG, GIF, BMP and SVG data URIs
 *   and http(s) URLs. Remote images are limited to 8 MB each and cached in
 *   memory. Provide raster images in device resolution, e.g. 192 px wide for a
 *   64 pt marker on a 3x screen. Large photos cost a lot of memory, because
 *   every `<image>` keeps its decoded bitmap.
 * - **Info windows:** remote images are loaded when the marker is added. Until
 *   an image is there, its `<image>` draws nothing, so a shape placed
 *   underneath works as a placeholder.
 * - **Fonts:** the system fonts and the fonts bundled with the app (Android:
 *   `assets/fonts`, iOS: `UIAppFonts`). A bundled font is found by its file
 *   name without extension, e.g. `font-family="Roboto-Bold"`, and by the
 *   family it declares, e.g. `font-family="Roboto" font-weight="bold"`. Fonts
 *   registered at runtime, e.g. with `expo-font`, are not found. Text without
 *   a known `font-family` is drawn with the system font on Android and with
 *   Arial on iOS.
 *
 * For the known limitations see [Limitations](#limitations).
 *
 * # Advanced markers
 *
 * A marker with `advancedOptions` is rendered as an Advanced Marker
 * ([Android](https://developers.google.com/maps/documentation/android-sdk/advanced-markers/overview),
 * [iOS](https://developers.google.com/maps/documentation/ios-sdk/advanced-markers/overview)).
 *
 * - **Map ID:** set `mapOptions.mapId`. `DEMO_MAP_ID` works for testing.
 * - **Availability:** `onMapReady` reports whether Advanced Markers are
 *   available, `onMapCapabilitiesChange` reports a later change. While they
 *   are not available, the marker is rendered as a standard marker and
 *   `pinConfig` has no effect.
 * - **Collision behavior:** `collisionBehavior` decides whether the marker
 *   hides other markers and map labels or is hidden by them. A change
 *   re-creates the marker.
 * - **Pin:** `pinConfig` sets the background, border and glyph of the default
 *   pin. The glyph is one of `iconSvg`, `text` or `color`, in that order.
 * - **Icon:** `iconSvg` takes precedence over `pinConfig`. An SVG that fails to
 *   render leaves the icon empty, the pin is not used as a fallback.
 *
 * Not available with the legacy map renderer on Android, see
 * [Limitations](#limitations).
 *
 * # Troubleshooting
 *
 * ## Android: "was compiled with an incompatible version of Kotlin"
 *
 * The app builds with a Kotlin version older than 2.3.0. See
 * [Android Setup](#android-setup-bare-rn-only).
 *
 * ## iOS: `pod install` fails with "cannot load such file" for `svgkit_patch`
 *
 * The `Podfile` still contains the svgkit patch from 1.x. Remove it, see
 * [Upgrading from 1.x](#ios).
 *
 * ## iOS: the app terminates when the first map is created
 *
 * The Maps SDK has no valid key, either because `GMSServices.provideAPIKey`
 * was not called before the map was created or because the app contains a
 * second copy of the SDK. See [Configure the API key](#configure-the-api-key)
 * and [Native Dependencies](#native-dependencies).
 *
 * ## iOS: `import RNGoogleMapsPlus` fails in the app
 *
 * The module has no public Swift API, its headers belong to the Nitro bridge.
 * Import `GoogleMaps` directly for `GMSServices`.
 *
 * # Limitations
 *
 * - **SVG markers:** an SVG with a `viewBox` and only one of `width` and
 *   `height` is not drawn. Fonts registered at runtime, e.g. with `expo-font`,
 *   are not found. Supported features and known rendering issues: lunasvg's
 *   [feature list](https://github.com/sammycage/lunasvg#features) and
 *   [issues](https://github.com/sammycage/lunasvg/issues).
 * - **Advanced Markers:** not available with the legacy map renderer on
 *   Android. `onMapReady` reports the availability.
 * - **Lite mode:** Android ignores `userInterfaceStyle` in `liteMode`, the map
 *   stays light.
 * - **Heading:** reported for portrait orientation only. iOS keeps delivering
 *   headings while the location permission is denied, Android stops.
 *   `GoogleMapsStreetView` accepts `locationConfig.heading` but has no
 *   `onHeadingUpdate`.
 * - **Location status:** the same status can be reported more than once, e.g.
 *   twice when the view is mounted.
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
 * - SVG Rendering (bundled, iOS + Android)
 *   lunasvg: https://github.com/sammycage/lunasvg
 *   plutovg: https://github.com/sammycage/plutovg
 *
 * plutovg contains code from FreeType under the FreeType License. Apps that
 * ship this library have to include this notice in their documentation:
 * "Portions of this software are copyright © 2014 The FreeType Project
 * (www.freetype.org). All rights reserved."
 *
 * The iOS SDKs are resolved via Swift Package Manager, so CocoaPods can no
 * longer deduplicate them against a `GoogleMaps` pod that another library pulls
 * in, such as react-native-maps, expo-maps or GooglePlaces. Such a setup ends up
 * with two copies of the SDK in the app, of which only one is configured by
 * `GMSServices.provideAPIKey`.
 *
 *
 * @example Map View
 * ```tsx
 * <GoogleMapsView
 *   style={{ flex: 1 }}
 *   mapOptions={{
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
 *   panoramaOptions={{
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
