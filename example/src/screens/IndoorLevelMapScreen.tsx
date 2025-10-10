import React, { useRef } from 'react';
import MapWrapper from '../components/MapWrapper';
import type { GoogleMapsViewRef } from 'react-native-google-maps-plus';
import ControlPanel from '../components/ControlPanel';

export default function IndoorLevelMapScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  return (
    <MapWrapper
      mapRef={mapRef}
      initialProps={{
        camera: {
          center: {
            latitude: 37.617596832174385,
            longitude: -122.38253440707922,
          },
          zoom: 18,
        },
      }}
      indoorEnabled={true}
      buildingEnabled={true}
    >
      <ControlPanel mapRef={mapRef} buttons={[]} />
    </MapWrapper>
  );
}
