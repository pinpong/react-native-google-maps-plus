/**
 * Street View
 *
 * A Street View panorama at Fort Point, looking at the Golden Gate Bridge.
 *
 * @alt Street View panorama at Fort Point with the Golden Gate Bridge
 * @props GoogleMapsStreetView
 */
import React from 'react';

import { GoogleMapsStreetView } from 'react-native-google-maps-plus';

export default function StreetView() {
  return (
    <GoogleMapsStreetView
      style={{ flex: 1 }}
      panoramaOptions={{
        position: { latitude: 37.8090233, longitude: -122.4742005 },
        camera: { bearing: 315, tilt: 0, zoom: 0 },
      }}
    />
  );
}
