import React, { useEffect, useMemo, useRef, useState } from 'react';
import MapWrapper from '../components/MapWrapper';
import ControlPanel from '../components/ControlPanel';
import { makeRandomMarkerForStressTest } from '../utils/mapGenerators';
import type {
  GoogleMapsViewRef,
  RNMarker,
} from 'react-native-google-maps-plus';

export default function StressTestScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const [stressTest, setStressTest] = useState(false);
  const [markers, setMarkers] = useState<RNMarker[]>([]);

  useEffect(() => {
    if (!stressTest) return;
    const interval = setInterval(() => {
      setMarkers((m) => {
        const next = [...m];
        while (next.length > 100) next.shift();
        for (let i = 0; i < 500; i++)
          next.push(makeRandomMarkerForStressTest(next.length + 1));
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [stressTest]);

  const buttons = useMemo(
    () => [
      {
        title: stressTest ? 'Stop stress test' : 'Start stress test',
        onPress: () => setStressTest(!stressTest),
      },
      {
        title: 'Fit to markers',
        onPress: () => {
          const coords = markers.map((m) => m.coordinate);
          if (coords.length)
            mapRef.current?.setCameraToCoordinates(
              coords,
              { top: 50, left: 50, bottom: 50, right: 50 },
              true,
              300
            );
        },
      },
      {
        title: 'Marker +1',
        onPress: () =>
          setMarkers((m) => [
            ...m,
            makeRandomMarkerForStressTest(m.length + 1),
          ]),
      },
      {
        title: 'Marker -1',
        onPress: () => setMarkers((m) => m.slice(0, Math.max(0, m.length - 1))),
      },
    ],
    [markers, stressTest]
  );

  return (
    <MapWrapper mapRef={mapRef} markers={markers}>
      <ControlPanel mapRef={mapRef} buttons={buttons} />
    </MapWrapper>
  );
}
