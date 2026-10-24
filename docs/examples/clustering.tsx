/**
 * Clustering
 *
 * 500 points grouped on a screen grid of 70 dp. The clusters are recomputed
 * when the camera stops moving and drawn as SVG bubbles sized by their count.
 * For larger data sets a library like react-native-clusterer does the same.
 *
 * @alt Cluster bubbles with point counts and single points over San Francisco
 * @props markers, onMapLoaded, onCameraChangeComplete
 */
import React, { useMemo, useState } from 'react';

import {
  GoogleMapsView,
  type RNCamera,
  type RNLatLng,
  type RNMarker,
  type RNRegion,
} from 'react-native-google-maps-plus';
import { callback } from 'react-native-nitro-modules';

import { BOLD, GREEN, lightStyle, ll, pinZ, seeded, svg } from './shared';

const rand = seeded(3);
const points = Array.from({ length: 500 }, () =>
  ll(37.73 + rand() * 0.075, -122.47 + rand() * 0.1)
);

const pointIcon = svg(
  18,
  18,
  `<circle cx="9" cy="9" r="7" fill="${GREEN}" stroke="#ffffff" stroke-width="2.5"/>`
);

function clusterIcon(count: number) {
  const r = Math.min(30, 14 + Math.sqrt(count) * 1.6);
  const s = Math.ceil(r * 2 + 8);
  return svg(
    s,
    s,
    `<circle cx="${s / 2}" cy="${s / 2}" r="${r + 3}" fill="${GREEN}" opacity="0.25"/>
     <circle cx="${s / 2}" cy="${s / 2}" r="${r}" fill="${GREEN}" stroke="#ffffff" stroke-width="2.5"/>
     <text x="${s / 2}" y="${s / 2 + 0.5}" text-anchor="middle" dominant-baseline="central" font-size="13" ${BOLD} fill="#ffffff">${count}</text>`
  );
}

// Groups the points into grid cells of cellDp at the given zoom.
function cluster(all: RNLatLng[], zoom: number, cellDp = 70) {
  const cell = (cellDp / 256) * (360 / 2 ** zoom);
  const cells = new Map<string, RNLatLng[]>();
  for (const p of all) {
    const latCell = cell * Math.cos((p.latitude * Math.PI) / 180);
    const key = `${Math.floor(p.longitude / cell)}:${Math.floor(p.latitude / latCell)}`;
    cells.set(key, [...(cells.get(key) ?? []), p]);
  }
  return [...cells.entries()].map(([key, members]) => ({
    key,
    count: members.length,
    center: ll(
      members.reduce((sum, p) => sum + p.latitude, 0) / members.length,
      members.reduce((sum, p) => sum + p.longitude, 0) / members.length
    ),
  }));
}

export default function Clustering() {
  const [zoom, setZoom] = useState<number>();

  const onCamera = useMemo(
    () => callback((_: RNRegion, camera: RNCamera) => setZoom(camera.zoom)),
    []
  );

  const markers = useMemo<RNMarker[]>(() => {
    if (zoom === undefined) return [];
    return cluster(points, zoom).map(({ key, count, center }) => ({
      id: `${Math.round(zoom)}-${key}`,
      coordinate: center,
      anchor: { x: 0.5, y: 0.5 },
      iconSvg: count > 1 ? clusterIcon(count) : pointIcon,
      zIndex: pinZ(center) + count,
    }));
  }, [zoom]);

  return (
    <GoogleMapsView
      style={{ flex: 1 }}
      customMapStyle={lightStyle}
      mapOptions={{ camera: { center: ll(37.7675, -122.42), zoom: 11.6 } }}
      onMapLoaded={onCamera}
      onCameraChangeComplete={onCamera}
      markers={markers}
    />
  );
}
