import { NitroModules, getHostComponent } from 'react-native-nitro-modules';

import ViewConfig from '../nitrogen/generated/shared/json/RNGoogleMapsPlusViewConfig.json' with { type: 'json' };

import type { RNGoogleMapsPlusModule } from './RNGoogleMapsPlusModule.nitro.js';
import type {
  RNGoogleMapsPlusViewMethods,
  RNGoogleMapsPlusViewProps,
} from './RNGoogleMapsPlusView.nitro.js';

/**
 * Native Google Maps view.
 * Direct bindings to the underlying Google Maps SDKs.
 */
export const GoogleMapsView = getHostComponent<
  RNGoogleMapsPlusViewProps,
  RNGoogleMapsPlusViewMethods
>('RNGoogleMapsPlusView', () => ViewConfig);

/**
 * Platform-level module.
 * Exposes system APIs such as permissions and Play Services checks.
 */
export const GoogleMapsModule =
  NitroModules.createHybridObject<RNGoogleMapsPlusModule>(
    'RNGoogleMapsPlusModule'
  );
