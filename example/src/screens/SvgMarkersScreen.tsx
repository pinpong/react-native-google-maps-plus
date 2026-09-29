import React, { useRef, useState } from 'react';

import MapWrapper from '@src/components/MapWrapper';
import {
  svgAspectMarkers,
  svgInfoWindowRemoteImage,
  svgMarkers,
  svgStarIcon,
  svgViewBoxMarkers,
} from '@src/data/svgMarkersData';
import type { SvgMarker } from '@src/data/svgMarkersData';
import { gridCoordinates } from '@src/utils/mapGenerators';
import { SF_CENTER } from '@src/utils/mapUtils';

import type {
  GoogleMapsViewRef,
  RNMarker,
} from 'react-native-google-maps-plus';

const COLUMNS = 5;
const SPACING = 0.004;
const GRID_TOP = SF_CENTER.latitude + 0.01;
const GRID_LEFT = SF_CENTER.longitude - Math.floor(COLUMNS / 2) * SPACING;
const ASPECT_GRID_TOP = GRID_TOP - 0.0016;

const toMarker = (
  marker: SvgMarker,
  index: number,
  top = GRID_TOP
): RNMarker => ({
  id: index.toString(),
  zIndex: index,
  coordinate: gridCoordinates(index, COLUMNS, top, GRID_LEFT, SPACING),
  title: marker.title,
  snippet: marker.snippet,
  iconSvg: {
    width: marker.width ?? 64,
    height: marker.height ?? 64,
    svgString: marker.svg,
  },
});

export default function SvgMarkersScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);

  const [markers] = useState<RNMarker[]>(() => [
    ...svgMarkers.map((marker, i) => toMarker(marker, i)),
    {
      id: 'info-window-remote-image',
      zIndex: svgMarkers.length,
      coordinate: gridCoordinates(
        svgMarkers.length,
        COLUMNS,
        GRID_TOP,
        GRID_LEFT,
        SPACING
      ),
      iconSvg: { width: 64, height: 64, svgString: svgStarIcon },
      infoWindowIconSvg: {
        width: 200,
        height: 72,
        svgString: svgInfoWindowRemoteImage,
      },
    },
    ...svgViewBoxMarkers.map((marker, i) =>
      toMarker(marker, svgMarkers.length + 1 + i)
    ),
    ...svgAspectMarkers.map((marker, i) =>
      toMarker(
        marker,
        svgMarkers.length + 1 + svgViewBoxMarkers.length + i,
        ASPECT_GRID_TOP
      )
    ),
  ]);

  return (
    <MapWrapper
      mapRef={mapRef}
      markers={markers}
      initialProps={{
        camera: {
          center: { ...SF_CENTER, latitude: SF_CENTER.latitude + 0.0006 },
          zoom: 14.6,
        },
      }}
    />
  );
}
