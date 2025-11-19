import { type HybridObject } from 'react-native-nitro-modules';

import type { RNLocationPermissionResult } from './types';

export interface RNGoogleMapsPlusModule
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  showLocationDialog(): void;

  openLocationSettings(): void;

  requestLocationPermission(): Promise<RNLocationPermissionResult>;

  isGooglePlayServicesAvailable(): boolean;
}
