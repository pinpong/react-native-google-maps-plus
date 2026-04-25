/**
 * Platform behavior
 *
 * Thin TypeScript layer over the native Google Maps SDKs for Android and iOS.
 * Behavior follows the underlying SDKs unless explicitly documented otherwise.
 */

import type { RNGoogleMapsPlusStreetViewMethods } from './RNGoogleMapsPlusStreetView.nitro';
import type { RNGoogleMapsPlusViewMethods } from './RNGoogleMapsPlusView.nitro';
import type { HybridView } from 'react-native-nitro-modules';

/** Reference to the native Google Maps view. */
export type GoogleMapsViewRef = HybridView<RNGoogleMapsPlusViewMethods>;

/** Reference to the native Google Maps Street View. */
export type GoogleMapsStreetViewRef =
  HybridView<RNGoogleMapsPlusStreetViewMethods>;

/** Initial map configuration. */
export type RNInitialProps = {
  /** Map instance identifier. */
  mapId?: string;

  /**
   * Enables lite rendering mode.
   *
   * Android: supported.
   * iOS: not supported.
   * @defaultValue `false`
   */
  liteMode?: boolean;

  /**
   * Initial camera configuration.
   * See {@link RNCameraUpdate}.
   */
  camera?: RNCameraUpdate;

  /** Background color while tiles load. */
  backgroundColor?: string;
};

/** UI and gesture settings. */
export type RNMapUiSettings = {
  /**
   * Enables or disables all gestures.
   * @defaultValue `true`
   */
  allGesturesEnabled?: boolean;

  /**
   * Shows the compass.
   * @defaultValue `false`
   */
  compassEnabled?: boolean;

  /**
   * Enables the indoor level picker.
   * @defaultValue `false`
   */
  indoorLevelPickerEnabled?: boolean;

  /**
   * Enables the map toolbar.
   *
   * Android: supported.
   * iOS: not supported.
   * @defaultValue `false`
   */
  mapToolbarEnabled?: boolean;

  /**
   * Enables the "My Location" button.
   * @defaultValue `false`
   */
  myLocationButtonEnabled?: boolean;

  /**
   * Enables rotation gestures.
   * @defaultValue `true`
   */
  rotateEnabled?: boolean;

  /**
   * Enables scroll gestures.
   * @defaultValue `true`
   */
  scrollEnabled?: boolean;

  /**
   * Enables scroll during rotate/zoom gestures.
   * @defaultValue `true`
   */
  scrollDuringRotateOrZoomEnabled?: boolean;

  /**
   * Enables tilt gestures.
   * @defaultValue `true`
   */
  tiltEnabled?: boolean;

  /**
   * Shows built-in zoom controls.
   *
   * Android: supported.
   * iOS: not supported.
   * @defaultValue `false`
   */
  zoomControlsEnabled?: boolean;

  /**
   * Enables pinch zoom gestures.
   * @defaultValue `true`
   */
  zoomGesturesEnabled?: boolean;

  /**
   * Consumes the press event.
   * @remarks
   * When enabled: native map UI does not execute its default behavior; only the JS callback fires.
   * When disabled: JS callback fires and native behavior runs (camera move, info window, selection).
   * @defaultValue `false`
   */
  consumeOnMarkerPress?: boolean;

  /**
   * Consumes the My-Location-button press event.
   * @remarks
   * When enabled: native map UI does not execute its default behavior; only the JS callback fires.
   * When disabled: JS callback fires and native behavior runs (camera animates to user location).
   * @defaultValue `false`
   */
  consumeOnMyLocationButtonPress?: boolean;
};

/** Geographic coordinate. */
export type RNLatLng = {
  /** Latitude. */
  latitude: number;

  /** Longitude. */
  longitude: number;
};

/** Geographic bounds. */
export type RNLatLngBounds = {
  /** Southwest corner.
   *
   * See {@link RNLatLng}.
   */
  southwest: RNLatLng;

  /** Northeast corner.
   *
   * See {@link RNLatLng}.
   */
  northeast: RNLatLng;
};

/** Snapshot configuration. */
export type RNSnapshotOptions = {
  /**
   * Output size.
   * @defaultValue Uses the full view size.
   *
   * See {@link RNSize}.
   */
  size?: RNSize;

  /** Image format. See {@link RNSnapshotFormat}. */
  format: RNSnapshotFormat;

  /** Image quality (0–100). */
  quality: number;

  /** Result return type. See {@link RNSnapshotResultType}. */
  resultType: RNSnapshotResultType;
};

/**
 * Logical size of an image or view.
 * iOS: points (pt)
 * Android: dp
 * Converted internally to physical pixels.
 */
export type RNSize = {
  /** Width. */
  width: number;

  /** Height. */
  height: number;
};

/** Snapshot image formats. */
export type RNSnapshotFormat = 'png' | 'jpg' | 'jpeg';

/** Snapshot result types. */
export type RNSnapshotResultType = 'base64' | 'file';

/**
 * Map padding in logical units (pt on iOS, dp on Android).
 * Both are converted internally to device pixels.
 */
export type RNMapPadding = {
  /** Top padding. */
  top: number;

  /** Left padding. */
  left: number;

  /** Bottom padding. */
  bottom: number;

  /** Right padding. */
  right: number;
};

/** Base map types. */
export type RNMapType = 'none' | 'normal' | 'hybrid' | 'satellite' | 'terrain';

/** UI style mode. */
export type RNUserInterfaceStyle = 'light' | 'dark' | 'system';

/** Camera definition. */
export type RNCamera = {
  /** Camera target coordinate.
   *
   * See {@link RNLatLng}.
   */
  center: RNLatLng;

  /** Zoom level. */
  zoom: number;

  /** Bearing in degrees. */
  bearing: number;

  /** Tilt angle in degrees. */
  tilt: number;
};

/** Partial camera update. */
export type RNCameraUpdate = {
  /**
   * Camera target coordinate.
   * @defaultValue Current center.
   * See {@link RNLatLng}.
   */
  center?: RNLatLng;

  /**
   * Zoom level.
   * @defaultValue Current zoom.
   */
  zoom?: number;

  /**
   * Bearing in degrees.
   * @defaultValue Current bearing.
   */
  bearing?: number;

  /**
   * Tilt angle in degrees.
   * @defaultValue Current tilt.
   */
  tilt?: number;
};

/** Visible region. */
export type RNRegion = {
  /** Near-left corner.
   *
   * See {@link RNLatLng}.
   */
  nearLeft: RNLatLng;

  /** Near-right corner.
   *
   * See {@link RNLatLng}.
   */
  nearRight: RNLatLng;

  /** Far-left corner.
   *
   * See {@link RNLatLng}.
   */
  farLeft: RNLatLng;

  /** Far-right corner.
   *
   * See {@link RNLatLng}.
   */
  farRight: RNLatLng;

  /** Bounding box.
   *
   * See {@link RNLatLngBounds}.
   */
  latLngBounds: RNLatLngBounds;
};

/** 2D position in view coordinates. */
export type RNPosition = {
  /** X coordinate. */
  x: number;

  /** Y coordinate. */
  y: number;
};

/** Zoom configuration. */
export type RNMapZoomConfig = {
  /**
   * Minimum zoom level.
   * @defaultValue SDK minimum, usually around `2`.
   */
  min?: number;

  /**
   * Maximum zoom level.
   * @defaultValue SDK maximum, usually around `21`.
   */
  max?: number;
};

/**
 * Line cap styles.
 *
 * Android: supported.
 * iOS: not supported.
 */
export type RNLineCapType = 'butt' | 'round' | 'square';

/**
 * Line join styles.
 *
 * Android: supported.
 * iOS: not supported.
 */
export type RNLineJoinType = 'miter' | 'round' | 'bevel';

/**
 * Marker definition.
 *
 * On iOS, some default animations are suppressed for parity with Android.
 */
export type RNMarker = {
  /** Unique marker identifier. */
  id: string;

  /**
   * Z-index used for rendering order.
   * @defaultValue `0`
   */
  zIndex?: number;

  /** Marker coordinate.
   *
   * See {@link RNLatLng}.
   */
  coordinate: RNLatLng;

  /**
   * Anchor point relative to the marker icon.
   * (0,0) = top-left, (1,1) = bottom-right.
   * @defaultValue `(0.5, 1.0)` = bottom-center
   *
   * See {@link RNPosition}.
   */
  anchor?: RNPosition;

  /** Marker title. */
  title?: string;

  /** Marker snippet / subtitle. */
  snippet?: string;

  /**
   * Icon opacity in the range [0, 1].
   * @defaultValue `1.0`
   */
  opacity?: number;

  /**
   * Draws the marker flat against the map.
   * @defaultValue `false`
   */
  flat?: boolean;

  /**
   * Enables marker dragging.
   * @defaultValue `false`
   */
  draggable?: boolean;

  /**
   * Rotation angle in degrees.
   * @defaultValue `0`
   */
  rotation?: number;

  /**
   * Info window anchor relative to the marker.
   * (0,0) = top-left, (1,1) = bottom-right.
   * @defaultValue `(0.5, 0.0)` = top-center
   *
   * See {@link RNPosition}.
   */
  infoWindowAnchor?: RNPosition;

  /** Marker icon rendered from an SVG string. See {@link RNMarkerSvg}. */
  iconSvg?: RNMarkerSvg;

  /** Info window content rendered from an SVG string. See {@link RNMarkerSvg}. */
  infoWindowIconSvg?: RNMarkerSvg;
};

/** Marker SVG definition. */
export type RNMarkerSvg = {
  /**
   * Icon width in logical units.
   *
   * iOS: points (pt)
   * Android: density-independent pixels (dp)
   *
   * Converted internally to physical pixels.
   */
  width: number;

  /**
   * Icon height in logical units.
   *
   * iOS: points (pt)
   * Android: density-independent pixels (dp)
   *
   * Converted internally to physical pixels.
   */
  height: number;

  /**
   * Raw SVG content.
   *
   * Rendering engines:
   * - Android: AndroidSVG — http://bigbadaboom.github.io/androidsvg/
   * - iOS: SVGKit — https://github.com/SVGKit/SVGKit
   */
  svgString: string;
};

/** Polygon definition. */
export type RNPolygon = {
  /** Unique polygon identifier. */
  id: string;

  /**
   * Z-index used for rendering order.
   * @defaultValue `0`
   */
  zIndex?: number;

  /**
   * Enables polygon press events.
   * @defaultValue `false`
   */
  pressable?: boolean;

  /** Polygon vertices.
   *
   * See {@link RNLatLng}[].
   */
  coordinates: RNLatLng[];

  /** Fill color. */
  fillColor?: string;

  /** Stroke color. */
  strokeColor?: string;

  /**
   * Stroke width in logical units.
   *
   * iOS: points (pt)
   * Android: density-independent pixels (dp)
   *
   * Converted internally to physical pixels.
   */
  strokeWidth?: number;

  /** Polygon holes.
   *
   * See {@link RNPolygonHole}.
   */
  holes?: RNPolygonHole[];

  /**
   * Draws geodesic edges.
   * @defaultValue `false`
   */
  geodesic?: boolean;
};

/** Polygon hole definition. */
export type RNPolygonHole = {
  /** Hole vertices.
   *
   * See {@link RNLatLng}[].
   */
  coordinates: RNLatLng[];
};

/** Polyline definition. */
export type RNPolyline = {
  /** Unique polyline identifier. */
  id: string;

  /**
   * Z-index used for rendering order.
   * @defaultValue `0`
   */
  zIndex?: number;

  /**
   * Enables polyline press events.
   * @defaultValue `false`
   */
  pressable?: boolean;

  /** Polyline vertices.
   *
   * See {@link RNLatLng}[].
   */
  coordinates: RNLatLng[];

  /**
   * Line cap style.
   * @defaultValue `'butt'`
   * See {@link RNLineCapType}.
   */
  lineCap?: RNLineCapType;

  /**
   * Line join style.
   * @defaultValue `'miter'`
   * See {@link RNLineJoinType}.
   */
  lineJoin?: RNLineJoinType;

  /**
   * Draws a geodesic path.
   * @defaultValue `false`
   */
  geodesic?: boolean;

  /** Line color. */
  color?: string;

  /**
   * Line width in logical units.
   *
   * iOS: points (pt)
   * Android: density-independent pixels (dp)
   *
   * Converted internally to physical pixels.
   */
  width?: number;
};

/** Circle definition. */
export type RNCircle = {
  /** Unique circle identifier. */
  id: string;

  /**
   * Enables circle press events.
   * @defaultValue `false`
   */
  pressable?: boolean;

  /**
   * Z-index used for rendering order.
   * @defaultValue `0`
   */
  zIndex?: number;

  /** Circle center.
   *
   * See {@link RNLatLng}.
   */
  center: RNLatLng;

  /** Radius in meters. */
  radius: number;

  /**
   * Stroke width in logical units.
   *
   * iOS: points (pt)
   * Android: density-independent pixels (dp)
   *
   * Converted internally to physical pixels.
   */
  strokeWidth?: number;

  /** Stroke color. */
  strokeColor?: string;

  /** Fill color. */
  fillColor?: string;
};

/** Heatmap configuration. */
export type RNHeatmap = {
  /** Unique heatmap identifier. */
  id: string;

  /**
   * Enables heatmap press events.
   * @defaultValue `false`
   */
  pressable?: boolean;

  /**
   * Z-index used for rendering order.
   * @defaultValue `0`
   */
  zIndex?: number;

  /** Weighted heatmap points.
   *
   * See {@link RNHeatmapPoint}.
   */
  weightedData: RNHeatmapPoint[];

  /**
   * Radius used for each point.
   * @defaultValue `20`
   */
  radius?: number;

  /**
   * Overall heatmap opacity.
   * @defaultValue `0.7`
   */
  opacity?: number;

  /** Gradient configuration.
   *
   * See {@link RNHeatmapGradient}.
   */
  gradient?: RNHeatmapGradient;
};

/** Heatmap point definition. */
export type RNHeatmapPoint = {
  /** Latitude. */
  latitude: number;

  /** Longitude. */
  longitude: number;

  /** Weight used for heatmap intensity. */
  weight: number;
};

/** Heatmap gradient configuration. */
export type RNHeatmapGradient = {
  /** Gradient colors. */
  colors: string[];

  /** Gradient start points in the range [0, 1]. */
  startPoints: number[];

  /** Size of the generated color map. */
  colorMapSize: number;
};

/** KML layer configuration. */
export type RNKMLayer = {
  /** Unique KML layer identifier. */
  id: string;

  /** KML document as string. */
  kmlString: string;
};

/** URL tile overlay configuration. */
export type RNUrlTileOverlay = {
  /** Unique tile overlay identifier. */
  id: string;

  /**
   * Z-index used for rendering order.
   * @defaultValue `0`
   */
  zIndex?: number;

  /** URL template for tiles. */
  url: string;

  /** Tile size in pixels. */
  tileSize: number;

  /**
   * Overlay opacity in the range [0, 1].
   * @defaultValue `1.0`
   */
  opacity?: number;

  /**
   * Enables fade-in animation when tiles load.
   * @defaultValue `true`
   */
  fadeIn?: boolean;
};

/** Indoor building information. */
export type RNIndoorBuilding = {
  /** Index of the active level. */
  activeLevelIndex?: number;

  /** Index of the default level. */
  defaultLevelIndex?: number;

  /** Available indoor levels.
   *
   * See {@link RNIndoorLevel}.
   */
  levels: RNIndoorLevel[];

  /** Indicates whether the building is underground. */
  underground?: boolean;
};

/** Indoor level information. */
export type RNIndoorLevel = {
  /** Level index. */
  index: number;

  /** Level name. */
  name?: string;

  /** Short level name. */
  shortName?: string;

  /** Indicates whether this level is currently active. */
  active?: boolean;
};

/** Location configuration. */
export type RNLocationConfig = {
  /**
   * Android-specific location configuration.
   *
   * See {@link RNAndroidLocationConfig}.
   */
  android?: RNAndroidLocationConfig;

  /**
   * iOS-specific location configuration.
   *
   * See {@link RNIOSLocationConfig}.
   */
  ios?: RNIOSLocationConfig;
};

/** Android location configuration. */
export type RNAndroidLocationConfig = {
  /**
   * Requested location priority.
   * @defaultValue `PRIORITY_HIGH_ACCURACY`.
   * See {@link RNAndroidLocationPriority}.
   */
  priority?: RNAndroidLocationPriority;

  /**
   * Desired update interval in milliseconds.
   * @defaultValue `5000`
   */
  interval?: number;

  /**
   * Minimum update interval in milliseconds.
   * @defaultValue `0`
   */
  minUpdateInterval?: number;
};

/** Android location priorities. */
export enum RNAndroidLocationPriority {
  /** High accuracy, higher power usage. */
  PRIORITY_HIGH_ACCURACY = 0,
  /** Balanced accuracy and power usage. */
  PRIORITY_BALANCED_POWER_ACCURACY = 1,
  /** Low power usage, coarse accuracy. */
  PRIORITY_LOW_POWER = 2,
  /** Passive updates, no active requests. */
  PRIORITY_PASSIVE = 3,
}

/** iOS location configuration. */
export type RNIOSLocationConfig = {
  /**
   * Desired accuracy level.
   * @defaultValue `ACCURACY_BEST`
   * See {@link RNIOSLocationAccuracy}.
   */
  desiredAccuracy?: RNIOSLocationAccuracy;

  /**
   * Minimum distance in meters before a new update is delivered.
   * @defaultValue `0` (no filter)
   */
  distanceFilterMeters?: number;

  /**
   * Activity type used to optimize location updates.
   * @defaultValue `OTHER`
   * See {@link RNIOSLocationActivityType}.
   */
  activityType?: RNIOSLocationActivityType;
};

/** iOS location accuracy levels. */
export enum RNIOSLocationAccuracy {
  /** Best possible accuracy. */
  ACCURACY_BEST = 0,
  /** Approximately 10 m accuracy. */
  ACCURACY_NEAREST_TEN_METER = 1,
  /** Approximately 100 m accuracy. */
  ACCURACY_NEAREST_HUNDRED_METER = 2,
  /** Approximately 1 km accuracy. */
  ACCURACY_KILOMETER = 3,
}

/** iOS activity types for location updates. */
export enum RNIOSLocationActivityType {
  /** Default activity type. */
  OTHER = 0,
  /** Turn-by-turn navigation. */
  NAVIGATION = 1,
  /** Automotive navigation. */
  AUTOMOTIVE = 2,
  /** Fitness and outdoor activities. */
  FITNESS = 3,
  /** Airborne activity. */
  AIRBORNE = 4,
}

/** Combined location permission result. */
export type RNLocationPermissionResult = {
  /**
   * Android permission result.
   *
   * See {@link RNAndroidLocationPermissionResult}.
   */
  android?: RNAndroidLocationPermissionResult;

  /**
   * iOS permission result.
   *
   * See {@link RNIOSPermissionResult}.
   */
  ios?: RNIOSPermissionResult;
};

/** Android location permission results. */
export enum RNAndroidLocationPermissionResult {
  /** Permission was granted. */
  GRANTED = 1,
  /** Permission was denied. */
  DENIED = -1,
  /** User chose "never ask again". */
  NEVER_ASK_AGAIN = -2,
}

/** iOS location permission results. */
export enum RNIOSPermissionResult {
  /** Permission was denied. */
  DENIED = -1,
  /** Permission was granted. */
  AUTHORIZED = 1,
}

/** Location object. */
export type RNLocation = {
  /**
   * Center coordinate.
   *
   * See {@link RNLatLng}.
   */
  center: RNLatLng;

  /** Altitude in meters. */
  altitude: number;

  /** Accuracy in meters. */
  accuracy: number;

  /** Bearing in degrees. */
  bearing: number;

  /** Speed in meters per second. */
  speed: number;

  /** Timestamp in milliseconds since Unix epoch. */
  time: number;

  /**
   * Android-only location fields.
   *
   * See {@link RNLocationAndroid}.
   */
  android?: RNLocationAndroid;

  /**
   * iOS-only location fields.
   *
   * See {@link RNLocationIOS}.
   */
  ios?: RNLocationIOS;
};

/** Android location. */
export type RNLocationAndroid = {
  /** Provider name. */
  provider?: string;

  /** Elapsed realtime in nanoseconds. */
  elapsedRealtimeNanos?: number;

  /** Bearing accuracy in degrees. */
  bearingAccuracyDegrees?: number;

  /** Speed accuracy in meters per second. */
  speedAccuracyMetersPerSecond?: number;

  /** Vertical accuracy in meters. */
  verticalAccuracyMeters?: number;

  /** Altitude above mean sea level in meters. */
  mslAltitudeMeters?: number;

  /** Accuracy of the MSL altitude in meters. */
  mslAltitudeAccuracyMeters?: number;

  /** Indicates whether the location is from a mock provider. */
  isMock?: boolean;
};

/** iOS location. */
export type RNLocationIOS = {
  /** Horizontal accuracy in meters. */
  horizontalAccuracy?: number;

  /** Vertical accuracy in meters. */
  verticalAccuracy?: number;

  /** Speed accuracy in meters per second. */
  speedAccuracy?: number;

  /** Course accuracy in degrees. */
  courseAccuracy?: number;

  /** Floor level index. */
  floor?: number;

  /** Indicates whether the location is from a mock provider. */
  isFromMockProvider?: boolean;

  /** Timestamp in milliseconds since Unix epoch. */
  timestamp?: number;
};

/** UI and gesture settings for Street View. */
export type RNStreetViewUiSettings = {
  /**
   * Show street name overlays.
   * @defaultValue `true`
   */
  streetNamesEnabled?: boolean;

  /**
   * Allow navigating between panoramas by tapping arrows.
   * @defaultValue `true`
   */
  userNavigationEnabled?: boolean;

  /**
   * Allow panning (rotating) the panorama.
   * @defaultValue `true`
   */
  panningGesturesEnabled?: boolean;

  /**
   * Allow zooming in/out.
   * @defaultValue `true`
   */
  zoomGesturesEnabled?: boolean;
};

/** Street View panorama source filter. */
export type RNStreetViewSource = 'default' | 'outdoor';

/** Initial Street View configuration. Set once before the view mounts. */
export type RNStreetViewInitialProps = {
  /**
   * Load a specific panorama by ID.
   * Takes priority over position when set.
   */
  panoramaId?: string;

  /** Initial panorama position. Ignored when panoramaId is set.
   * See {@link RNLatLng}.
   */
  position?: RNLatLng;

  /**
   * Search radius in meters around position.
   * @defaultValue `50`
   */
  radius?: number;

  /**
   * Restricts panoramas to the given source.
   * @defaultValue `'default'`
   * See {@link RNStreetViewSource}.
   */
  source?: RNStreetViewSource;

  /** Initial camera orientation. Applied once at mount time.
   * See {@link RNStreetViewCamera}.
   */
  camera?: RNStreetViewCamera;
};

/** Street View tap/long-press orientation on the panorama sphere. */
export type RNStreetViewOrientation = {
  /** Compass heading in degrees (0–360). */
  bearing: number;
  /** Vertical angle in degrees (−90 up, +90 down). */
  tilt: number;
};

/** Link to an adjacent panorama. */
export type RNStreetViewPanoramaLink = {
  /** Direction to the linked panorama in degrees (0–360). */
  bearing: number;
  /** Panorama ID of the linked panorama. */
  panoramaId: string;
};

/** Full location info delivered by onPanoramaChange. */
export type RNStreetViewPanoramaLocation = {
  /** Geographic coordinate of the panorama.
   * See {@link RNLatLng}.
   */
  position: RNLatLng;
  /** Panorama ID. */
  panoramaId: string;
  /** Links to adjacent panoramas.
   * See {@link RNStreetViewPanoramaLink}.
   */
  links: RNStreetViewPanoramaLink[];
};

/** Street View point of view. */
export type RNStreetViewCamera = {
  /**
   * Compass heading in degrees (0–360).
   * 0 = north, 90 = east, 180 = south, 270 = west.
   * @defaultValue Current bearing., or `0` if no camera is set
   */
  bearing?: number;

  /**
   * Tilt angle in degrees.
   * 0 = horizontal, positive = up, negative = down.
   * Clamped to -90..90 by the SDK.
   * @defaultValue Current tilt., or `0` if no camera is set
   */
  tilt?: number;

  /**
   * Zoom level. 0 = default field of view.
   * @defaultValue Current zoom., or `0` if no camera is set
   */
  zoom?: number;
};

/** Location error codes. */
export enum RNLocationErrorCode {
  /** Location permission was denied by the user. */
  PERMISSION_DENIED = 1,

  /** The device was unable to determine a position. */
  POSITION_UNAVAILABLE = 2,

  /** The location request timed out. */
  TIMEOUT = 3,

  /** Required Google Play Services are not available. */
  PLAY_SERVICE_NOT_AVAILABLE = 4,

  /** Device location settings do not satisfy the request. */
  SETTINGS_NOT_SATISFIED = 5,

  /** Internal or unknown error. */
  INTERNAL_ERROR = -1,
}

/** Error codes related to Google Play Services Maps integration. */
export enum RNMapErrorCode {
  /** Play Services not installed (Android). */
  PLAY_SERVICES_MISSING = 0,

  /** Play Services invalid or corrupted (Android). */
  PLAY_SERVICES_INVALID = 1,

  /** Play Services disabled (Android). */
  PLAY_SERVICES_DISABLED = 2,

  /** Play Services version too old (Android). */
  PLAY_SERVICES_OUTDATED = 3,

  /** Play Services update available (Android). */
  PLAY_SERVICE_UPDATE_AVAILABLE = 4,

  /** Play Services currently updating (Android). */
  PLAY_SERVICE_UPDATING = 5,

  /** Unknown Play Services error (Android). */
  UNKNOWN = 6,

  /** Snapshot encoding or file write failed. */
  SNAPSHOT_EXPORT_FAILED = 7,

  /** Marker icon rendering failed. */
  MARKER_ICON_BUILD_FAILED = 8,

  /** Tile overlay load or parse failed. */
  TILE_OVERLAY_FAILED = 9,

  /** Invalid input provided to native layer. */
  INVALID_ARGUMENT = 10,

  /** Unexpected internal native exception. */
  INTERNAL_EXCEPTION = 11,

  /** KML layer failed to load or parse. */
  KML_LAYER_FAILED = 12,

  /** Street View panorama not found at the given position or ID. */
  PANORAMA_NOT_FOUND = 13,
}
