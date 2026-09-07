import React, { useCallback, useRef, useState } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import ControlPanel from '@src/components/ControlPanel';
import MapWrapper from '@src/components/MapWrapper';
import { useAppTheme } from '@src/hooks/useAppTheme';
import { makeMarker, makeSvgIcon } from '@src/utils/mapGenerators';

import type {
  GoogleMapsViewRef,
  RNInitialProps,
  RNMapCapabilities,
  RNMarker,
  RNMarkerCollisionBehavior,
} from 'react-native-google-maps-plus';

const CENTER = { latitude: 37.7749, longitude: -122.4194 };

const initialProps: RNInitialProps = {
  mapId: 'DEMO_MAP_ID',
  camera: {
    center: CENTER,
    zoom: 19,
  },
};

function makeAdvancedMarker(
  id: number,
  label: string,
  color: string,
  latitudeOffset: number,
  longitudeOffset: number,
  collisionBehavior: RNMarkerCollisionBehavior,
  zIndex: number
): RNMarker {
  return {
    ...makeMarker(id),
    zIndex,
    coordinate: {
      latitude: CENTER.latitude + latitudeOffset,
      longitude: CENTER.longitude + longitudeOffset,
    },
    title: collisionBehavior,
    snippet: `zIndex: ${zIndex}`,
    draggable: false,
    iconSvg: {
      width: 52,
      height: 64,
      svgString: makeSvgIcon(52, 64, color, label),
    },
    infoWindowIconSvg: undefined,
    advanced: true,
    advancedOptions: {
      collisionBehavior,
    },
  };
}

const markers: RNMarker[] = [
  makeAdvancedMarker(
    1,
    'R',
    '#D93025',
    0,
    -0.00018,
    'required-and-hides-optional',
    1
  ),
  makeAdvancedMarker(
    2,
    'H',
    '#1A73E8',
    0,
    0.00018,
    'required-and-hides-optional',
    2
  ),
  makeAdvancedMarker(
    3,
    '1',
    '#188038',
    0.00018,
    0.00008,
    'optional-and-hides-lower-priority',
    1
  ),
  makeAdvancedMarker(
    4,
    '2',
    '#9334E6',
    -0.00018,
    0.00008,
    'optional-and-hides-lower-priority',
    3
  ),
];

export default function AdvancedMarkersScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const theme = useAppTheme();
  const [supportsAdvancedMarkers, setSupportsAdvancedMarkers] = useState<
    boolean | null
  >(null);

  const onMapCapabilitiesChange = useCallback(
    ({ supportsAdvancedMarkers: supported }: RNMapCapabilities) => {
      setSupportsAdvancedMarkers(supported);
    },
    []
  );

  const capabilityLabel =
    supportsAdvancedMarkers === null
      ? 'Advanced Markers: checking…'
      : `Advanced Markers: ${supportsAdvancedMarkers ? 'available' : 'unavailable'}`;

  return (
    <View style={styles.container}>
      <MapWrapper
        mapRef={mapRef}
        initialProps={initialProps}
        markers={markers}
        onMapCapabilitiesChange={onMapCapabilitiesChange}
      >
        <View
          pointerEvents="none"
          style={[
            styles.capabilityBadge,
            {
              backgroundColor: theme.bgPrimary,
              shadowColor: theme.shadow,
            },
          ]}
        >
          <Text style={[styles.capabilityText, { color: theme.textPrimary }]}>
            {capabilityLabel}
          </Text>
        </View>
        <ControlPanel viewRef={mapRef} buttons={[]} />
      </MapWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  capabilityBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  capabilityText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
