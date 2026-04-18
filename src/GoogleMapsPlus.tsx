import { NitroModules, getHostComponent } from 'react-native-nitro-modules';

import StreetViewConfig from '../nitrogen/generated/shared/json/RNGoogleMapsPlusStreetViewConfig.json' with { type: 'json' };
import MapViewConfig from '../nitrogen/generated/shared/json/RNGoogleMapsPlusViewConfig.json' with { type: 'json' };

import type { RNGoogleMapsPlusModule } from './RNGoogleMapsPlusModule.nitro.js';
import type {
  RNGoogleMapsPlusStreetViewMethods,
  RNGoogleMapsPlusStreetViewProps,
} from './RNGoogleMapsPlusStreetView.nitro';
import type {
  RNGoogleMapsPlusViewMethods,
  RNGoogleMapsPlusViewProps,
} from './RNGoogleMapsPlusView.nitro.js';

/**
 * Native Google Maps view.
 * Uses the native Google Maps SDKs on Android and iOS.
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
 */
export const GoogleMapsView = getHostComponent<
  RNGoogleMapsPlusViewProps,
  RNGoogleMapsPlusViewMethods
>('RNGoogleMapsPlusView', () => MapViewConfig);

/**
 * Native Google Maps Street View component.
 * Uses the native Google Maps SDKs on Android and iOS.
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
 */
export const GoogleMapsStreetView = getHostComponent<
  RNGoogleMapsPlusStreetViewProps,
  RNGoogleMapsPlusStreetViewMethods
>('RNGoogleMapsPlusStreetView', () => StreetViewConfig);

/**
 * Platform module.
 * Exposes system APIs such as location permissions, location settings, and Play Services checks.
 */
export const GoogleMapsModule =
  NitroModules.createHybridObject<RNGoogleMapsPlusModule>(
    'RNGoogleMapsPlusModule'
  );
