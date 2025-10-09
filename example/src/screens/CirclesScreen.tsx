import React, { useRef } from 'react';
import MapWrapper from '../components/MapWrapper';
import { makeCircle } from '../utils/mapGenerators';
import type { GoogleMapsViewRef } from 'react-native-google-maps-plus';

export default function CirclesScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const circles = [makeCircle(1)];
  return <MapWrapper mapRef={mapRef} circles={circles} />;
}
