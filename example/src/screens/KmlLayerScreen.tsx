import React, { useRef } from 'react';
import MapWrapper from '../components/MapWrapper';
import { kmlString } from '../utils/kmlData';
import type { GoogleMapsViewRef } from 'react-native-google-maps-plus';

export default function KmlLayerScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);

  const kmlLayers = [{ id: '21', zIndex: 1, kmlString }];
  return <MapWrapper mapRef={mapRef} kmlLayers={kmlLayers} />;
}
