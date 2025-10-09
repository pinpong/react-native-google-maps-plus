import React, { useMemo } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { GoogleMapsView } from 'react-native-google-maps-plus';
import type {
  GoogleMapsViewRef,
  RNGoogleMapsPlusViewProps,
  RNCamera,
  RNLocation,
  RNRegion,
  RNLatLng,
} from 'react-native-google-maps-plus';
import {
  RNAndroidLocationPriority,
  RNIOSLocationAccuracy,
} from 'react-native-google-maps-plus';
import type { ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = ViewProps &
  RNGoogleMapsPlusViewProps & {
    mapRef: React.RefObject<GoogleMapsViewRef | null>;
    children?: React.ReactNode;
  };

export default function MapWrapper(props: Props) {
  const { children, ...rest } = props;
  const scheme = useColorScheme();
  const layout = useSafeAreaInsets();
  const initialProps = useMemo(
    () => ({
      camera: {
        center: { latitude: 37.7749, longitude: -122.4194 },
        zoom: 12,
      },
    }),
    []
  );

  const uiSettings = useMemo(
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
    }),
    []
  );

  const mapPadding = useMemo(
    () => ({ top: 20, left: 20, bottom: layout.bottom + 80, right: 20 }),
    [layout.bottom]
  );

  const mapZoomConfig = useMemo(() => ({ min: 0, max: 20 }), []);

  const locationConfig = useMemo(
    () => ({
      android: {
        priority: RNAndroidLocationPriority.PRIORITY_BALANCED_POWER_ACCURACY,
        interval: 5000,
        minUpdateInterval: 5000,
      },
      ios: {
        desiredAccuracy: RNIOSLocationAccuracy.ACCURACY_BEST,
        distanceFilterMeters: 10,
      },
    }),
    []
  );

  return (
    <View style={styles.container}>
      <GoogleMapsView
        {...rest}
        hybridRef={{
          f: (ref) => {
            props.mapRef.current = ref;
          },
        }}
        initialProps={props.initialProps ?? initialProps}
        uiSettings={props.uiSettings ?? uiSettings}
        style={[styles.map, props.style]}
        userInterfaceStyle={
          (props.userInterfaceStyle ?? scheme === 'dark') ? 'dark' : 'light'
        }
        mapType={props.mapType ?? 'normal'}
        mapZoomConfig={props.mapZoomConfig ?? mapZoomConfig}
        mapPadding={props.mapPadding ?? mapPadding}
        locationConfig={props.locationConfig ?? locationConfig}
        onMapReady={
          props.onMapReady
            ? {
                f: (ready: boolean) => console.log('Map is ready! ' + ready),
              }
            : undefined
        }
        onMapPress={
          props.onMapPress
            ? {
                f: (c: RNLatLng) => console.log('Map press:', c),
              }
            : undefined
        }
        onMarkerPress={
          props.onMarkerPress
            ? {
                f: (id: string) => console.log('Marker press:', id),
              }
            : undefined
        }
        onPolylinePress={
          props.onPolylinePress
            ? {
                f: (id: string) => console.log('Polyline press:', id),
              }
            : undefined
        }
        onPolygonPress={
          props.onPolygonPress
            ? {
                f: (id: string) => console.log('Polygon press:', id),
              }
            : undefined
        }
        onCirclePress={
          props.onCirclePress
            ? {
                f: (id: string) => console.log('Circle press:', id),
              }
            : undefined
        }
        onCameraChangeStart={
          props.onCameraChangeStart
            ? {
                f: (r: RNRegion, cam: RNCamera, g: boolean) =>
                  console.log('Cam start', r, cam, g),
              }
            : undefined
        }
        onCameraChange={
          props.onCameraChange
            ? {
                f: (r: RNRegion, cam: RNCamera, g: boolean) =>
                  console.log('Cam', r, cam, g),
              }
            : undefined
        }
        onCameraChangeComplete={
          props.onCameraChangeComplete
            ? {
                f: (r: RNRegion, cam: RNCamera, g: boolean) =>
                  console.log('Cam complete', r, cam, g),
              }
            : undefined
        }
        onLocationUpdate={
          props.onLocationUpdate
            ? {
                f: (l: RNLocation) => console.log('Location', l),
              }
            : undefined
        }
        onLocationError={
          props.onLocationError
            ? {
                f: (e: any) => console.log('Location error', e),
              }
            : undefined
        }
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
