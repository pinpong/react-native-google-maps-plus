import React, { useRef } from 'react';
import MapWrapper from '../components/MapWrapper';
import { makePolygon } from '../utils/mapGenerators';
import type { GoogleMapsViewRef } from 'react-native-google-maps-plus';

export default function PolygonsScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);

  const polygons = [makePolygon(1)];
  return <MapWrapper mapRef={mapRef} polygons={polygons} />;
}
