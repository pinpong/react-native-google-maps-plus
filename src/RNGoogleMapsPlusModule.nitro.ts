import type { RNLocationPermissionResult } from './types';
import type { HybridObject } from 'react-native-nitro-modules';

/**
 * Platform utilities for react-native-google-maps-plus.
 * Provides system operations unrelated to a specific map instance.
 */
export interface RNGoogleMapsPlusModule extends HybridObject<{
  ios: 'swift';
  android: 'kotlin';
}> {
  /** Shows a native system dialog prompting the user to enable location services. */
  showLocationDialog(): void;

  /**
   * Opens the OS location settings.
   *
   * iOS: opens the app settings.
   * Android: opens system location settings.
   */
  openLocationSettings(): void;

  /**
   * Requests runtime location permission.
   *
   * @returns The permission result per platform. See {@link RNLocationPermissionResult}.
   */
  requestLocationPermission(): Promise<RNLocationPermissionResult>;

  /**
   * Checks Google Play Services availability.
   *
   * iOS: always returns `false`.
   * Android: performs a real system check.
   *
   * @returns `true` if Google Play Services are available, otherwise `false`.
   */
  isGooglePlayServicesAvailable(): boolean;
}
