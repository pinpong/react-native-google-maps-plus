import type {
  RNCamera,
  RNCameraUpdate,
  RNCircle,
  RNHeatmap,
  RNIndoorBuilding,
  RNIndoorLevel,
  RNInitialProps,
  RNKMLayer,
  RNLatLng,
  RNLatLngBounds,
  RNLocation,
  RNLocationConfig,
  RNLocationErrorCode,
  RNLocationPermissionResult,
  RNMapErrorCode,
  RNMapPadding,
  RNMapType,
  RNMapUiSettings,
  RNMapZoomConfig,
  RNMarker,
  RNPolygon,
  RNPolyline,
  RNRegion,
  RNSnapshotOptions,
  RNUrlTileOverlay,
  RNUserInterfaceStyle,
} from './types';
import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules';

/**
 * Native Google Maps view props.
 * Direct mapping to Google Maps SDK for Android/iOS.
 * Platform differences remain unless explicitly aligned.
 */
export interface RNGoogleMapsPlusViewProps extends HybridViewProps {
  /** Initial map configuration. See {@link RNInitialProps}. */
  initialProps?: RNInitialProps;

  /** UI and gesture settings. See {@link RNMapUiSettings}. */
  uiSettings?: RNMapUiSettings;

  /**
   * Enables "My Location" blue dot.
   * @defaultValue `false`
   */
  myLocationEnabled?: boolean;

  /**
   * Enables 3D buildings.
   * @defaultValue `false`
   */
  buildingEnabled?: boolean;

  /**
   * Enables traffic layer.
   * @defaultValue `false`
   */
  trafficEnabled?: boolean;

  /**
   * Enables indoor maps.
   * @defaultValue `false`
   */
  indoorEnabled?: boolean;

  /**
   * Enables transit layer.
   * @defaultValue `false`
   */
  transitEnabled?: boolean;

  /**
   * JSON map style string.
   * Must be a Google Maps StyleSpec JSON.
   */
  customMapStyle?: string;

  /** Overrides OS UI mode. See {@link RNUserInterfaceStyle}. */
  userInterfaceStyle?: RNUserInterfaceStyle;

  /** Zoom range. See {@link RNMapZoomConfig}. */
  mapZoomConfig?: RNMapZoomConfig;

  /** Map padding. See {@link RNMapPadding}. */
  mapPadding?: RNMapPadding;

  /**
   * Base map type.
   * @defaultValue `'normal'`
   * See {@link RNMapType}.
   */
  mapType?: RNMapType;

  /** Markers. See {@link RNMarker}. */
  markers?: RNMarker[];

  /** Polygons. See {@link RNPolygon}. */
  polygons?: RNPolygon[];

  /** Polylines. See {@link RNPolyline}. */
  polylines?: RNPolyline[];

  /** Circles. See {@link RNCircle}. */
  circles?: RNCircle[];

  /** Heatmaps. See {@link RNHeatmap}. */
  heatmaps?: RNHeatmap[];

  /** KML layers. See {@link RNKMLayer}. */
  kmlLayers?: RNKMLayer[];

  /** URL tile overlays. See {@link RNUrlTileOverlay}. */
  urlTileOverlays?: RNUrlTileOverlay[];

  /** Location subsystem config. See {@link RNLocationConfig}. */
  locationConfig?: RNLocationConfig;

  /** Map errors. */
  onMapError?: (error: RNMapErrorCode, msg: string) => void;

  /** Native map instance created. */
  onMapReady?: (ready: boolean) => void;

  /** First frame rendered. */
  onMapLoaded?: (region: RNRegion, camera: RNCamera) => void;

  /** Location update. */
  onLocationUpdate?: (location: RNLocation) => void;

  /** Location subsystem error. */
  onLocationError?: (error: RNLocationErrorCode) => void;

  /** Tap on map. */
  onMapPress?: (coordinate: RNLatLng) => void;

  /** Long-press on map. */
  onMapLongPress?: (coordinate: RNLatLng) => void;

  /** Tap on POI. */
  onPoiPress?: (placeId: string, name: string, coordinate: RNLatLng) => void;

  /** Tap on marker. */
  onMarkerPress?: (id: string) => void;

  /** Tap on polyline. */
  onPolylinePress?: (id: string) => void;

  /** Tap on polygon. */
  onPolygonPress?: (id: string) => void;

  /** Tap on circle. */
  onCirclePress?: (id: string) => void;

  /** Marker drag start. */
  onMarkerDragStart?: (id: string, location: RNLatLng) => void;

  /** Marker drag update. */
  onMarkerDrag?: (id: string, location: RNLatLng) => void;

  /** Marker drag end. */
  onMarkerDragEnd?: (id: string, location: RNLatLng) => void;

  /** Indoor building focused. */
  onIndoorBuildingFocused?: (building: RNIndoorBuilding) => void;

  /** Indoor level activated. */
  onIndoorLevelActivated?: (level: RNIndoorLevel) => void;

  /** Info window tap. */
  onInfoWindowPress?: (id: string) => void;

  /** Info window closed. */
  onInfoWindowClose?: (id: string) => void;

  /** Info window long-press. */
  onInfoWindowLongPress?: (id: string) => void;

  /** Tap on the blue My-Location indicator. */
  onMyLocationPress?: (location: RNLocation) => void;

  /** Tap on the My-Location button. */
  onMyLocationButtonPress?: (pressed: boolean) => void;

  /** Camera move started. */
  onCameraChangeStart?: (
    region: RNRegion,
    camera: RNCamera,
    isGesture: boolean
  ) => void;

  /** Camera moving. */
  onCameraChange?: (
    region: RNRegion,
    camera: RNCamera,
    isGesture: boolean
  ) => void;

  /** Camera idle. */
  onCameraChangeComplete?: (
    region: RNRegion,
    camera: RNCamera,
    isGesture: boolean
  ) => void;
}

/**
 * Imperative Google Maps methods.
 * Direct calls into native Google Maps SDK.
 */
export interface RNGoogleMapsPlusViewMethods extends HybridViewMethods {
  /**
   * Shows the info window for a marker.
   *
   * @param id - Marker identifier.
   */
  showMarkerInfoWindow(id: string): void;

  /**
   * Hides the info window for a marker.
   *
   * @param id - Marker identifier.
   */
  hideMarkerInfoWindow(id: string): void;

  /**
   * Sets the camera.
   *
   * iOS: adds an explicit animation phase for parity.
   * Android: uses native timing.
   *
   * @param camera - Target camera update. See {@link RNCameraUpdate}.
   * @param animated - Whether to animate.
   * @defaultValue `false`
   * @param durationMs - Animation duration in milliseconds.
   * @defaultValue `3000`
   */
  setCamera(
    camera: RNCameraUpdate,
    animated?: boolean,
    durationMs?: number
  ): void;

  /**
   * Fits the camera to the given coordinates.
   *
   * iOS: adds an explicit animation phase for parity.
   * Android: uses native timing.
   *
   * @param coordinates - Coordinates the camera should fit.
   * @param padding - Padding around the fitted area. See {@link RNMapPadding}.
   * @param animated - Whether to animate.
   * @defaultValue `false`
   * @param durationMs - Animation duration in milliseconds.
   * @defaultValue `3000`
   */
  setCameraToCoordinates(
    coordinates: RNLatLng[],
    padding?: RNMapPadding,
    animated?: boolean,
    durationMs?: number
  ): void;

  /**
   * Restricts the camera target bounds.
   * Pass `undefined` to clear the restriction.
   *
   * @param bounds - Bounds to restrict the camera target to. See {@link RNLatLngBounds}.
   */
  setCameraBounds(bounds?: RNLatLngBounds): void;

  /**
   * Animates the camera to fit the given bounds.
   *
   * iOS: adds an explicit animation phase for parity.
   * Android: uses native timing.
   *
   * @param bounds - Target bounds the camera should fit. See {@link RNLatLngBounds}.
   * @param padding - Padding in logical units.
   * @defaultValue `0`
   * @param durationMs - Animation duration in milliseconds.
   * @defaultValue `3000`
   * @param lockBounds - Restricts the camera to these bounds after animating.
   * @defaultValue `false`
   */
  animateToBounds(
    bounds: RNLatLngBounds,
    padding?: number,
    durationMs?: number,
    lockBounds?: boolean
  ): void;

  /**
   * Captures a snapshot of the current map frame.
   *
   * @param options - Snapshot output configuration. See {@link RNSnapshotOptions}.
   * @returns Base64 string or file URI, depending on {@link RNSnapshotOptions.resultType}.
   */
  snapshot(options: RNSnapshotOptions): Promise<string | undefined>;

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
   * @returns `true` if Google Play Services are available, otherwise `false`.
   */
  isGooglePlayServicesAvailable(): boolean;
}

/** Typed hybrid Google Maps view. */
export type RNGoogleMapsPlusView = HybridView<
  RNGoogleMapsPlusViewProps,
  RNGoogleMapsPlusViewMethods
>;
