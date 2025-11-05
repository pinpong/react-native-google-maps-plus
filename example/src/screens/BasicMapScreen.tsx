import React, { useRef, useState } from 'react';
import MapWrapper from '../components/MapWrapper';
import type { GoogleMapsViewRef } from 'react-native-google-maps-plus';
import ControlPanel from '../components/ControlPanel';
import MapConfigDialog from '../components/maptConfigDialog/MapConfigDialog';
import type { RNBasicMapConfig } from '../types/basicMapConfig';
import { useNavigation } from '@react-navigation/native';
import { RNBasicMapConfigValidator } from '../components/maptConfigDialog/validator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderButton } from '../hooks/useHeaderButton';
import { useAppTheme } from '../hooks/useAppTheme';

export default function BasicMapScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const theme = useAppTheme();
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
      backgroundColor: theme.bgAccent,
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
      consumeOnMarkerPress: false,
      consumeOnMyLocationButtonPress: false,
    },
    myLocationEnabled: true,
    buildingEnabled: undefined,
    trafficEnabled: undefined,
    indoorEnabled: undefined,
    customMapStyle: undefined,
    mapZoomConfig: { min: 0, max: 20 },
    mapPadding: { top: 20, left: 20, bottom: layout.bottom + 80, right: 20 },
    mapType: 'normal',
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
