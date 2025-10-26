import React, { useRef, useState, useMemo } from 'react';
import MapWrapper from '../components/MapWrapper';
import ControlPanel from '../components/ControlPanel';
import type {
  GoogleMapsViewRef,
  RNMarker,
  RNMarkerSvg,
  RNRegion,
} from 'react-native-google-maps-plus';
import type { Supercluster } from 'react-native-clusterer';
import { useClusterer } from 'react-native-clusterer';
import { randomCoordinates } from '../utils/mapGenerators';
import { rnRegionToRegion } from '../utils/mapUtils';

export default function ClusteringScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const [coordinates] = useState(
    Array.from({ length: 500 }, () =>
      randomCoordinates(37.7749, -122.4194, 0.2)
    )
  );

  const [region, setRegion] = useState<RNRegion | null>(null);

  const mapDimensions = useMemo(() => ({ width: 400, height: 800 }), []);

  const data = useMemo<
    Array<
      Supercluster.PointFeature<{
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
              svgString: `
            <svg xmlns="http://www.w3.org/2000/svg" width="66" height="88" viewBox="0 0 64 88">
              <path
                d="M32 2c-14.36 0-26 11.64-26 26 0 18.2 20.67 38.86 24.82 43.02a1.7 1.7 0 0 0 2.36 0C37.33 66.86 58 46.2 58 28 58 13.64 46.36 2 32 2z"
                fill="red"
              />
              <circle cx="32" cy="28" r="10" fill="#FFFFFF" />
              <ellipse cx="32" cy="82" rx="14" ry="4" fill="#000000" opacity="0.15" />
            </svg>
          `,
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

  const [points] = useClusterer(
    data,
    mapDimensions,
    clusterRegion,
    clusterOptions
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
            width: 36,
            height: 36,
            svgString: `<svg viewBox="0 0 64 64" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="28" fill="#7C4DFF"/>
            <text x="32" y="40" text-anchor="middle" font-size="22" font-family="Arial" fill="#fff" font-weight="bold">
              ${count}
            </text>
          </svg>`,
          }
        : feature.properties.svgIcon;

      return {
        id,
        coordinate: { latitude: lat, longitude: lng },
        iconSvg: icon,
      } as RNMarker;
    });
  }, [points]);

  return (
    <MapWrapper
      mapRef={mapRef}
      markers={markers}
      onMapLoaded={(r: RNRegion) => setRegion(r)}
      onCameraChange={(r: RNRegion) => setRegion(r)}
    >
      <ControlPanel mapRef={mapRef} buttons={[]} />
    </MapWrapper>
  );
}
