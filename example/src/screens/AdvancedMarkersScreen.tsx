import React, { useCallback, useRef, useState } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import ControlPanel from '@src/components/ControlPanel';
import MapWrapper from '@src/components/MapWrapper';
import {
  advancedCollisionMarkers,
  advancedPinMarkers,
} from '@src/data/advancedMarkersData';
import type { AdvancedMarker } from '@src/data/advancedMarkersData';
import { useAppTheme } from '@src/hooks/useAppTheme';
import { gridCoordinates } from '@src/utils/mapGenerators';
import { SF_CENTER } from '@src/utils/mapUtils';

import type {
  GoogleMapsViewRef,
  RNInitialProps,
  RNMapCapabilities,
  RNMarker,
} from 'react-native-google-maps-plus';

const initialProps: RNInitialProps = {
  mapId: 'DEMO_MAP_ID',
  camera: {
    center: SF_CENTER,
    zoom: 19,
  },
};

const COLUMNS = 5;
const SPACING = 0.00022;

const toMarker = (marker: AdvancedMarker, index: number): RNMarker => {
  const { latitude, longitude } = gridCoordinates(
    index,
    COLUMNS,
    SF_CENTER.latitude + 0.00005,
    SF_CENTER.longitude - Math.floor(COLUMNS / 2) * SPACING,
    SPACING
  );
  // center the 4 collision markers below the 5 pins
  const offset = index >= COLUMNS ? SPACING / 2 : 0;
  return {
    id: index.toString(),
    zIndex: index,
    coordinate: { latitude, longitude: longitude + offset },
    title: marker.title,
    snippet: `zIndex: ${index}`,
    iconSvg: marker.svg
      ? { width: 52, height: 64, svgString: marker.svg }
      : undefined,
    advancedOptions: marker.advancedOptions,
  };
};

export default function AdvancedMarkersScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const theme = useAppTheme();
  const [capabilities, setCapabilities] = useState<RNMapCapabilities | null>(
    null
  );

  const [markers] = useState<RNMarker[]>(() =>
    [...advancedPinMarkers, ...advancedCollisionMarkers].map(toMarker)
  );

  const onMapReady = useCallback(
    (_: boolean, c: RNMapCapabilities) => setCapabilities(c),
    []
  );

  const capabilityLabel =
    capabilities === null
      ? 'Advanced Markers: checking…'
      : `Advanced Markers: ${capabilities.advancedMarkersAvailable ? 'available' : 'unavailable'}`;

  return (
    <View style={styles.container}>
      <MapWrapper
        mapRef={mapRef}
        markers={markers}
        initialProps={initialProps}
        onMapReady={onMapReady}
        onMapCapabilitiesChange={setCapabilities}
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
