import type {
  RNLatLng,
  RNLocation,
  RNLocationErrorCode,
  RNLocationPermissionResult,
  RNMapErrorCode,
  RNStreetViewCamera,
  RNStreetViewInitialProps,
  RNStreetViewOrientation,
  RNStreetViewPanoramaLocation,
  RNStreetViewSource,
  RNStreetViewUiSettings,
} from './types';
import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules';

/**
 * Native Google Maps Street View props.
 */
export interface RNGoogleMapsPlusStreetViewProps extends HybridViewProps {
  /** Initial panorama configuration. See {@link RNStreetViewInitialProps}. */
  initialProps?: RNStreetViewInitialProps;

  /** UI and gesture settings. See {@link RNStreetViewUiSettings}. */
  uiSettings?: RNStreetViewUiSettings;

  /**
   * Panorama is initialized and ready to use.
   * Android: `false` if the Maps SDK could not be initialized, e.g. Play Services
   * missing or outdated. Fires again with `true` once the user has resolved it.
   */
  onPanoramaReady?: (ready: boolean) => void;

  /** Location update. */
  onLocationUpdate?: (location: RNLocation) => void;

  /** Location subsystem error. */
  onLocationError?: (error: RNLocationErrorCode) => void;

  /**
   * User or programmatic navigation moved to a new panorama.
   * Provides full location info including panoramaId and adjacent links.
   */
  onPanoramaChange?: (location: RNStreetViewPanoramaLocation) => void;

  /**
   * Camera orientation changed.
   * Fires continuously while the user rotates or tilts the view.
   */
  onCameraChange?: (camera: RNStreetViewCamera) => void;

  /**
   * Tap on the panorama.
   * Orientation indicates where on the sphere the user tapped.
   */
  onPanoramaPress?: (orientation: RNStreetViewOrientation) => void;

  /** Native error. See {@link RNMapErrorCode}. */
  onPanoramaError?: (error: RNMapErrorCode, msg: string) => void;
}

/**
 * Imperative Street View methods.
 */
export interface RNGoogleMapsPlusStreetViewMethods extends HybridViewMethods {
  /**
   * Sets the Street View camera orientation.
   *
   * @param camera - Target bearing, tilt, and zoom.
   * @param animated - Whether to animate.
   * @defaultValue `false`
   * @param durationMs - Animation duration in milliseconds.
   * @defaultValue `3000`
   */
  setCamera(
    camera: RNStreetViewCamera,
    animated?: boolean,
    durationMs?: number
  ): void;

  /**
   * Navigates to a panorama near the given position.
   * Use this for post initialization navigation with full control over the search.
   *
   * @param position - Target coordinate used to search for a Street View panorama. See {@link RNLatLng}.
   * @param radius - Search radius in meters.
   * @defaultValue `50`
   * @param source - Panorama source filter.
   * @defaultValue `'default'`
   */
  setPosition(
    position: RNLatLng,
    radius?: number,
    source?: RNStreetViewSource
  ): void;

  /**
   * Navigates to a specific panorama by its ID.
   *
   * @param panoramaId - Street View panorama identifier.
   */
  setPositionById(panoramaId: string): void;

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
   * @returns The permission result per platform. See {@link RNLocationPermissionResult}.
   */
  requestLocationPermission(): Promise<RNLocationPermissionResult>;

  /**
   * Checks Google Play Services availability.
   * iOS: always returns `false`.
   * Android: performs a real system check.
   * Returns `false` for outdated, disabled or updating Play Services.
   * The panorama view is still created, so the Maps SDK can show its own error UI.
   * @returns `true` if Google Play Services are available, otherwise `false`.
   */
  isGooglePlayServicesAvailable(): boolean;
}

/** Typed hybrid Street View. */
export type RNGoogleMapsPlusStreetView = HybridView<
  RNGoogleMapsPlusStreetViewProps,
  RNGoogleMapsPlusStreetViewMethods
>;
