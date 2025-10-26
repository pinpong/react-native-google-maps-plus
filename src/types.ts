import type { RNGoogleMapsPlusViewMethods } from './RNGoogleMapsPlusView.nitro';
import type { HybridView } from 'react-native-nitro-modules';

export type GoogleMapsViewRef = HybridView<RNGoogleMapsPlusViewMethods>;

export type RNInitialProps = {
  mapId?: string;
  liteMode?: boolean;
  camera?: RNCamera;
};

export type RNMapUiSettings = {
  allGesturesEnabled?: boolean;
  compassEnabled?: boolean;
  indoorLevelPickerEnabled?: boolean;
  mapToolbarEnabled?: boolean;
  myLocationButtonEnabled?: boolean;
  rotateEnabled?: boolean;
  scrollEnabled?: boolean;
  scrollDuringRotateOrZoomEnabled?: boolean;
  tiltEnabled?: boolean;
  zoomControlsEnabled?: boolean;
  zoomGesturesEnabled?: boolean;
  consumeOnMarkerPress?: boolean;
  consumeOnMyLocationButtonPress?: boolean;
};

export type RNLatLng = {
  latitude: number;
  longitude: number;
};

export type RNLatLngBounds = {
  southwest: RNLatLng;
  northeast: RNLatLng;
};

export type RNSnapshotOptions = {
  size?: RNSize;
  format: RNSnapshotFormat;
  quality: number;
  resultType: RNSnapshotResultType;
};

export type RNSize = {
  width: number;
  height: number;
};

export type RNSnapshotFormat = 'png' | 'jpg' | 'jpeg';

export type RNSnapshotResultType = 'base64' | 'file';

export type RNMapPadding = {
  top: number;
  left: number;
  bottom: number;
  right: number;
};

export type RNMapType = 'none' | 'normal' | 'hybrid' | 'satellite' | 'terrain';

export type RNUserInterfaceStyle = 'light' | 'dark' | 'default';

export type RNFeatureType = string;

/*
  | 'administrative'
  | 'administrative.country'
  | 'administrative.land_parcel'
  | 'administrative.locality'
  | 'administrative.neighborhood'
  | 'administrative.province'
  | 'landscape'
  | 'landscape.man_made'
  | 'landscape.natural'
  | 'poi'
  | 'poi.attraction'
  | 'poi.business'
  | 'poi.government'
  | 'poi.medical'
  | 'poi.park'
  | 'poi.place_of_worship'
  | 'poi.school'
  | 'poi.sports_complex'
  | 'road'
  | 'road.arterial'
  | 'road.highway'
  | 'road.local'
  | 'transit'
  | 'transit.line'
  | 'transit.station'
  | 'water';
 */

export type RNElementType = string;

/*
  | 'all'
  | 'geometry'
  | 'geometry.fill'
  | 'geometry.stroke'
  | 'labels'
  | 'labels.icon'
  | 'labels.text'
  | 'labels.text.fill'
  | 'labels.text.stroke'
 */

export type RNVisibility = string;

/*
'on' | 'off' | 'simplified';
 */

export interface RNMapStyler {
  color?: string;
  visibility?: RNVisibility;
  weight?: number;
  gamma?: number;
  lightness?: number;
  saturation?: number;
  invert_lightness?: boolean;
}

export interface RNMapStyleElement {
  featureType?: RNFeatureType;
  elementType?: RNElementType;
  stylers: RNMapStyler[];
}

export type RNCamera = {
  center?: RNLatLng;
  zoom?: number;
  bearing?: number;
  tilt?: number;
};

export type RNRegion = {
  nearLeft: RNLatLng;
  nearRight: RNLatLng;
  farLeft: RNLatLng;
  farRight: RNLatLng;
  latLngBounds: RNLatLngBounds;
};

export type RNPosition = {
  x: number;
  y: number;
};

export type RNMapZoomConfig = {
  min?: number;
  max?: number;
};

export type RNLineCapType = 'butt' | 'round' | 'square';
export type RNLineJoinType = 'miter' | 'round' | 'bevel';

export type RNMarker = {
  id: string;
  zIndex?: number;
  coordinate: RNLatLng;
  anchor?: RNPosition;
  showInfoWindow?: boolean;
  title?: string;
  snippet?: string;
  opacity?: number;
  flat?: boolean;
  draggable?: boolean;
  rotation?: number;
  infoWindowAnchor?: RNPosition;
  iconSvg?: RNMarkerSvg;
};

export type RNMarkerSvg = {
  width: number;
  height: number;
  svgString: string;
};

export type RNPolygon = {
  id: string;
  zIndex?: number;
  pressable?: boolean;
  coordinates: RNLatLng[];
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  holes?: RNPolygonHole[];
  geodesic?: boolean;
};

export type RNPolygonHole = {
  coordinates: RNLatLng[];
};

export type RNPolyline = {
  id: string;
  zIndex?: number;
  pressable?: boolean;
  coordinates: RNLatLng[];
  lineCap?: RNLineCapType;
  lineJoin?: RNLineJoinType;
  geodesic?: boolean;
  color?: string;
  width?: number;
};

export type RNCircle = {
  id: string;
  pressable?: boolean;
  zIndex?: number;
  center: RNLatLng;
  radius: number;
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
};

export type RNHeatmap = {
  id: string;
  pressable?: boolean;
  zIndex?: number;
  weightedData: RNHeatmapPoint[];
  radius?: number;
  opacity?: number;
  gradient?: RNHeatmapGradient;
};

export type RNHeatmapPoint = {
  latitude: number;
  longitude: number;
  weight: number;
};

export type RNHeatmapGradient = {
  colors: string[];
  startPoints: number[];
  colorMapSize: number;
};

export type RNKMLayer = {
  id: string;
  kmlString: string;
};

export type RNUrlTileOverlay = {
  id: string;
  zIndex?: number;
  url: string;
  tileSize: number;
  opacity?: number;
  fadeIn?: boolean;
};

export type RNIndoorBuilding = {
  activeLevelIndex?: number;
  defaultLevelIndex?: number;
  levels: RNIndoorLevel[];
  underground?: boolean;
};

export type RNIndoorLevel = {
  index: number;
  name?: string;
  shortName?: string;
  active?: boolean;
};

export type RNLocationConfig = {
  android?: RNAndroidLocationConfig;
  ios?: RNIOSLocationConfig;
};

export type RNAndroidLocationConfig = {
  priority?: RNAndroidLocationPriority;
  interval?: number;
  minUpdateInterval?: number;
};

export enum RNAndroidLocationPriority {
  PRIORITY_HIGH_ACCURACY = 0,
  PRIORITY_BALANCED_POWER_ACCURACY = 1,
  PRIORITY_LOW_POWER = 2,
  PRIORITY_PASSIVE = 3,
}

export type RNIOSLocationConfig = {
  desiredAccuracy?: RNIOSLocationAccuracy;
  distanceFilterMeters?: number;
};

export enum RNIOSLocationAccuracy {
  ACCURACY_BEST = 0,
  ACCURACY_NEAREST_TEN_METER = 1,
  ACCURACY_NEAREST_HUNDRED_METER = 2,
  ACCURACY_KILOMETER = 3,
}

export type RNLocationPermissionResult = {
  android?: RNAndroidLocationPermissionResult;
  ios?: RNIOSPermissionResult;
};

export enum RNAndroidLocationPermissionResult {
  GRANTED = 1,
  DENIED = -1,
  NEVER_ASK_AGAIN = -2,
}

export enum RNIOSPermissionResult {
  DENIED = -1,
  AUTHORIZED = 1,
}

export type RNLocation = {
  center: RNLatLng;
  altitude: number;
  accuracy: number;
  bearing: number;
  speed: number;
  time: number;
  android?: RNLocationAndroid;
  ios?: RNLocationIOS;
};

export type RNLocationAndroid = {
  provider?: string | null;
  elapsedRealtimeNanos?: number;
  bearingAccuracyDegrees?: number;
  speedAccuracyMetersPerSecond?: number;
  verticalAccuracyMeters?: number;
  mslAltitudeMeters?: number;
  mslAltitudeAccuracyMeters?: number;
  isMock?: boolean;
};
export type RNLocationIOS = {
  horizontalAccuracy?: number;
  verticalAccuracy?: number;
  speedAccuracy?: number;
  courseAccuracy?: number;
  floor?: number | null;
  isFromMockProvider?: boolean;
  timestamp?: number;
};

export enum RNLocationErrorCode {
  PERMISSION_DENIED = 1,
  POSITION_UNAVAILABLE = 2,
  TIMEOUT = 3,
  PLAY_SERVICE_NOT_AVAILABLE = 4,
  SETTINGS_NOT_SATISFIED = 5,
  INTERNAL_ERROR = -1,
}

export enum RNMapErrorCode {
  PLAY_SERVICES_MISSING = 0,
  PLAY_SERVICES_INVALID = 1,
  PLAY_SERVICES_DISABLED = 2,
  PLAY_SERVICES_OUTDATED = 3,
  PLAY_SERVICE_UPDATE_AVAILABLE = 4,
  PLAY_SERVICE_UPDATING = 5,
  UNKNOWN = 6,
}
