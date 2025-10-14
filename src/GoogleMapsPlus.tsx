import { getHostComponent, NitroModules } from 'react-native-nitro-modules';

import ViewConfig from '../nitrogen/generated/shared/json/RNGoogleMapsPlusViewConfig.json';

import type {
  RNGoogleMapsPlusViewMethods,
  RNGoogleMapsPlusViewProps,
} from './RNGoogleMapsPlusView.nitro';

import type { RNGoogleMapsPlusModule } from './RNGoogleMapsPlusModule.nitro';

export const GoogleMapsView = getHostComponent<
  RNGoogleMapsPlusViewProps,
  RNGoogleMapsPlusViewMethods
>('RNGoogleMapsPlusView', () => ViewConfig);

export const GoogleMapsModule =
  NitroModules.createHybridObject<RNGoogleMapsPlusModule>(
    'RNGoogleMapsPlusModule'
  );
