import React, { useRef, useState } from 'react';
import MapWrapper from '../components/MapWrapper';
import ControlPanel from '../components/ControlPanel';
import {
  type GoogleMapsViewRef,
  RNAndroidLocationPriority,
  RNIOSLocationAccuracy,
  RNIOSLocationActivityType,
  type RNLocationConfig,
} from 'react-native-google-maps-plus';
import { RNLocationConfigValidator } from '../components/maptConfigDialog/validator';
import MapConfigDialog from '../components/maptConfigDialog/MapConfigDialog';
import { useHeaderButton } from '../hooks/useHeaderButton';
import { useNavigation } from '@react-navigation/native';

export default function LocationScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const navigation = useNavigation();
  const [locationConfig, setLocationConfig] = useState<RNLocationConfig>({
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
  });
  const [dialogVisible, setDialogVisible] = useState(true);

  useHeaderButton(navigation, 'Edit', () => setDialogVisible(true));

  return (
    <>
      <MapWrapper
        mapRef={mapRef}
        myLocationEnabled
        locationConfig={locationConfig}
      >
        <ControlPanel mapRef={mapRef} buttons={[]} />
      </MapWrapper>

      <MapConfigDialog<RNLocationConfig>
        visible={dialogVisible}
        title="Edit marker"
        initialData={locationConfig}
        validator={RNLocationConfigValidator}
        onClose={() => setDialogVisible(false)}
        onSave={(c) => setLocationConfig(c)}
      />
    </>
  );
}
