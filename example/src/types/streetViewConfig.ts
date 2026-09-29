import type {
  RNLocationConfig,
  RNPanoramaOptions,
  RNStreetViewUiSettings,
} from 'react-native-google-maps-plus';

export type RNStreetViewConfig = {
  panoramaOptions?: RNPanoramaOptions;
  uiSettings?: RNStreetViewUiSettings;
  locationConfig?: RNLocationConfig;
};
