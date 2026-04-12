import React, { useMemo, useRef } from 'react';

import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import {
  type EdgeInsets,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import MapWrapper from '@src/components/MapWrapper';
import { useAppTheme } from '@src/hooks/useAppTheme';
import type { AppTheme } from '@src/theme';

import type {
  GoogleMapsViewRef,
  RNLatLng,
} from 'react-native-google-maps-plus';

const LOCATIONS: RNLatLng[] = [
  { latitude: 37.7749, longitude: -122.4194 }, // San Francisco
  { latitude: 40.7128, longitude: -74.006 }, // New York City
  { latitude: 52.52, longitude: 13.405 }, // Berlin
  { latitude: 48.8566, longitude: 2.3522 }, // Paris
  { latitude: 35.6762, longitude: 139.6503 }, // Tokyo
  { latitude: -33.8688, longitude: 151.2093 }, // Sydney
  { latitude: 51.5074, longitude: -0.1278 }, // London
  { latitude: 55.7558, longitude: 37.6173 }, // Moscow
  { latitude: 19.4326, longitude: -99.1332 }, // Mexico City
  { latitude: -23.5505, longitude: -46.6333 }, // São Paulo
];

export default function ScrollViewScreen() {
  const theme = useAppTheme();
  const layout = useSafeAreaInsets();
  const styles = useMemo(() => getThemedStyles(theme, layout), [theme, layout]);
  const mapRef = useRef<GoogleMapsViewRef | null>(null);

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
    >
      {LOCATIONS.map((center, i) => {
        const isLite = i % 2 !== 0;
        return (
          <View key={i} style={styles.card}>
            <MapWrapper
              mapRef={mapRef}
              style={styles.map}
              initialProps={{
                camera: { center, zoom: 12 },
                liteMode: isLite,
              }}
              uiSettings={
                isLite && Platform.OS === 'ios'
                  ? {
                      allGesturesEnabled: false,
                      compassEnabled: false,
                      rotateEnabled: false,
                      scrollEnabled: false,
                      scrollDuringRotateOrZoomEnabled: false,
                      tiltEnabled: false,
                      zoomGesturesEnabled: false,
                    }
                  : undefined
              }
              mapPadding={{ top: 0, bottom: 0, right: 0, left: 0 }}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}

const getThemedStyles = (theme: AppTheme, layout: EdgeInsets) =>
  StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: theme.bgPrimary,
    },
    content: {
      padding: 16,
      paddingBottom: layout.bottom + 24,
      gap: 20,
    },
    card: {
      borderRadius: 10,
      overflow: 'hidden',
      backgroundColor: theme.bgHeader,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    map: {
      height: 250,
    },
  });
