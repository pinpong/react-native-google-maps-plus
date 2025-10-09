import React, { useRef } from 'react';
import MapWrapper from '../components/MapWrapper';
import { makePolyline } from '../utils/mapGenerators';
import type { GoogleMapsViewRef } from 'react-native-google-maps-plus';

export default function PolylinesScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const polylines = [makePolyline(1)];
  return <MapWrapper mapRef={mapRef} polylines={polylines} />;
}
