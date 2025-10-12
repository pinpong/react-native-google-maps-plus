import React, { useRef, useState } from 'react';
import MapWrapper from '../components/MapWrapper';
import { makePolyline } from '../utils/mapGenerators';
import type {
  GoogleMapsViewRef,
  RNPolyline,
} from 'react-native-google-maps-plus';
import MapConfigDialog from '../components/maptConfigDialog/MapConfigDialog';
import { useNavigation } from '@react-navigation/native';
import { RNPolylineValidator } from '../components/maptConfigDialog/validator';
import { useHeaderButton } from '../hooks/useHeaderButton';

export default function PolylinesScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const navigation = useNavigation();
  const [polyline, setPolyline] = useState<RNPolyline | undefined>(undefined);
  const [dialogVisible, setDialogVisible] = useState(true);

  useHeaderButton(navigation, polyline ? 'Edit' : 'Add', () =>
    setDialogVisible(true)
  );

  return (
    <>
      <MapWrapper mapRef={mapRef} polylines={polyline ? [polyline] : []} />
      <MapConfigDialog<RNPolyline>
        visible={dialogVisible}
        title="Edit polyline"
        initialData={makePolyline(1)}
        validator={RNPolylineValidator}
        onClose={() => setDialogVisible(false)}
        onSave={(c) => setPolyline(c)}
      />
    </>
  );
}
