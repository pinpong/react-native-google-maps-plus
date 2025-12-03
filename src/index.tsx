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
 * Add this to your Podfile:
 *
 * ```ruby
 * post_install do |installer|
 *   react_native_post_install(
 *       installer,
 *       config[:reactNativePath],
 *       :mac_catalyst_enabled => false,
 *     )
 *
 *   require_relative '../node_modules/react-native-google-maps-plus/scripts/svgkit_patch'
 *   apply_svgkit_patch(installer)
 * end
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
 *
 * # Usage Example
 *
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
 * Check out the example app in the [example directory](https://github.com/pinpong/react-native-google-maps-plus/tree/main/example).
 */

import { GoogleMapsModule, GoogleMapsView } from './GoogleMapsPlus';

import type { RNGoogleMapsPlusModule } from './RNGoogleMapsPlusModule.nitro';
import type {
  RNGoogleMapsPlusViewMethods,
  RNGoogleMapsPlusViewProps,
} from './RNGoogleMapsPlusView.nitro';

export * from './types';

export type {
  RNGoogleMapsPlusViewMethods,
  RNGoogleMapsPlusViewProps,
  RNGoogleMapsPlusModule,
};

export { GoogleMapsView, GoogleMapsModule };
