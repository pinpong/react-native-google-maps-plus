import React, { useRef } from 'react';

import ControlPanel from '@src/components/ControlPanel';
import MapWrapper from '@src/components/MapWrapper';

import type {
  GoogleMapsViewRef,
  RNInitialProps,
} from 'react-native-google-maps-plus';

const initialProps: RNInitialProps = {
  mapId: 'DEMO_MAP_ID',
  camera: {
    center: { latitude: 37.7749, longitude: -122.4194 },
    zoom: 12,
  },
};

export default function MapIdScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);

  return (
    <MapWrapper mapRef={mapRef} initialProps={initialProps}>
      <ControlPanel viewRef={mapRef} buttons={[]} />
    </MapWrapper>
  );
}
