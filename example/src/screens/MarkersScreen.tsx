import React, { useMemo, useRef, useState } from 'react';
import MapWrapper from '../components/MapWrapper';
import ControlPanel from '../components/ControlPanel';
import { makeMarker } from '../utils/mapGenerators';
import type {
  GoogleMapsViewRef,
  RNMarker,
} from 'react-native-google-maps-plus';

export default function MarkersScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const [markers, setMarkers] = useState<RNMarker[]>(
    Array.from({ length: 2 }, (_, i) => makeMarker(i + 1))
  );

  const buttons = useMemo(
    () => [
      {
        title: 'Marker +1',
        onPress: () => setMarkers((m) => [...m, makeMarker(m.length + 1)]),
      },
      {
        title: 'Marker -1',
        onPress: () => setMarkers((m) => m.slice(0, Math.max(0, m.length - 1))),
      },
      {
        title: 'Fit to markers',
        onPress: () => {
          const coords = markers.map((m) => m.coordinate);
          mapRef.current?.setCameraToCoordinates(
            coords,
            { top: 0, left: 0, bottom: 0, right: 0 },
            true,
            300
          );
        },
      },
    ],
    [markers]
  );

  return (
    <MapWrapper mapRef={mapRef} markers={markers}>
      <ControlPanel mapRef={mapRef} buttons={buttons} />
    </MapWrapper>
  );
}
