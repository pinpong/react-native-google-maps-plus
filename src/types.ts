/**
 * Platform behavior
 *
 * Thin TypeScript layer over the native Google Maps SDKs for Android and iOS.
 * Behavior follows the underlying SDKs unless explicitly documented otherwise.
 */

import type { RNGoogleMapsPlusViewMethods } from './RNGoogleMapsPlusView.nitro';
import type { HybridView } from 'react-native-nitro-modules';

/** Reference to the native Google Maps view. */
export type GoogleMapsViewRef = HybridView<RNGoogleMapsPlusViewMethods>;

/** Initial map configuration. */
export type RNInitialProps = {
  /** Map instance identifier. */
  mapId?: string;

  /**
   * Enables lite rendering mode.
   *
   * Android: supported.
   * iOS: not supported.
   */
  liteMode?: boolean;

  /** Initial camera configuration. */
  camera?: RNCameraUpdate;

  /** Background color while tiles load. */
  backgroundColor?: string;
};

/** UI and gesture settings. */
export type RNMapUiSettings = {
  /** Enables or disables all gestures. */
  allGesturesEnabled?: boolean;

  /** Shows the compass. */
  compassEnabled?: boolean;

  /** Enables the indoor level picker. */
  indoorLevelPickerEnabled?: boolean;

  /**
   * Enables the map toolbar.
   *
   * Android: supported.
   * iOS: not supported.
   */
  mapToolbarEnabled?: boolean;

  /**  Enables the "My Location" button. */
  myLocationButtonEnabled?: boolean;

  /** Enables rotation gestures. */
  rotateEnabled?: boolean;

  /** Enables scroll gestures. */
  scrollEnabled?: boolean;

  /** Enables scroll during rotate/zoom gestures. */
  scrollDuringRotateOrZoomEnabled?: boolean;

  /** Enables tilt gestures. */
  tiltEnabled?: boolean;

  /**
   * Shows built-in zoom controls.
   *
   * Android: supported.
   * iOS: not supported.
   */
  zoomControlsEnabled?: boolean;

  /** Enables pinch zoom gestures. */
  zoomGesturesEnabled?: boolean;

  /**
   * Consumes the press event.
   *
   * When enabled:
   * - Native map UI does NOT execute its default behavior.
   * - Only the JS callback is triggered.
   *
   * When disabled:
   * - JS callback is triggered.
   * - Native default behavior runs (e.g. camera move, info window, selection).
   */
  consumeOnMarkerPress?: boolean;

  /**
   * Consumes the My-Location-button press event.
   *
   * When enabled:
   * - Native map does NOT perform its default camera move.
   * - Only the JS callback is triggered.
   *
   * When disabled:
   * - JS callback is triggered.
   * - Native behavior runs (camera animates to user location).
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
  /** Southwest corner. */
  southwest: RNLatLng;

  /** Northeast corner. */
  northeast: RNLatLng;
};

/** Snapshot configuration. */
export type RNSnapshotOptions = {
  /** Output size. */
  size?: RNSize;

  /** Image format. */
  format: RNSnapshotFormat;

  /** Image quality (0–100). */
  quality: number;

  /** Result return type. */
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
  /** Camera target coordinate. */
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
  /** Camera target coordinate. */
  center?: RNLatLng;

  /** Zoom level. */
  zoom?: number;

  /** Bearing in degrees. */
  bearing?: number;

  /** Tilt angle in degrees. */
  tilt?: number;
};

/** Visible region. */
export type RNRegion = {
  /** Near-left corner. */
  nearLeft: RNLatLng;

  /** Near-right corner. */
  nearRight: RNLatLng;

  /** Far-left corner. */
  farLeft: RNLatLng;

  /** Far-right corner. */
  farRight: RNLatLng;

  /** Bounding box. */
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
  /** Minimum zoom level. */
  min?: number;

  /** Maximum zoom level. */
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

  /** Z-index used for rendering order. */
  zIndex?: number;

  /** Marker coordinate. */
  coordinate: RNLatLng;

  /**
   * Anchor point relative to the marker icon.
   * (0,0) = top-left, (1,1) = bottom-right.
   */
  anchor?: RNPosition;

  /** Marker title. */
  title?: string;

  /** Marker snippet / subtitle. */
  snippet?: string;

  /** Icon opacity in the range [0, 1]. */
  opacity?: number;

  /** Draws the marker flat against the map. */
  flat?: boolean;

  /** Enables marker dragging. */
  draggable?: boolean;

  /** Rotation angle in degrees. */
  rotation?: number;

  /**
   * Info window anchor relative to the marker.
   * (0,0) = top-left, (1,1) = bottom-right.
   */
  infoWindowAnchor?: RNPosition;

  /** Marker icon rendered from an SVG string. */
  iconSvg?: RNMarkerSvg;

  /** Info window content rendered from an SVG string. */
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

  /** Z-index used for rendering order. */
  zIndex?: number;

  /** Enables polygon press events. */
  pressable?: boolean;

  /** Polygon vertices. */
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

  /** Polygon holes. */
  holes?: RNPolygonHole[];

  /** Draws geodesic edges. */
  geodesic?: boolean;
};

/** Polygon hole definition. */
export type RNPolygonHole = {
  /** Hole vertices. */
  coordinates: RNLatLng[];
};

/** Polyline definition. */
export type RNPolyline = {
  /** Unique polyline identifier. */
  id: string;

  /** Z-index used for rendering order. */
  zIndex?: number;

  /** Enables polyline press events. */
  pressable?: boolean;

  /** Polyline vertices. */
  coordinates: RNLatLng[];

  /** Line cap style. */
  lineCap?: RNLineCapType;

  /** Line join style. */
  lineJoin?: RNLineJoinType;

  /** Draws a geodesic path. */
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

  /** Enables circle press events. */
  pressable?: boolean;

  /** Z-index used for rendering order. */
  zIndex?: number;

  /** Circle center. */
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

  /** Enables heatmap press events. */
  pressable?: boolean;

  /** Z-index used for rendering order. */
  zIndex?: number;

  /** Weighted heatmap points. */
  weightedData: RNHeatmapPoint[];

  /** Radius used for each point. */
  radius?: number;

  /** Overall heatmap opacity. */
  opacity?: number;

  /** Custom gradient configuration. */
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

  /** Z-index used for rendering order. */
  zIndex?: number;

  /** URL template for tiles. */
  url: string;

  /** Tile size in pixels. */
  tileSize: number;

  /** Overlay opacity in the range [0, 1]. */
  opacity?: number;

  /** Enables fade-in animation when tiles load. */
  fadeIn?: boolean;
};

/** Indoor building information. */
export type RNIndoorBuilding = {
  /** Index of the active level. */
  activeLevelIndex?: number;

  /** Index of the default level. */
  defaultLevelIndex?: number;

  /** Available indoor levels. */
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
  /** Android-specific location configuration. */
  android?: RNAndroidLocationConfig;

  /** iOS-specific location configuration. */
  ios?: RNIOSLocationConfig;
};

/** Android location configuration. */
export type RNAndroidLocationConfig = {
  /** Requested location priority. */
  priority?: RNAndroidLocationPriority;

  /** Desired update interval in milliseconds. */
  interval?: number;

  /** Minimum update interval in milliseconds. */
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
  /** Desired accuracy level. */
  desiredAccuracy?: RNIOSLocationAccuracy;

  /** Minimum distance in meters before a new update is delivered. */
  distanceFilterMeters?: number;

  /** Activity type used to optimize location updates. */
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
  /** Android permission result. */
  android?: RNAndroidLocationPermissionResult;

  /** iOS permission result. */
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
  /** Center coordinate. */
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

  /** Android-only fields. */
  android?: RNLocationAndroid;

  /** iOS-only fields. */
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
  /** Google Play Services are missing on the device. */
  PLAY_SERVICES_MISSING = 0,

  /** Google Play Services are present but invalid. */
  PLAY_SERVICES_INVALID = 1,

  /** Google Play Services are disabled on the device. */
  PLAY_SERVICES_DISABLED = 2,

  /** Google Play Services are installed, but outdated. */
  PLAY_SERVICES_OUTDATED = 3,

  /** A newer version of Google Play Services is available. */
  PLAY_SERVICE_UPDATE_AVAILABLE = 4,

  /** Google Play Services are currently updating. */
  PLAY_SERVICE_UPDATING = 5,

  /** Unknown error. */
  UNKNOWN = 6,
}
