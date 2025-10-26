import React, { useRef, useState } from 'react';
import MapWrapper from '../components/MapWrapper';
import { makeCircle } from '../utils/mapGenerators';
import type {
  GoogleMapsViewRef,
  RNCircle,
} from 'react-native-google-maps-plus';
import MapConfigDialog from '../components/maptConfigDialog/MapConfigDialog';
import { useNavigation } from '@react-navigation/native';
import { RNCircleValidator } from '../components/maptConfigDialog/validator';
import { useHeaderButton } from '../hooks/useHeaderButton';

export default function CirclesScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const navigation = useNavigation();
  const [circles, setCircles] = useState<RNCircle[] | undefined>(undefined);
  const [dialogVisible, setDialogVisible] = useState(true);

  useHeaderButton(navigation, circles ? 'Edit' : 'Add', () =>
    setDialogVisible(true)
  );

  return (
    <>
      <MapWrapper mapRef={mapRef} circles={circles ? circles : []} />
      <MapConfigDialog<RNCircle>
        visible={dialogVisible}
        title="Edit circle"
        initialData={makeCircle(1)}
        validator={RNCircleValidator}
        onClose={() => setDialogVisible(false)}
        onSave={(c) => setCircles([c])}
      />
    </>
  );
}
