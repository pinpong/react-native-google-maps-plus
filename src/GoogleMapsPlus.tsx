import { getHostComponent, NitroModules } from 'react-native-nitro-modules';

import ViewConfig from '../nitrogen/generated/shared/json/RNGoogleMapsPlusViewConfig.json' with { type: 'json' };

import type {
  RNGoogleMapsPlusViewMethods,
  RNGoogleMapsPlusViewProps,
} from './RNGoogleMapsPlusView.nitro.js';

import type { RNGoogleMapsPlusModule } from './RNGoogleMapsPlusModule.nitro.js';

export const GoogleMapsView = getHostComponent<
  RNGoogleMapsPlusViewProps,
  RNGoogleMapsPlusViewMethods
>('RNGoogleMapsPlusView', () => ViewConfig);

export const GoogleMapsModule =
  NitroModules.createHybridObject<RNGoogleMapsPlusModule>(
    'RNGoogleMapsPlusModule'
  );
