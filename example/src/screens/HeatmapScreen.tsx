import React, { useRef } from 'react';
import MapWrapper from '../components/MapWrapper';
import { makeHeatmap } from '../utils/mapGenerators';
import type { GoogleMapsViewRef } from 'react-native-google-maps-plus';

export default function HeatmapScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const heatmaps = [makeHeatmap(1)];
  return <MapWrapper mapRef={mapRef} heatmaps={heatmaps} />;
}
