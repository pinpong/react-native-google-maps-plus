/**
 * Traffic at night
 *
 * The live traffic layer on the native dark map style. `userInterfaceStyle`
 * switches the map between light and dark, or follows the system.
 *
 * @alt Live traffic on downtown San Francisco streets in dark mode
 * @props trafficEnabled, userInterfaceStyle
 */
import React from 'react';

import { GoogleMapsView } from 'react-native-google-maps-plus';

import { ll } from './shared';

export default function TrafficAtNight() {
  return (
    <GoogleMapsView
      style={{ flex: 1 }}
      mapOptions={{
        backgroundColor: '#1b1e24',
        camera: { center: ll(37.7815, -122.4075), zoom: 13.4 },
      }}
      userInterfaceStyle="dark"
      trafficEnabled
    />
  );
}
