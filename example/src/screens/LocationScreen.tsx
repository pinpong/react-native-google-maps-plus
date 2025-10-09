import React, { useRef } from 'react';
import MapWrapper from '../components/MapWrapper';
import ControlPanel from '../components/ControlPanel';
import type { GoogleMapsViewRef } from 'react-native-google-maps-plus';

export default function LocationScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);

  return (
    <MapWrapper mapRef={mapRef} myLocationEnabled>
      <ControlPanel mapRef={mapRef} buttons={[]} />
    </MapWrapper>
  );
}
