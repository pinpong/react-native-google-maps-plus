import React, { useRef } from 'react';
import MapWrapper from '../components/MapWrapper';
import type { GoogleMapsViewRef } from 'react-native-google-maps-plus';
import ControlPanel from '../components/ControlPanel';

export default function BasicMapScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);

  return (
    <MapWrapper mapRef={mapRef}>
      <ControlPanel mapRef={mapRef} buttons={[]} />
    </MapWrapper>
  );
}
