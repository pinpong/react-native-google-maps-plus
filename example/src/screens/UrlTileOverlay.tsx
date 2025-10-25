import React, { useRef, useState } from 'react';
import MapWrapper from '../components/MapWrapper';
import type {
  GoogleMapsViewRef,
  RNUrlTileOverlay,
} from 'react-native-google-maps-plus';
import MapConfigDialog from '../components/maptConfigDialog/MapConfigDialog';
import { useNavigation } from '@react-navigation/native';
import { RNUrlTileOverlayValidator } from '../components/maptConfigDialog/validator';
import { useHeaderButton } from '../hooks/useHeaderButton';
import { makeUrlTileOverlay } from '../utils/mapGenerators';

export default function UrlTileOverlay() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const navigation = useNavigation();
  const [urlTileOverlay, setUrlTileOverlay] = useState<
    RNUrlTileOverlay | undefined
  >(undefined);
  const [dialogVisible, setDialogVisible] = useState(true);

  useHeaderButton(navigation, urlTileOverlay ? 'Edit' : 'Add', () =>
    setDialogVisible(true)
  );

  return (
    <>
      <MapWrapper
        mapType={'none'}
        mapRef={mapRef}
        urlTileOverlays={urlTileOverlay ? [urlTileOverlay] : []}
      />
      <MapConfigDialog<RNUrlTileOverlay>
        visible={dialogVisible}
        title="Edit KML layer"
        initialData={makeUrlTileOverlay(1)}
        validator={RNUrlTileOverlayValidator}
        onClose={() => setDialogVisible(false)}
        onSave={(c) => setUrlTileOverlay(c)}
      />
    </>
  );
}
