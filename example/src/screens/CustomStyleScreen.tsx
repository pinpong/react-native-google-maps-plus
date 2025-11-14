import React, { useMemo, useRef, useState } from 'react';

import ControlPanel from '@src/components/ControlPanel';
import MapWrapper from '@src/components/MapWrapper';
import { silverMapStyle, standardMapStyle } from '@src/data/mapStylesData';

import type { GoogleMapsViewRef } from 'react-native-google-maps-plus';

export default function CustomStyleScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);

  const [normalStyle, setNormalStyle] = useState(true);
  const customMapStyle = useMemo(
    () => JSON.stringify(normalStyle ? standardMapStyle : silverMapStyle),
    [normalStyle]
  );

  const buttons = useMemo(
    () => [
      {
        title: `Style: ${normalStyle ? 'Normal' : 'Standard'}`,
        onPress: () => setNormalStyle(!normalStyle),
      },
    ],
    [normalStyle]
  );

  return (
    <MapWrapper mapRef={mapRef} customMapStyle={customMapStyle}>
      <ControlPanel mapRef={mapRef} buttons={buttons} />
    </MapWrapper>
  );
}
