import type { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  Blank: undefined;
  BasicMap: undefined;
  Markers: undefined;
  SvgMarkers: undefined;
  Polygons: undefined;
  Polylines: undefined;
  Circles: undefined;
  Heatmap: undefined;
  KmlLayer: undefined;
  UrlTileOverlay: undefined;
  Location: undefined;
  CustomStyle: undefined;
  IndoorLevelMap: undefined;
  Camera: undefined;
  Snapshot: undefined;
  Clustering: undefined;
  Stress: undefined;
};

export type RootNavigationProp = StackNavigationProp<RootStackParamList>;
