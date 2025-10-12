import React, { useRef, useState } from 'react';
import MapWrapper from '../components/MapWrapper';
import { makePolygon } from '../utils/mapGenerators';
import type {
  GoogleMapsViewRef,
  RNPolygon,
} from 'react-native-google-maps-plus';
import MapConfigDialog from '../components/maptConfigDialog/MapConfigDialog';
import { useNavigation } from '@react-navigation/native';
import { RNPolygonValidator } from '../components/maptConfigDialog/validator';
import { useHeaderButton } from '../hooks/useHeaderButton';

export default function PolygonsScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const navigation = useNavigation();
  const [polygon, setPolygon] = useState<RNPolygon | undefined>(undefined);
  const [dialogVisible, setDialogVisible] = useState(true);

  useHeaderButton(navigation, polygon ? 'Edit' : 'Add', () =>
    setDialogVisible(true)
  );

  return (
    <>
      <MapWrapper mapRef={mapRef} polygons={polygon ? [polygon] : []} />
      <MapConfigDialog<RNPolygon>
        visible={dialogVisible}
        title="Edit polygon"
        initialData={makePolygon(1)}
        validator={RNPolygonValidator}
        onClose={() => setDialogVisible(false)}
        onSave={(c) => setPolygon(c)}
      />
    </>
  );
}
