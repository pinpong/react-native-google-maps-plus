import React, { useRef, useState } from 'react';
import MapWrapper from '../components/MapWrapper';
import {
  type GoogleMapsViewRef,
  RNAndroidLocationPriority,
  RNIOSLocationAccuracy,
} from 'react-native-google-maps-plus';
import ControlPanel from '../components/ControlPanel';
import MapConfigDialog from '../components/maptConfigDialog/MapConfigDialog';
import type { RNBasicMapConfig } from '../types/basicMapConfig';
import { useNavigation } from '@react-navigation/native';
import { RNBasicMapConfigValidator } from '../components/maptConfigDialog/validator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderButton } from '../hooks/useHeaderButton';

export default function BasicMapScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const layout = useSafeAreaInsets();
  const navigation = useNavigation();
  const [init, setInit] = useState(false);
  const [mapConfig, setMapConfig] = useState<RNBasicMapConfig>({
    initialProps: {
      mapId: undefined,
      liteMode: false,
      camera: {
        center: { latitude: 37.7749, longitude: -122.4194 },
        zoom: 12,
      },
    },
    uiSettings: {
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
    },
    myLocationEnabled: true,
    buildingEnabled: undefined,
    trafficEnabled: undefined,
    indoorEnabled: undefined,
    customMapStyle: '',
    userInterfaceStyle: 'default',
    mapZoomConfig: { min: 0, max: 20 },
    mapPadding: { top: 20, left: 20, bottom: layout.bottom + 80, right: 20 },
    mapType: 'normal',
    locationConfig: {
      android: {
        priority: RNAndroidLocationPriority.PRIORITY_HIGH_ACCURACY,
        interval: 5000,
        minUpdateInterval: 5000,
      },
      ios: {
        desiredAccuracy: RNIOSLocationAccuracy.ACCURACY_BEST,
        distanceFilterMeters: 10,
      },
    },
  });

  const [dialogVisible, setDialogVisible] = useState(true);

  useHeaderButton(navigation, mapConfig ? 'Edit' : 'Add', () =>
    setDialogVisible(true)
  );

  return (
    <>
      {init && (
        <MapWrapper mapRef={mapRef} {...mapConfig}>
          <ControlPanel mapRef={mapRef} buttons={[]} />
        </MapWrapper>
      )}
      <MapConfigDialog<RNBasicMapConfig>
        visible={dialogVisible}
        title="Edit Map Settings"
        initialData={mapConfig}
        validator={RNBasicMapConfigValidator}
        onClose={() => {
          setInit(true);
          setDialogVisible(false);
        }}
        onSave={(c) => setMapConfig(c)}
      />
    </>
  );
}
