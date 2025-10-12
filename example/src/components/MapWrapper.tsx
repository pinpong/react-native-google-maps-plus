import React, { useMemo } from 'react';
import type { ViewProps } from 'react-native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type {
  GoogleMapsViewRef,
  RNCamera,
  RNGoogleMapsPlusViewProps,
  RNLatLng,
  RNLocation,
  RNRegion,
} from 'react-native-google-maps-plus';
import {
  GoogleMapsView,
  RNAndroidLocationPriority,
  type RNIndoorBuilding,
  type RNIndoorLevel,
  RNIOSLocationAccuracy,
  RNLocationErrorCode,
  RNMapErrorCode,
} from 'react-native-google-maps-plus';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { callback } from 'react-native-nitro-modules';
import { useTheme } from '@react-navigation/native';

type Props = ViewProps &
  RNGoogleMapsPlusViewProps & {
    mapRef: React.RefObject<GoogleMapsViewRef | null>;
    children?: React.ReactNode;
  };

export default function MapWrapper(props: Props) {
  const { children, ...rest } = props;
  const theme = useTheme();
  const styles = useMemo(() => getThemedStyles(theme), [theme]);
  const layout = useSafeAreaInsets();

  const [mapReady, setMapReady] = React.useState(false);
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

  const mapPadding = useMemo(() => {
    return props.children
      ? { top: 20, left: 20, bottom: layout.bottom + 80, right: 20 }
      : { top: 20, left: 20, bottom: layout.bottom, right: 20 };
  }, [layout.bottom, props.children]);

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
          props.userInterfaceStyle ?? (theme.dark ? 'dark' : 'light')
        }
        mapType={props.mapType ?? 'normal'}
        mapZoomConfig={props.mapZoomConfig ?? mapZoomConfig}
        mapPadding={props.mapPadding ?? mapPadding}
        locationConfig={props.locationConfig ?? locationConfig}
        onMapReady={callback(
          props.onMapReady ?? {
            f: (ready: boolean) => {
              console.log('Map is ready! ' + ready);
              setMapReady(true);
            },
          }
        )}
        onMapError={callback(
          props.onMapError ?? {
            f: (error: RNMapErrorCode) => console.log('Map error:', error),
          }
        )}
        onMapPress={callback(
          props.onMapPress ?? {
            f: (c: RNLatLng) => console.log('Map press:', c),
          }
        )}
        onMarkerPress={callback(
          props.onMarkerPress ?? {
            f: (id: string | undefined) => console.log('Marker press:', id),
          }
        )}
        onPolylinePress={callback(
          props.onPolylinePress ?? {
            f: (id: string | undefined) => console.log('Polyline press:', id),
          }
        )}
        onPolygonPress={callback(
          props.onPolygonPress ?? {
            f: (id: string | undefined) => console.log('Polygon press:', id),
          }
        )}
        onCirclePress={callback(
          props.onCirclePress ?? {
            f: (id: string | undefined) => console.log('Circle press:', id),
          }
        )}
        onMarkerDragStart={callback(
          props.onMarkerDragStart ?? {
            f: (id: string | undefined, latLng: RNLatLng) =>
              console.log('Marker drag start', id, latLng),
          }
        )}
        onMarkerDrag={callback(
          props.onMarkerDrag ?? {
            f: (id: string | undefined, latLng: RNLatLng) =>
              console.log('Marker drag', id, latLng),
          }
        )}
        onMarkerDragEnd={callback(
          props.onMarkerDragEnd ?? {
            f: (id: string | undefined, latLng: RNLatLng) =>
              console.log('Marker drag end', id, latLng),
          }
        )}
        onIndoorBuildingFocused={callback(
          props.onIndoorBuildingFocused ?? {
            f: (building: RNIndoorBuilding) =>
              console.log('Indoor building focused', building),
          }
        )}
        onIndoorLevelActivated={callback(
          props.onIndoorLevelActivated ?? {
            f: (level: RNIndoorLevel) =>
              console.log('Indoor level activated', level),
          }
        )}
        onCameraChangeStart={callback(
          props.onCameraChangeStart ?? {
            f: (r: RNRegion, cam: RNCamera, g: boolean) =>
              console.log('Cam start', r, cam, g),
          }
        )}
        onCameraChange={callback(
          props.onCameraChange ?? {
            f: (r: RNRegion, cam: RNCamera, g: boolean) =>
              console.log('Cam', r, cam, g),
          }
        )}
        onCameraChangeComplete={callback(
          props.onCameraChangeComplete ?? {
            f: (r: RNRegion, cam: RNCamera, g: boolean) =>
              console.log('Cam complete', r, cam, g),
          }
        )}
        onLocationUpdate={callback(
          props.onLocationUpdate ?? {
            f: (l: RNLocation) => console.log('Location', l),
          }
        )}
        onLocationError={callback(
          props.onLocationError ?? {
            f: (e: RNLocationErrorCode) => console.log('Location error', e),
          }
        )}
      />
      {children}
      {!mapReady && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </View>
  );
}

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
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
