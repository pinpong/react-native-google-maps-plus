import React, { useRef } from 'react';

import ControlPanel from '@src/components/ControlPanel';
import MapWrapper from '@src/components/MapWrapper';

import type { GoogleMapsViewRef } from 'react-native-google-maps-plus';

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
