import React, { useRef, useState } from 'react';
import MapWrapper from '../components/MapWrapper';
import { makeHeatmap } from '../utils/mapGenerators';
import type {
  GoogleMapsViewRef,
  RNHeatmap,
} from 'react-native-google-maps-plus';
import MapConfigDialog from '../components/maptConfigDialog/MapConfigDialog';
import { useNavigation } from '@react-navigation/native';
import { RNHeatmapValidator } from '../components/maptConfigDialog/validator';
import { useHeaderButton } from '../hooks/useHeaderButton';

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
        initialData={makeHeatmap(1)}
        validator={RNHeatmapValidator}
        onClose={() => setDialogVisible(false)}
        onSave={(c) => setHeatmaps([c])}
      />
    </>
  );
}
