import React, { useRef, useState } from 'react';

import MapWrapper from '@src/components/MapWrapper';
import { svgTextMarkers } from '@src/data/svgTextMarkersData';

import type {
  GoogleMapsViewRef,
  RNMarker,
} from 'react-native-google-maps-plus';

const TOP = 37.7845;
const LEFT = -122.42365;
const ROW_SPACING = 0.00234;
const COLUMN_SPACING = 0.0085;

export default function SvgTextMarkersScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);

  const [markers] = useState<RNMarker[]>(() =>
    svgTextMarkers.map((marker, i) => ({
      id: i.toString(),
      zIndex: i,
      coordinate: {
        latitude: TOP - Math.floor(i / 2) * ROW_SPACING,
        longitude: LEFT + (i % 2) * COLUMN_SPACING,
      },
      title: marker.title,
      snippet: marker.snippet,
      iconSvg: {
        width: marker.width ?? 140,
        height: marker.height ?? 44,
        svgString: marker.svg,
      },
    }))
  );

  return (
    <MapWrapper
      mapRef={mapRef}
      markers={markers}
      mapOptions={{
        camera: {
          center: { latitude: 37.7755, longitude: -122.4194 },
          zoom: 14.6,
        },
      }}
    />
  );
}
