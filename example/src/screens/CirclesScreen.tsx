import React, { useRef, useState } from 'react';

import { useNavigation } from '@react-navigation/native';

import MapConfigDialog from '@src/components/MapConfigDialog';
import MapWrapper from '@src/components/MapWrapper';
import { useHeaderButton } from '@src/hooks/useHeaderButton';
import { makeCircle } from '@src/utils/mapGenerators';
import { RNCircleValidator } from '@src/utils/validator';

import type {
  GoogleMapsViewRef,
  RNCircle,
} from 'react-native-google-maps-plus';

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
        initialData={circles ? circles[0]! : makeCircle(1)}
        validator={RNCircleValidator}
        onClose={() => setDialogVisible(false)}
        onSave={(c) => setCircles([c])}
      />
    </>
  );
}
