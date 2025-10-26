import React, { useRef, useState } from 'react';
import MapWrapper from '../components/MapWrapper';
import { kmlString } from '../utils/kmlData';
import type {
  GoogleMapsViewRef,
  RNKMLayer,
} from 'react-native-google-maps-plus';
import MapConfigDialog from '../components/maptConfigDialog/MapConfigDialog';
import { useNavigation } from '@react-navigation/native';
import { RNKMLayerValidator } from '../components/maptConfigDialog/validator';
import { useHeaderButton } from '../hooks/useHeaderButton';

export default function KmlLayerScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const navigation = useNavigation();
  const [kmlLayers, setKmlLayers] = useState<RNKMLayer[] | undefined>(
    undefined
  );
  const [dialogVisible, setDialogVisible] = useState(true);

  useHeaderButton(navigation, kmlLayers ? 'Edit' : 'Add', () =>
    setDialogVisible(true)
  );

  return (
    <>
      <MapWrapper mapRef={mapRef} kmlLayers={kmlLayers ? kmlLayers : []} />
      <MapConfigDialog<RNKMLayer>
        visible={dialogVisible}
        title="Edit KML layer"
        initialData={{ id: '1', kmlString: kmlString }}
        validator={RNKMLayerValidator}
        onClose={() => setDialogVisible(false)}
        onSave={(c) => setKmlLayers([c])}
      />
    </>
  );
}
