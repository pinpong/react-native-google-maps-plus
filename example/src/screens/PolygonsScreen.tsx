import React, { useRef, useState } from 'react';

import { useNavigation } from '@react-navigation/native';

import MapConfigDialog from '@src/components/MapConfigDialog';
import MapWrapper from '@src/components/MapWrapper';
import { useHeaderButton } from '@src/hooks/useHeaderButton';
import { makePolygon } from '@src/utils/mapGenerators';
import { RNPolygonValidator } from '@src/utils/validator';

import type {
  GoogleMapsViewRef,
  RNPolygon,
} from 'react-native-google-maps-plus';

export default function PolygonsScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const navigation = useNavigation();
  const [polygons, setPolygons] = useState<RNPolygon[] | undefined>(undefined);
  const [dialogVisible, setDialogVisible] = useState(true);

  useHeaderButton(navigation, polygons ? 'Edit' : 'Add', () =>
    setDialogVisible(true)
  );

  return (
    <>
      <MapWrapper mapRef={mapRef} polygons={polygons ? polygons : []} />
      <MapConfigDialog<RNPolygon>
        visible={dialogVisible}
        title="Edit polygon"
        initialData={polygons ? polygons[0]! : makePolygon(1)}
        validator={RNPolygonValidator}
        onClose={() => setDialogVisible(false)}
        onSave={(c) => setPolygons([c])}
      />
    </>
  );
}
