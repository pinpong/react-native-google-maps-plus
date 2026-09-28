import React, { useCallback, useMemo, useRef, useState } from 'react';

import Supercluster from 'react-native-clusterer';

import ControlPanel from '@src/components/ControlPanel';
import MapWrapper from '@src/components/MapWrapper';
import { gridCoordinates, makeSvgIcon } from '@src/utils/mapGenerators';
import { rnRegionToRegion } from '@src/utils/mapUtils';

import type { Supercluster as SuperclusterTypes } from 'react-native-clusterer';
import type {
  GoogleMapsViewRef,
  RNMarker,
  RNMarkerSvg,
  RNRegion,
} from 'react-native-google-maps-plus';

export default function ClusteringScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const [coordinates] = useState(
    Array.from({ length: 500 }, (_, i) =>
      gridCoordinates(i, 25, 37.8549, -122.5194, 0.008)
    )
  );

  const [region, setRegion] = useState<RNRegion | null>(null);

  const mapDimensions = useMemo(() => ({ width: 400, height: 800 }), []);

  const data = useMemo<
    Array<
      SuperclusterTypes.PointFeature<{
        id: string;
        svgIcon: RNMarkerSvg;
      }>
    >
  >(
    () =>
      coordinates.map((e, i) => {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [e.longitude, e.latitude],
          },
          properties: {
            id: `sf-${i}`,
            svgIcon: {
              width: 32,
              height: 44,
              svgString: makeSvgIcon(64, 88, 'red'),
            },
          },
        };
      }),
    [coordinates]
  );

  const clusterRegion = useMemo(() => rnRegionToRegion(region), [region]);

  const clusterOptions = useMemo(
    () => ({ radius: 60, maxZoom: 16, minZoom: 0 }),
    []
  );

  const supercluster = useMemo(
    () => new Supercluster(clusterOptions).load(data),
    [clusterOptions, data]
  );

  const points = useMemo(
    () => supercluster.getClustersFromRegion(clusterRegion, mapDimensions),
    [supercluster, clusterRegion, mapDimensions]
  );

  const markers: RNMarker[] = useMemo(() => {
    return points.map((feature) => {
      const [lng, lat] = feature.geometry.coordinates as [number, number];
      const isCluster = 'cluster' in feature.properties;
      const id = isCluster
        ? `cluster-${feature.properties.cluster_id}`
        : feature.properties.id;
      const count = feature.properties?.point_count ?? 0;

      const icon = isCluster
        ? {
            width: 64,
            height: 64,
            svgString: `
<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <circle cx="32" cy="32" r="16" fill="#7C4DFF" stroke="#FFFFFF" stroke-width="4" />
  <text
    x="32"
    y="32"
    font-family="Roboto-Bold"
    font-size="11"
    text-anchor="middle"
    dominant-baseline="central"
    fill="#fff"
  >
    ${count}
  </text>
</svg>
`,
          }
        : feature.properties.svgIcon;

      return {
        id,
        coordinate: { latitude: lat, longitude: lng },
        iconSvg: icon,
      } as RNMarker;
    });
  }, [points]);

  const handleMapLoaded = useCallback((r: RNRegion) => setRegion(r), []);

  const handleCameraChange = useCallback((r: RNRegion) => setRegion(r), []);

  return (
    <MapWrapper
      mapRef={mapRef}
      markers={markers}
      onMapLoaded={handleMapLoaded}
      onCameraChange={handleCameraChange}
    >
      <ControlPanel viewRef={mapRef} buttons={[]} />
    </MapWrapper>
  );
}
