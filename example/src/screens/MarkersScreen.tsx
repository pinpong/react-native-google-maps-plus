import React, { useMemo, useRef, useState } from 'react';
import MapWrapper from '../components/MapWrapper';
import { makeMarker } from '../utils/mapGenerators';
import type {
  GoogleMapsViewRef,
  RNMarker,
} from 'react-native-google-maps-plus';
import MapConfigDialog from '../components/maptConfigDialog/MapConfigDialog';
import { useNavigation } from '@react-navigation/native';
import { RNMarkerValidator } from '../components/maptConfigDialog/validator';
import { useHeaderButton } from '../hooks/useHeaderButton';
import type { RNMapUiSettings } from 'react-native-google-maps-plus';

export default function MarkersScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const navigation = useNavigation();
  const [markers, setMarkers] = useState<RNMarker[] | undefined>(undefined);
  const [dialogVisible, setDialogVisible] = useState(true);

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
      consumeOnMarkerPress: true,
      consumeOnMyLocationButtonPress: false,
    }),
    []
  );

  useHeaderButton(navigation, markers ? 'Edit' : 'Add', () =>
    setDialogVisible(true)
  );

  return (
    <>
      <MapWrapper
        mapRef={mapRef}
        uiSettings={uiSettings}
        markers={markers ? markers : []}
        onMarkerPress={(id: string) => mapRef.current?.showMarkerInfoWindow(id)}
      />
      <MapConfigDialog<RNMarker>
        visible={dialogVisible}
        title="Edit marker"
        initialData={markers ? markers[0]! : makeMarker(1)}
        validator={RNMarkerValidator}
        onClose={() => setDialogVisible(false)}
        onSave={(c) => setMarkers([c])}
      />
    </>
  );
}
