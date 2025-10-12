import React, { useRef, useState } from 'react';
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

export default function MarkersScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const navigation = useNavigation();
  const [marker, setMarker] = useState<RNMarker | undefined>(undefined);
  const [dialogVisible, setDialogVisible] = useState(true);

  useHeaderButton(navigation, marker ? 'Edit' : 'Add', () =>
    setDialogVisible(true)
  );

  return (
    <>
      <MapWrapper mapRef={mapRef} markers={marker ? [marker] : []} />
      <MapConfigDialog<RNMarker>
        visible={dialogVisible}
        title="Edit marker"
        initialData={makeMarker(1)}
        validator={RNMarkerValidator}
        onClose={() => setDialogVisible(false)}
        onSave={(c) => setMarker(c)}
      />
    </>
  );
}
