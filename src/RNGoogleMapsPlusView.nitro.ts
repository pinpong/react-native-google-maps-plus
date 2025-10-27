import type {
  HybridView,
  HybridViewMethods,
  HybridViewProps,
} from 'react-native-nitro-modules';
import type {
  RNCamera,
  RNLatLng,
  RNMapPadding,
  RNPolygon,
  RNPolyline,
  RNUserInterfaceStyle,
  RNLocationErrorCode,
  RNMarker,
  RNLocationPermissionResult,
  RNRegion,
  RNLocation,
  RNMapErrorCode,
  RNMapType,
  RNInitialProps,
  RNCircle,
  RNMapUiSettings,
  RNLocationConfig,
  RNMapZoomConfig,
  RNHeatmap,
  RNKMLayer,
  RNIndoorBuilding,
  RNIndoorLevel,
  RNLatLngBounds,
  RNSnapshotOptions,
  RNUrlTileOverlay,
} from './types';

export interface RNGoogleMapsPlusViewProps extends HybridViewProps {
  initialProps?: RNInitialProps;
  uiSettings?: RNMapUiSettings;
  myLocationEnabled?: boolean;
  buildingEnabled?: boolean;
  trafficEnabled?: boolean;
  indoorEnabled?: boolean;
  customMapStyle?: string;
  userInterfaceStyle?: RNUserInterfaceStyle;
  mapZoomConfig?: RNMapZoomConfig;
  mapPadding?: RNMapPadding;
  mapType?: RNMapType;
  markers?: RNMarker[];
  polygons?: RNPolygon[];
  polylines?: RNPolyline[];
  circles?: RNCircle[];
  heatmaps?: RNHeatmap[];
  kmlLayers?: RNKMLayer[];
  urlTileOverlays?: RNUrlTileOverlay[];
  locationConfig?: RNLocationConfig;
  onMapError?: (error: RNMapErrorCode) => void;
  onMapReady?: (ready: boolean) => void;
  onMapLoaded?: (region: RNRegion, camera: RNCamera) => void;
  onLocationUpdate?: (location: RNLocation) => void;
  onLocationError?: (error: RNLocationErrorCode) => void;
  onMapPress?: (coordinate: RNLatLng) => void;
  onMapLongPress?: (coordinate: RNLatLng) => void;
  onPoiPress?: (placeId: string, name: string, coordinate: RNLatLng) => void;
  onMarkerPress?: (id: string) => void;
  onPolylinePress?: (id: string) => void;
  onPolygonPress?: (id: string) => void;
  onCirclePress?: (id: string) => void;
  onMarkerDragStart?: (id: string, location: RNLatLng) => void;
  onMarkerDrag?: (id: string, location: RNLatLng) => void;
  onMarkerDragEnd?: (id: string, location: RNLatLng) => void;
  onIndoorBuildingFocused?: (indoorBuilding: RNIndoorBuilding) => void;
  onIndoorLevelActivated?: (indoorLevel: RNIndoorLevel) => void;
  onInfoWindowPress?: (id: string) => void;
  onInfoWindowClose?: (id: string) => void;
  onInfoWindowLongPress?: (id: string) => void;
  onMyLocationPress?: (location: RNLocation) => void;
  onMyLocationButtonPress?: (pressed: boolean) => void;
  onCameraChangeStart?: (
    region: RNRegion,
    camera: RNCamera,
    isGesture: boolean
  ) => void;
  onCameraChange?: (
    region: RNRegion,
    camera: RNCamera,
    isGesture: boolean
  ) => void;
  onCameraChangeComplete?: (
    region: RNRegion,
    camera: RNCamera,
    isGesture: boolean
  ) => void;
}

export interface RNGoogleMapsPlusViewMethods extends HybridViewMethods {
  showMarkerInfoWindow(id: string): void;

  hideMarkerInfoWindow(id: string): void;

  setCamera(camera: RNCamera, animated?: boolean, durationMs?: number): void;

  setCameraToCoordinates(
    coordinates: RNLatLng[],
    padding?: RNMapPadding,
    animated?: boolean,
    durationMs?: number
  ): void;

  setCameraBounds(bounds?: RNLatLngBounds): void;

  animateToBounds(
    bounds: RNLatLngBounds,
    padding?: number,
    durationMs?: number,
    lockBounds?: boolean
  ): void;

  snapshot(options: RNSnapshotOptions): Promise<string | undefined>;

  showLocationDialog(): void;

  openLocationSettings(): void;

  requestLocationPermission(): Promise<RNLocationPermissionResult>;

  isGooglePlayServicesAvailable(): boolean;
}

export type RNGoogleMapsPlusView = HybridView<
  RNGoogleMapsPlusViewProps,
  RNGoogleMapsPlusViewMethods
>;
