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
 * `android-maps-utils` 7.x is built with Kotlin 2.4, so the app has to build
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
 * # Usage
 *
 * `GoogleMapsView` renders a map and `GoogleMapsStreetView` a Street View
 * panorama. Both are native views and take a `style` like any other view.
 *
 * ## Overlays
 *
 * Markers, polylines, polygons, circles, heatmaps, KML layers and URL tile
 * overlays are arrays of plain objects. Every item needs an `id` that stays
 * the same across renders: when an array changes, the view adds, updates and
 * removes items by `id`. Keep the arrays in state or memoize them, and pass a
 * new array to change something.
 *
 * ```tsx
 * const [markers, setMarkers] = useState<RNMarker[]>([
 *   {
 *     id: 'ferry-building',
 *     coordinate: { latitude: 37.7955, longitude: -122.3937 },
 *   },
 * ]);
 *
 * <GoogleMapsView style={{ flex: 1 }} markers={markers} />;
 * ```
 *
 * Markers without a `zIndex` overlap in no defined order. Give labels, cards
 * and a selected marker a higher `zIndex` than the rest. Marker icons are SVG
 * strings, see [SVG markers](#svg-markers).
 *
 * ## Initial options
 *
 * `mapOptions` and `panoramaOptions` are applied once, when the view is
 * created. Move the camera later with the methods below.
 *
 * ## Callbacks
 *
 * Nitro passes a function to a native view only when it is wrapped with
 * `callback()` from `react-native-nitro-modules`. Memoize the wrapped
 * function, so it is not created again on every render:
 *
 * ```tsx
 * import { callback } from 'react-native-nitro-modules';
 *
 * const onMarkerPress = useMemo(
 *   () => callback((id: string) => setSelectedId(id)),
 *   []
 * );
 *
 * <GoogleMapsView style={{ flex: 1 }} onMarkerPress={onMarkerPress} />;
 * ```
 *
 * ## Methods
 *
 * `hybridRef` passes the native view to a callback. Keep it in a ref and call
 * its methods, e.g. to move the camera:
 *
 * ```tsx
 * const map = useRef<GoogleMapsViewRef | null>(null);
 * const hybridRef = useMemo(
 *   () =>
 *     callback((ref: GoogleMapsViewRef) => {
 *       map.current = ref;
 *     }),
 *   []
 * );
 *
 * <GoogleMapsView style={{ flex: 1 }} hybridRef={hybridRef} />;
 *
 * map.current?.setCamera(
 *   { center: { latitude: 37.7955, longitude: -122.3937 }, zoom: 15 },
 *   true,
 *   600
 * );
 * ```
 *
 * The methods are listed under `RNGoogleMapsPlusViewMethods` and
 * `RNGoogleMapsPlusStreetViewMethods` in the API reference.
 *
 * ## Examples
 *
 * The [examples](https://pinpong.github.io/react-native-google-maps-plus/docs/examples)
 * show complete use cases with the code and screenshots on iOS and Android.
 * The example app in the repository runs them under **Docs Examples**.
 *
 * # Upgrading from 1.x
 *
 * ## React Native
 *
 * react-native 0.87.0 and react-native-nitro-modules 0.37.2 or newer are required.
 *
 * ## Props
 *
 * `initialProps` is now `mapOptions` on `GoogleMapsView` and `panoramaOptions`
 * on `GoogleMapsStreetView`. The types `RNInitialProps` and
 * `RNStreetViewInitialProps` are now `RNMapOptions` and `RNPanoramaOptions`.
 *
 * The type `RNKMLayer` is now `RNKmlLayer`. `onMyLocationButtonPress` is
 * called without arguments, the `pressed` argument was always `true`.
 *
 * ## Methods
 *
 * `animateToBounds` takes the padding as `RNMapPadding`, like
 * `setCameraToCoordinates`. Android now treats it as logical units instead of
 * pixels, and iOS now applies `durationMs`.
 *
 * On Android, `setCameraToCoordinates` adds its padding to `mapPadding` like iOS
 * does, instead of replacing it while the camera moves.
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
 * `android-maps-utils` 7.x needs Kotlin 2.3.0 or newer in the app, see
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
 * - `<image>` without `width` and `height` is drawn at the size of the image.
 *   Set both to scale it.
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
 * [lunasvg](https://github.com/sammycage/lunasvg) on iOS and Android, with
 * text shaped by [HarfBuzz](https://github.com/harfbuzz/harfbuzz) and
 * [SheenBidi](https://github.com/Tehreer/SheenBidi).
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
 *   a known `font-family` is drawn with the system font (iOS: SF, Android:
 *   Roboto).
 * - **Text:** text is shaped and ordered like native text, so Arabic, Hebrew,
 *   Indic, Thai, CJK and emoji are drawn correctly. Characters that no font of
 *   the `font-family` list covers are drawn with the fallback fonts of the
 *   platform, which differ between iOS and Android. For the same look on both,
 *   bundle a font that covers them and name it in `font-family`, e.g.
 *   `font-family="Roboto, Noto Sans Arabic"`. `xml:lang` and `lang` select
 *   language specific forms and fonts. `font-weight` 1 to 1000 selects the
 *   closest face or the instance of a variable font, missing bold and italic
 *   are synthesized.
 *
 * ## Text shaping
 *
 * Text shaping with HarfBuzz and SheenBidi makes an app about 0.7 MB larger per
 * ABI on Android and about 0.9 MB larger on iOS. Apps that only draw Latin text
 * in bundled fonts can turn it off. Without text shaping:
 *
 * - characters that the fonts of the `font-family` list do not cover are drawn
 *   as boxes on Android and as bars on iOS, there are no fallback fonts,
 * - Arabic is not joined and right-to-left text is not reordered,
 * - `font-weight` does not change the system fonts, bold text needs a bundled
 *   bold font.
 *
 * Android, in `android/gradle.properties`:
 *
 * ```properties
 * RNGoogleMapsPlus_svgTextShaping=false
 * ```
 *
 * iOS, at the top of the `Podfile`, then run `pod install`:
 *
 * ```ruby
 * ENV['RNGOOGLEMAPSPLUS_SVG_TEXT_SHAPING'] = '0'
 * ```
 *
 * Expo, in the plugin options:
 *
 * ```json
 * ["react-native-google-maps-plus", { "svgTextShaping": false }]
 * ```
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
 * ## Android: the map crashes with `NoClassDefFoundError: org/apache/http/ProtocolVersion`
 *
 * Devices with an old version of Google Play services draw the map with the
 * legacy renderer, which needs the Apache HTTP library. Apps that target
 * Android 9 or newer only get it when they declare it in the `<application>`
 * element of `AndroidManifest.xml`:
 *
 * ```xml
 * <uses-library android:name="org.apache.http.legacy" android:required="false" />
 * ```
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
 *   [issues](https://github.com/sammycage/lunasvg/issues). On iOS, text in
 *   fonts that only iOS can draw, like Apple Color Emoji and PingFang, is
 *   filled with a solid color and has no stroke, gradients and patterns fall
 *   back to black.
 * - **Advanced Markers:** not available with the legacy map renderer on
 *   Android. `onMapReady` reports the availability.
 * - **Heatmaps:** both platforms derive the color scale from the data, so the
 *   same points, `radius` and `gradient` look different. In a city view
 *   Android reached the last gradient color on most of the area, iOS stayed at
 *   the first colors. Android converts `radius` from dp to pixels and clamps
 *   it to 10 to 50 pixels. Tune `radius`, the weights and
 *   `gradient.startPoints` per platform, e.g. with `Platform.select`.
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
 *   HarfBuzz: https://github.com/harfbuzz/harfbuzz (Old MIT license)
 *   SheenBidi: https://github.com/Tehreer/SheenBidi (Apache License 2.0)
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
