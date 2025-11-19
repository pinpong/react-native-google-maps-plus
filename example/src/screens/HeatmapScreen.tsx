import React, { useRef, useState } from 'react';

import { useNavigation } from '@react-navigation/native';

import MapConfigDialog from '@src/components/MapConfigDialog';
import MapWrapper from '@src/components/MapWrapper';
import { useHeaderButton } from '@src/hooks/useHeaderButton';
import { makeHeatmap } from '@src/utils/mapGenerators';
import { RNHeatmapValidator } from '@src/utils/validator';

import type {
  GoogleMapsViewRef,
  RNHeatmap,
} from 'react-native-google-maps-plus';

export default function HeatmapScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const navigation = useNavigation();
  const [heatmaps, setHeatmaps] = useState<RNHeatmap[] | undefined>(undefined);
  const [dialogVisible, setDialogVisible] = useState(true);

  useHeaderButton(navigation, heatmaps ? 'Edit' : 'Add', () =>
    setDialogVisible(true)
  );

  return (
    <>
      <MapWrapper mapRef={mapRef} heatmaps={heatmaps ? heatmaps : []} />
      <MapConfigDialog<RNHeatmap>
        visible={dialogVisible}
        title="Edit heatmap"
        initialData={heatmaps ? heatmaps[0]! : makeHeatmap(1)}
        validator={RNHeatmapValidator}
        onClose={() => setDialogVisible(false)}
        onSave={(c) => setHeatmaps([c])}
      />
    </>
  );
}
