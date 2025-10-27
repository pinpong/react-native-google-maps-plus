import React, { useMemo } from 'react';
import type { ViewProps } from 'react-native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type {
  GoogleMapsViewRef,
  RNCamera,
  RNGoogleMapsPlusViewProps,
  RNInitialProps,
  RNLatLng,
  RNLocation,
  RNLocationConfig,
  RNMapPadding,
  RNMapUiSettings,
  RNMapZoomConfig,
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

function wrapCallback<T extends (...args: any[]) => void>(
  propCallback: T | undefined,
  fallback?: (...args: Parameters<T>) => void
) {
  return callback({
    f: ((...args: Parameters<T>) => {
      propCallback?.(...args);
      fallback?.(...args);
    }) as T,
  });
}

export default function MapWrapper(props: Props) {
  const { children, ...rest } = props;
  const theme = useTheme();
  const styles = useMemo(() => getThemedStyles(theme), [theme]);
  const layout = useSafeAreaInsets();

  const [mapLoaded, setMapLoaded] = React.useState(false);
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
      ? { top: 20, left: 20, bottom: layout.bottom + 80, right: 20 }
      : { top: 20, left: 20, bottom: layout.bottom, right: 20 };
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
      },
    }),
    []
  );

  return (
    <View style={styles.container}>
      <GoogleMapsView
        {...rest}
        hybridRef={wrapCallback((ref) => (props.mapRef.current = ref))}
        initialProps={props.initialProps ?? initialProps}
        uiSettings={props.uiSettings ?? uiSettings}
        myLocationEnabled={props.myLocationEnabled ?? true}
        trafficEnabled={props.trafficEnabled ?? false}
        indoorEnabled={props.indoorEnabled ?? false}
        style={[styles.map, props.style]}
        userInterfaceStyle={
          props.userInterfaceStyle ?? (theme.dark ? 'dark' : 'light')
        }
        mapType={props.mapType ?? 'normal'}
        mapZoomConfig={props.mapZoomConfig ?? mapZoomConfig}
        mapPadding={props.mapPadding ?? mapPadding}
        locationConfig={props.locationConfig ?? locationConfig}
        onMapError={wrapCallback(props.onMapError, (e: RNMapErrorCode) =>
          console.log('Map error:', e)
        )}
        onMapReady={wrapCallback(props.onMapReady, (ready: boolean) =>
          console.log('Map is ready:', ready)
        )}
        onMapLoaded={wrapCallback(
          props.onMapLoaded,
          (region: RNRegion, camera: RNCamera) => {
            console.log('Map is loaded:', region, camera);
            setMapLoaded(true);
          }
        )}
        onMapPress={wrapCallback(props.onMapPress, (c: RNLatLng) =>
          console.log('Map press:', c)
        )}
        onMapLongPress={wrapCallback(props.onMapLongPress, (c: RNLatLng) =>
          console.log('Map long press:', c)
        )}
        onPoiPress={wrapCallback(
          props.onPoiPress,
          (placeId: string, name: string, coordinate: RNLatLng) =>
            console.log('Poi press:', placeId, name, coordinate)
        )}
        onMarkerPress={wrapCallback(props.onMarkerPress, (id: string) =>
          console.log('Marker press:', id)
        )}
        onPolylinePress={wrapCallback(props.onPolylinePress, (id: string) =>
          console.log('Polyline press:', id)
        )}
        onPolygonPress={wrapCallback(props.onPolygonPress, (id: string) =>
          console.log('Polygon press:', id)
        )}
        onCirclePress={wrapCallback(props.onCirclePress, (id: string) =>
          console.log('Circle press:', id)
        )}
        onMarkerDragStart={wrapCallback(
          props.onMarkerDragStart,
          (id: string, latLng: RNLatLng) =>
            console.log('Marker drag start:', id, latLng)
        )}
        onMarkerDrag={wrapCallback(
          props.onMarkerDrag,
          (id: string, latLng: RNLatLng) =>
            console.log('Marker drag:', id, latLng)
        )}
        onMarkerDragEnd={wrapCallback(
          props.onMarkerDragEnd,
          (id: string, latLng: RNLatLng) =>
            console.log('Marker drag end:', id, latLng)
        )}
        onIndoorBuildingFocused={wrapCallback(
          props.onIndoorBuildingFocused,
          (building: RNIndoorBuilding) =>
            console.log('Indoor building focused:', building)
        )}
        onIndoorLevelActivated={wrapCallback(
          props.onIndoorLevelActivated,
          (level: RNIndoorLevel) =>
            console.log('Indoor level activated:', level)
        )}
        onInfoWindowPress={wrapCallback(props.onInfoWindowPress, (id: string) =>
          console.log('InfoWindow press:', id)
        )}
        onInfoWindowClose={wrapCallback(props.onInfoWindowClose, (id: string) =>
          console.log('InfoWindow close:', id)
        )}
        onInfoWindowLongPress={wrapCallback(
          props.onInfoWindowLongPress,
          (id: string) => console.log('InfoWindow long press:', id)
        )}
        onMyLocationPress={wrapCallback(
          props.onMyLocationPress,
          (location: RNLocation) => console.log('MyLocation press:', location)
        )}
        onMyLocationButtonPress={wrapCallback(
          props.onMyLocationButtonPress,
          (pressed: boolean) => console.log('MyLocation button press:', pressed)
        )}
        onCameraChangeStart={wrapCallback(
          props.onCameraChangeStart,
          (r: RNRegion, cam: RNCamera, g: boolean) =>
            console.log('Camera start:', r, cam, g)
        )}
        onCameraChange={wrapCallback(
          props.onCameraChange,
          (r: RNRegion, cam: RNCamera, g: boolean) =>
            console.log('Camera changed:', r, cam, g)
        )}
        onCameraChangeComplete={wrapCallback(
          props.onCameraChangeComplete,
          (r: RNRegion, cam: RNCamera, g: boolean) =>
            console.log('Camera complete:', r, cam, g)
        )}
        onLocationUpdate={wrapCallback(
          props.onLocationUpdate,
          (l: RNLocation) => console.log('Location:', l)
        )}
        onLocationError={wrapCallback(
          props.onLocationError,
          (e: RNLocationErrorCode) => console.log('Location error:', e)
        )}
      />
      {children}
      {!mapLoaded && (
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
