import React, { useMemo, useState } from 'react';

import type { ViewProps } from 'react-native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import {
  GoogleMapsView,
  RNAndroidLocationPriority,
  RNIOSLocationAccuracy,
  RNIOSLocationActivityType,
} from 'react-native-google-maps-plus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@src/hooks/useAppTheme';
import { useMapCallbacks } from '@src/hooks/useMapCallbacks';
import type { AppTheme } from '@src/theme';

import type {
  GoogleMapsViewRef,
  RNGoogleMapsPlusViewProps,
  RNInitialProps,
  RNLocationConfig,
  RNMapPadding,
  RNMapUiSettings,
  RNMapZoomConfig,
} from 'react-native-google-maps-plus';

type Props = ViewProps &
  RNGoogleMapsPlusViewProps & {
    mapRef: React.RefObject<GoogleMapsViewRef | null>;
    children?: React.ReactNode;
  };

export default function MapWrapper(props: Props) {
  const { children, ...rest } = props;
  const theme = useAppTheme();
  const styles = useMemo(() => getThemedStyles(theme), [theme]);
  const layout = useSafeAreaInsets();

  const [mapLoaded, setMapLoaded] = useState(false);
  const initialProps: RNInitialProps = useMemo(
    () => ({
      camera: {
        center: { latitude: 37.7749, longitude: -122.4194 },
        zoom: 12,
      },
    }),
    []
  );

  const uiSettings: RNMapUiSettings = useMemo(
    () => ({
      allGesturesEnabled: true,
      compassEnabled: true,
      indoorLevelPickerEnabled: true,
      mapToolbarEnabled: true,
      myLocationButtonEnabled: true,
      rotateEnabled: true,
      scrollEnabled: true,
      scrollDuringRotateOrZoomEnabled: true,
      tiltEnabled: true,
      zoomControlsEnabled: true,
      zoomGesturesEnabled: true,
      consumeOnMarkerPress: false,
      consumeOnMyLocationButtonPress: false,
    }),
    []
  );

  const mapPadding: RNMapPadding = useMemo(() => {
    return props.children
      ? { top: 0, left: 0, bottom: layout.bottom + 70, right: 0 }
      : { top: 0, left: 0, bottom: layout.bottom, right: 0 };
  }, [layout.bottom, props.children]);

  const mapZoomConfig: RNMapZoomConfig = useMemo(
    () => ({ min: 0, max: 20 }),
    []
  );

  const locationConfig: RNLocationConfig = useMemo(
    () => ({
      android: {
        priority: RNAndroidLocationPriority.PRIORITY_HIGH_ACCURACY,
        interval: 5000,
        minUpdateInterval: 5000,
      },
      ios: {
        desiredAccuracy: RNIOSLocationAccuracy.ACCURACY_BEST,
        distanceFilterMeters: 10,
        activityType: RNIOSLocationActivityType.NAVIGATION,
      },
    }),
    []
  );

  const mapCallbacks = useMapCallbacks(props, props.mapRef, setMapLoaded);

  return (
    <View style={styles.container}>
      <GoogleMapsView
        {...rest}
        initialProps={props.initialProps ?? initialProps}
        uiSettings={props.uiSettings ?? uiSettings}
        myLocationEnabled={props.myLocationEnabled ?? true}
        trafficEnabled={props.trafficEnabled ?? false}
        indoorEnabled={props.indoorEnabled ?? false}
        style={[styles.map, props.style]}
        userInterfaceStyle={
          props.userInterfaceStyle ??
          (theme.theme === 'dark' ? 'dark' : 'light')
        }
        mapType={props.mapType ?? 'normal'}
        mapZoomConfig={props.mapZoomConfig ?? mapZoomConfig}
        mapPadding={props.mapPadding ?? mapPadding}
        locationConfig={props.locationConfig ?? locationConfig}
        {...mapCallbacks}
      />
      {children}
      {!mapLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.bgAccent} />
        </View>
      )}
    </View>
  );
}

const getThemedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.bgPrimary,
    },
    map: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFill,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      backgroundColor: theme.overlay,
    },
  });
