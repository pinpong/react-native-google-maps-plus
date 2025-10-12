import {
  array,
  boolean,
  enums,
  literal,
  number,
  object,
  optional,
  string,
  type Struct,
  union,
} from 'superstruct';

import {
  RNAndroidLocationPermissionResult,
  RNAndroidLocationPriority,
  RNIOSLocationAccuracy,
  RNIOSPermissionResult,
  RNLocationErrorCode,
  RNMapErrorCode,
} from 'react-native-google-maps-plus';

const enumValues = <T extends object>(e: T): T[keyof T][] =>
  Object.values(e).filter(
    (v): v is T[keyof T] => typeof v === 'number' || typeof v === 'string'
  );

export function unionWithValues<T extends string | number>(
  ...values: T[]
): Struct<T> {
  if (values.length === 0) throw new Error('unionWithValues: no values given');
  const literals = values.map((v) => literal(v)) as [Struct<T>, ...Struct<T>[]];
  const innerUnion = union(literals);
  (innerUnion as any)._values = values;
  (innerUnion as any)._schema = literals;
  const wrapped = optional(innerUnion);
  (wrapped as any)._values = values;
  (wrapped as any)._schema = literals;
  if ((wrapped as any).schema) {
    (wrapped as any).schema._values = values;
    (wrapped as any).schema._schema = literals;
  }

  return wrapped as any;
}

export const RNLatLngValidator = object({
  latitude: number(),
  longitude: number(),
});

export const RNLatLngBoundsValidator = object({
  northEast: RNLatLngValidator,
  southWest: RNLatLngValidator,
});

export const RNSizeValidator = object({
  width: number(),
  height: number(),
});

export const RNSnapshotFormatValidator = union([
  literal('png'),
  literal('jpg'),
  literal('jpeg'),
]);

export const RNSnapshotResultTypeValidator = union([
  literal('base64'),
  literal('file'),
]);

export const RNSnapshotOptionsValidator = object({
  size: optional(RNSizeValidator),
  format: RNSnapshotFormatValidator,
  quality: number(),
  resultType: RNSnapshotResultTypeValidator,
});

export const RNMapPaddingValidator = object({
  top: number(),
  left: number(),
  bottom: number(),
  right: number(),
});

export const RNMapTypeValidator = unionWithValues(
  'none',
  'normal',
  'hybrid',
  'satellite',
  'terrain'
);

export const RNUserInterfaceStyleValidator = unionWithValues(
  'light',
  'dark',
  'default'
);

export const RNPositionValidator = object({
  x: number(),
  y: number(),
});

export const RNCameraValidator = object({
  center: optional(RNLatLngValidator),
  zoom: optional(number()),
  bearing: optional(number()),
  tilt: optional(number()),
});

export const RNRegionValidator = object({
  center: RNLatLngValidator,
  latitudeDelta: number(),
  longitudeDelta: number(),
});

export const RNMapUiSettingsValidator = object({
  allGesturesEnabled: optional(boolean()),
  compassEnabled: optional(boolean()),
  indoorLevelPickerEnabled: optional(boolean()),
  mapToolbarEnabled: optional(boolean()),
  myLocationButtonEnabled: optional(boolean()),
  rotateEnabled: optional(boolean()),
  scrollEnabled: optional(boolean()),
  scrollDuringRotateOrZoomEnabled: optional(boolean()),
  tiltEnabled: optional(boolean()),
  zoomControlsEnabled: optional(boolean()),
  zoomGesturesEnabled: optional(boolean()),
});

export const RNMapZoomConfigValidator = object({
  min: optional(number()),
  max: optional(number()),
});

export const RNLineCapTypeValidator = union([
  literal('butt'),
  literal('round'),
  literal('square'),
]);

export const RNLineJoinTypeValidator = union([
  literal('miter'),
  literal('round'),
  literal('bevel'),
]);

export const RNMarkerSvgValidator = object({
  width: number(),
  height: number(),
  svgString: string(),
});

export const RNMarkerValidator = object({
  id: string(),
  zIndex: optional(number()),
  coordinate: RNLatLngValidator,
  anchor: optional(RNPositionValidator),
  showInfoWindow: optional(boolean()),
  title: optional(string()),
  snippet: optional(string()),
  opacity: optional(number()),
  flat: optional(boolean()),
  draggable: optional(boolean()),
  rotation: optional(number()),
  infoWindowAnchor: optional(RNPositionValidator),
  iconSvg: optional(RNMarkerSvgValidator),
});

export const RNPolygonHoleValidator = object({
  coordinates: array(RNLatLngValidator),
});

export const RNPolygonValidator = object({
  id: string(),
  zIndex: optional(number()),
  pressable: optional(boolean()),
  coordinates: array(RNLatLngValidator),
  fillColor: optional(string()),
  strokeColor: optional(string()),
  strokeWidth: optional(number()),
  holes: optional(array(RNPolygonHoleValidator)),
  geodesic: optional(boolean()),
});

export const RNPolylineValidator = object({
  id: string(),
  zIndex: optional(number()),
  pressable: optional(boolean()),
  coordinates: array(RNLatLngValidator),
  lineCap: optional(RNLineCapTypeValidator),
  lineJoin: optional(RNLineJoinTypeValidator),
  geodesic: optional(boolean()),
  color: optional(string()),
  width: optional(number()),
});

export const RNCircleValidator = object({
  id: string(),
  pressable: optional(boolean()),
  zIndex: optional(number()),
  center: RNLatLngValidator,
  radius: number(),
  strokeWidth: optional(number()),
  strokeColor: optional(string()),
  fillColor: optional(string()),
});

export const RNHeatmapPointValidator = object({
  latitude: number(),
  longitude: number(),
  weight: number(),
});

export const RNHeatmapGradientValidator = object({
  colors: array(string()),
  startPoints: array(number()),
  colorMapSize: number(),
});

export const RNHeatmapValidator = object({
  id: string(),
  pressable: optional(boolean()),
  zIndex: optional(number()),
  weightedData: array(RNHeatmapPointValidator),
  radius: optional(number()),
  opacity: optional(number()),
  gradient: optional(RNHeatmapGradientValidator),
});

export const RNKMLayerValidator = object({
  id: string(),
  kmlString: string(),
});

export const RNIndoorLevelValidator = object({
  index: number(),
  name: optional(string()),
  shortName: optional(string()),
  active: optional(boolean()),
});

export const RNIndoorBuildingValidator = object({
  activeLevelIndex: optional(number()),
  defaultLevelIndex: optional(number()),
  levels: array(RNIndoorLevelValidator),
  underground: optional(boolean()),
});

const RNAndroidLocationConfigValidator = object({
  priority: optional(enums(enumValues(RNAndroidLocationPriority))),
  interval: optional(number()),
  minUpdateInterval: optional(number()),
});

export const RNIOSLocationConfigValidator = object({
  desiredAccuracy: optional(enums(enumValues(RNIOSLocationAccuracy))),
  distanceFilterMeters: optional(number()),
});

export const RNLocationConfigValidator = object({
  android: optional(RNAndroidLocationConfigValidator),
  ios: optional(RNIOSLocationConfigValidator),
});

export const RNLocationPermissionResultValidator = object({
  android: optional(enums(enumValues(RNAndroidLocationPermissionResult))),
  ios: optional(enums(enumValues(RNIOSPermissionResult))),
});

export const RNLocationValidator = object({
  center: RNLatLngValidator,
  bearing: number(),
});

export const RNLocationErrorCodeStructValidator = optional(
  enums(enumValues(RNLocationErrorCode))
);

export const RNMapErrorCodeStructValidator = optional(
  enums(enumValues(RNMapErrorCode))
);

export const RNMapStylerValidator = object({
  color: optional(string()),
  visibility: optional(string()),
  weight: optional(number()),
  gamma: optional(number()),
  lightness: optional(number()),
  saturation: optional(number()),
  invert_lightness: optional(boolean()),
});

export const RNMapStyleElementValidator = object({
  featureType: optional(string()),
  elementType: optional(string()),
  stylers: array(RNMapStylerValidator),
});

export const RNBasicMapConfigValidator = object({
  initialProps: optional(
    object({
      mapId: optional(string()),
      liteMode: optional(boolean()),
      camera: optional(RNCameraValidator),
    })
  ),
  uiSettings: optional(RNMapUiSettingsValidator),
  myLocationEnabled: optional(boolean()),
  buildingEnabled: optional(boolean()),
  trafficEnabled: optional(boolean()),
  indoorEnabled: optional(boolean()),
  customMapStyle: optional(string()),
  userInterfaceStyle: optional(RNUserInterfaceStyleValidator),
  mapZoomConfig: optional(RNMapZoomConfigValidator),
  mapPadding: optional(RNMapPaddingValidator),
  mapType: optional(RNMapTypeValidator),
  locationConfig: optional(RNLocationConfigValidator),
});

const schema: any = (RNBasicMapConfigValidator as any).schema;

if (schema.mapType?.type === 'union' && !schema.mapType._schema) {
  schema.mapType._schema = [
    { type: 'literal', schema: 'none' },
    { type: 'literal', schema: 'normal' },
    { type: 'literal', schema: 'hybrid' },
    { type: 'literal', schema: 'satellite' },
    { type: 'literal', schema: 'terrain' },
  ];
}

if (
  schema.userInterfaceStyle?.type === 'union' &&
  !schema.userInterfaceStyle._schema
) {
  schema.userInterfaceStyle._schema = [
    { type: 'literal', schema: 'light' },
    { type: 'literal', schema: 'dark' },
    { type: 'literal', schema: 'default' },
  ];
}

export type RNBasicMapConfigType =
  typeof RNBasicMapConfigValidator extends Struct<infer O, any> ? O : never;
