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

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
