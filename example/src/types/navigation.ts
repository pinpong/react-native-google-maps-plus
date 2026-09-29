import type { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  Blank: undefined;
  BasicMap: undefined;
  MapId: undefined;
  ScrollView: undefined;
  Markers: undefined;
  SvgMarkers: undefined;
  AdvancedMarkers: undefined;
  SvgTextMarkers: undefined;
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
  StreetView: undefined;
  Module: undefined;
  DocsExamples: undefined;
  DocsExample: { id: string; capture?: boolean };
};

export type RootNavigationProp = StackNavigationProp<RootStackParamList>;
