import React, { useRef, useState } from 'react';

import { useNavigation } from '@react-navigation/native';

import MapConfigDialog from '@src/components/MapConfigDialog';
import MapWrapper from '@src/components/MapWrapper';
import { kmlString } from '@src/data/kmlData';
import { useHeaderButton } from '@src/hooks/useHeaderButton';
import { RNKMLayerValidator } from '@src/utils/validator';

import type {
  GoogleMapsViewRef,
  RNKMLayer,
} from 'react-native-google-maps-plus';

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
        initialData={
          kmlLayers ? kmlLayers[0]! : { id: '1', kmlString: kmlString }
        }
        validator={RNKMLayerValidator}
        onClose={() => setDialogVisible(false)}
        onSave={(c) => setKmlLayers([c])}
      />
    </>
  );
}
