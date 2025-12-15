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

  /** Enables "My Location" blue dot. */
  myLocationEnabled?: boolean;

  /** Enables 3D buildings. */
  buildingEnabled?: boolean;

  /** Enables traffic layer. */
  trafficEnabled?: boolean;

  /** Enables indoor maps. */
  indoorEnabled?: boolean;

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

  /** Base map type. See {@link RNMapType}. */
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

  /** Map SDK error. */
  onMapError?: (error: RNMapErrorCode) => void;

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
  showMarkerInfoWindow(id: string): void;
  hideMarkerInfoWindow(id: string): void;

  /**
   * Sets the camera.
   * iOS: adds an explicit animation phase for parity.
   * Android: uses native timing.
   */
  setCamera(
    camera: RNCameraUpdate,
    animated?: boolean,
    durationMs?: number
  ): void;

  /**
   * Fits the camera to the given coordinates.
   * iOS: adds an explicit animation phase for parity.
   * Android: uses native timing.
   */
  setCameraToCoordinates(
    coordinates: RNLatLng[],
    padding?: RNMapPadding,
    animated?: boolean,
    durationMs?: number
  ): void;

  /** Restricts camera target bounds. */
  setCameraBounds(bounds?: RNLatLngBounds): void;

  /**
   * Animates camera to bounds.
   * iOS: adds an explicit animation phase for parity.
   * Android: uses native timing.
   */
  animateToBounds(
    bounds: RNLatLngBounds,
    padding?: number,
    durationMs?: number,
    lockBounds?: boolean
  ): void;

  /** Snapshot of current frame. */
  snapshot(options: RNSnapshotOptions): Promise<string | undefined>;

  /** Native location-settings dialog. */
  showLocationDialog(): void;

  /**
   * Opens the OS location settings.
   * iOS: opens the app settings.
   * Android: opens system location settings.
   */
  openLocationSettings(): void;

  /** Requests runtime location permission. */
  requestLocationPermission(): Promise<RNLocationPermissionResult>;

  /**
   * Checks Google Play Services availability.
   * iOS: always returns false.
   * Android: performs a real system check.
   */
  isGooglePlayServicesAvailable(): boolean;
}

/** Typed hybrid Google Maps view. */
export type RNGoogleMapsPlusView = HybridView<
  RNGoogleMapsPlusViewProps,
  RNGoogleMapsPlusViewMethods
>;
