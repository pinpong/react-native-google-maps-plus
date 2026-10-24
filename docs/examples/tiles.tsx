/**
 * Data tiles
 *
 * Land surface temperature from NASA GIBS as a URL tile overlay on top of the
 * map. The URL template takes `{x}`, `{y}` and `{z}`.
 *
 * @alt Land surface temperature over California as a colored tile overlay
 * @props urlTileOverlays
 */
import React from 'react';

import { GoogleMapsView } from 'react-native-google-maps-plus';

import { lightStyle, ll } from './shared';

// NASA GIBS, public domain. This layer goes up to zoom level 7.
const landSurfaceTemperature =
  'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_Land_Surface_Temp_Day/default/2024-07-15/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png';

export default function DataTiles() {
  return (
    <GoogleMapsView
      style={{ flex: 1 }}
      customMapStyle={lightStyle}
      mapOptions={{ camera: { center: ll(37.3, -119.6), zoom: 5.1 } }}
      urlTileOverlays={[
        {
          id: 'land-surface-temperature',
          url: landSurfaceTemperature,
          tileSize: 256,
          opacity: 0.75,
        },
      ]}
    />
  );
}
