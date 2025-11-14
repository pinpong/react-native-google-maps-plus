import React, { useRef, useState } from 'react';

import { useNavigation } from '@react-navigation/native';

import MapConfigDialog from '@src/components/MapConfigDialog';
import MapWrapper from '@src/components/MapWrapper';
import { useHeaderButton } from '@src/hooks/useHeaderButton';
import { makePolyline } from '@src/utils/mapGenerators';
import { RNPolylineValidator } from '@src/utils/validator';

import type {
  GoogleMapsViewRef,
  RNPolyline,
} from 'react-native-google-maps-plus';

export default function PolylinesScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const navigation = useNavigation();
  const [polylines, setPolylines] = useState<RNPolyline[] | undefined>(
    undefined
  );
  const [dialogVisible, setDialogVisible] = useState(true);

  useHeaderButton(navigation, polylines ? 'Edit' : 'Add', () =>
    setDialogVisible(true)
  );

  return (
    <>
      <MapWrapper mapRef={mapRef} polylines={polylines ? polylines : []} />
      <MapConfigDialog<RNPolyline>
        visible={dialogVisible}
        title="Edit polyline"
        initialData={polylines ? polylines[0]! : makePolyline(1)}
        validator={RNPolylineValidator}
        onClose={() => setDialogVisible(false)}
        onSave={(c) => setPolylines([c])}
      />
    </>
  );
}
