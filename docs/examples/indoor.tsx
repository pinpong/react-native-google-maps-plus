/**
 * Indoor maps
 *
 * The indoor floor plan of San Francisco International Airport with the level
 * picker of the Maps SDK.
 *
 * @alt The indoor map of a terminal at San Francisco International Airport with the level picker
 * @props indoorEnabled, uiSettings
 */
import React from 'react';

import { GoogleMapsView } from 'react-native-google-maps-plus';

import { ll } from './shared';

export default function IndoorMaps() {
  return (
    <GoogleMapsView
      style={{ flex: 1 }}
      mapOptions={{ camera: { center: ll(37.6176, -122.3825), zoom: 18 } }}
      indoorEnabled
      uiSettings={{ indoorLevelPickerEnabled: true }}
    />
  );
}
