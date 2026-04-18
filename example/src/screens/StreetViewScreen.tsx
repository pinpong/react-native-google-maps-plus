import React, { useCallback, useRef, useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import {
  GoogleMapsStreetView,
  type GoogleMapsStreetViewRef,
  type RNLocation,
  RNLocationErrorCode,
  type RNMapErrorCode,
  type RNStreetViewCamera,
  type RNStreetViewOrientation,
  type RNStreetViewPanoramaLocation,
} from 'react-native-google-maps-plus';

import ControlPanel from '@src/components/ControlPanel';
import MapConfigDialog from '@src/components/MapConfigDialog';
import { useHeaderButton } from '@src/hooks/useHeaderButton';
import { useNitroCallback } from '@src/hooks/useNitroCallback';
import type { RNStreetViewConfig } from '@src/types/streetViewConfig';
import { RNStreetViewConfigValidator } from '@src/utils/validator';

export default function StreetViewScreen() {
  const streetViewRef = useRef<GoogleMapsStreetViewRef | null>(null);
  const navigation = useNavigation();

  const [init, setInit] = useState(false);
  const [config, setConfig] = useState<RNStreetViewConfig>({
    initialProps: {
      panoramaId: undefined,
      position: { latitude: 37.8090233, longitude: -122.4742005 },
      radius: 50,
      source: 'default',
      camera: { bearing: 315, tilt: 0, zoom: 0 },
    },
    uiSettings: {
      streetNamesEnabled: true,
      userNavigationEnabled: true,
      panningGesturesEnabled: true,
      zoomGesturesEnabled: true,
    },
  });
  const [dialogVisible, setDialogVisible] = useState(true);
  const [currentCamera, setCurrentCamera] = useState<RNStreetViewCamera | null>(
    null
  );

  useHeaderButton(navigation, 'Edit', () => setDialogVisible(true));

  const hybridRef = useNitroCallback(
    useCallback(
      (ref: GoogleMapsStreetViewRef) => {
        streetViewRef.current = ref;
      },
      [streetViewRef]
    )
  );

  const onPanoramaReady = useNitroCallback(
    useCallback((ready: boolean) => console.log('Panorama ready:', ready), [])
  );

  const onLocationUpdate = useNitroCallback(
    useCallback((l: RNLocation) => console.log('Location:', l), [])
  );

  const onLocationError = useNitroCallback(
    useCallback(
      (e: RNLocationErrorCode) => console.log('Location error:', e),
      []
    )
  );

  const onPanoramaChange = useNitroCallback(
    useCallback(
      (location: RNStreetViewPanoramaLocation) =>
        console.log(
          'Panorama changed:',
          location.panoramaId,
          location.position
        ),
      []
    )
  );

  const onCameraChange = useNitroCallback(
    useCallback((camera: RNStreetViewCamera) => {
      setCurrentCamera(camera);
      console.log('Camera changed:', camera);
    }, [])
  );

  const onPanoramaPress = useNitroCallback(
    useCallback(
      (orientation: RNStreetViewOrientation) =>
        console.log('Panorama press:', orientation),
      []
    )
  );

  const onPanoramaError = useNitroCallback(
    useCallback(
      (code: RNMapErrorCode, msg: string) =>
        console.log('Map error:', code, msg),
      []
    )
  );

  const buttons = [
    {
      title: 'Set Position (Times Square)',
      onPress: () => {
        streetViewRef.current?.setPosition(
          { latitude: 40.758, longitude: -73.9855 },
          50
        );
      },
    },
    {
      title: 'Set Position by ID',
      onPress: () => {
        streetViewRef.current?.setPositionById('mTexJ35IDdbS-ajyRfp2wg');
      },
    },
    {
      title: 'Tilt Up',
      onPress: () => {
        const tilt = Math.min((currentCamera?.tilt ?? 0) + 15, 90);
        streetViewRef.current?.setCamera(
          { bearing: currentCamera?.bearing, tilt, zoom: currentCamera?.zoom },
          true,
          400
        );
      },
    },
    {
      title: 'Tilt Down',
      onPress: () => {
        const tilt = Math.max((currentCamera?.tilt ?? 0) - 15, -90);
        streetViewRef.current?.setCamera(
          { bearing: currentCamera?.bearing, tilt, zoom: currentCamera?.zoom },
          true,
          400
        );
      },
    },
    {
      title: 'Rotate Left',
      onPress: () => {
        const bearing = ((currentCamera?.bearing ?? 0) - 15 + 360) % 360;
        streetViewRef.current?.setCamera(
          { bearing, tilt: currentCamera?.tilt, zoom: currentCamera?.zoom },
          true,
          400
        );
      },
    },
    {
      title: 'Rotate Right',
      onPress: () => {
        const bearing = ((currentCamera?.bearing ?? 0) + 15) % 360;
        streetViewRef.current?.setCamera(
          { bearing, tilt: currentCamera?.tilt, zoom: currentCamera?.zoom },
          true,
          400
        );
      },
    },
    {
      title: 'Zoom In',
      onPress: () => {
        const zoom = Math.min((currentCamera?.zoom ?? 0) + 1, 5);
        streetViewRef.current?.setCamera(
          { bearing: currentCamera?.bearing, tilt: currentCamera?.tilt, zoom },
          true,
          400
        );
      },
    },
    {
      title: 'Zoom Out',
      onPress: () => {
        const zoom = Math.max((currentCamera?.zoom ?? 0) - 1, 0);
        streetViewRef.current?.setCamera(
          { bearing: currentCamera?.bearing, tilt: currentCamera?.tilt, zoom },
          true,
          400
        );
      },
    },
  ];

  return (
    <>
      {init && (
        <View style={styles.container}>
          <GoogleMapsStreetView
            hybridRef={hybridRef}
            style={styles.streetView}
            initialProps={config.initialProps}
            uiSettings={config.uiSettings}
            onPanoramaReady={onPanoramaReady}
            onLocationUpdate={onLocationUpdate}
            onLocationError={onLocationError}
            onPanoramaChange={onPanoramaChange}
            onCameraChange={onCameraChange}
            onPanoramaPress={onPanoramaPress}
            onPanoramaError={onPanoramaError}
          />
          <ControlPanel viewRef={streetViewRef} buttons={buttons} />
        </View>
      )}

      <MapConfigDialog<RNStreetViewConfig>
        visible={dialogVisible}
        title="Street View Settings"
        initialData={config}
        validator={RNStreetViewConfigValidator}
        onClose={() => {
          setInit(true);
          setDialogVisible(false);
        }}
        onSave={(c) => setConfig(c)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  streetView: {
    flex: 1,
  },
});
