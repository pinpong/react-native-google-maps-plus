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
  locationConfig?: RNLocationConfig;
  onMapError?: (error: RNMapErrorCode) => void;
  onMapReady?: (ready: boolean) => void;
  onLocationUpdate?: (location: RNLocation) => void;
  onLocationError?: (error: RNLocationErrorCode) => void;
  onMapPress?: (coordinate: RNLatLng) => void;
  onMarkerPress?: (id?: string | undefined) => void;
  onPolylinePress?: (id?: string | undefined) => void;
  onPolygonPress?: (id?: string | undefined) => void;
  onCirclePress?: (id?: string | undefined) => void;
  onMarkerDragStart?: (id: string | undefined, location: RNLatLng) => void;
  onMarkerDrag?: (id: string | undefined, location: RNLatLng) => void;
  onMarkerDragEnd?: (id: string | undefined, location: RNLatLng) => void;
  onIndoorBuildingFocused?: (indoorBuilding: RNIndoorBuilding) => void;
  onIndoorLevelActivated?: (indoorLevel: RNIndoorLevel) => void;
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
  setCamera(camera: RNCamera, animated?: boolean, durationMS?: number): void;

  setCameraToCoordinates(
    coordinates: RNLatLng[],
    padding?: RNMapPadding,
    animated?: boolean,
    durationMS?: number
  ): void;

  showLocationDialog(): void;

  openLocationSettings(): void;

  requestLocationPermission(): Promise<RNLocationPermissionResult>;

  isGooglePlayServicesAvailable(): boolean;
}

export type RNGoogleMapsPlusView = HybridView<
  RNGoogleMapsPlusViewProps,
  RNGoogleMapsPlusViewMethods
>;
