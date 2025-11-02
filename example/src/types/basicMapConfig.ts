import type {
  RNCameraUpdate,
  RNLocationConfig,
  RNMapPadding,
  RNMapType,
  RNMapUiSettings,
  RNMapZoomConfig,
  RNUserInterfaceStyle,
} from 'react-native-google-maps-plus';

export type RNBasicMapConfig = {
  initialProps?: {
    mapId?: string;
    liteMode?: boolean;
    camera?: RNCameraUpdate;
    backgroundColor?: string;
  };
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
  locationConfig?: RNLocationConfig;
};
