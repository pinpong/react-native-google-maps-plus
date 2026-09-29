import React, { useRef } from 'react';

import ControlPanel from '@src/components/ControlPanel';
import MapWrapper from '@src/components/MapWrapper';
import { SF_CENTER } from '@src/utils/mapUtils';

import type {
  GoogleMapsViewRef,
  RNInitialProps,
} from 'react-native-google-maps-plus';

const initialProps: RNInitialProps = {
  mapId: 'DEMO_MAP_ID',
  camera: {
    center: SF_CENTER,
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
