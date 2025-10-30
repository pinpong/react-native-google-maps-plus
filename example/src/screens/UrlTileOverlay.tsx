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
  const [urlTileOverlays, setUrlTileOverlays] = useState<
    RNUrlTileOverlay[] | undefined
  >(undefined);
  const [dialogVisible, setDialogVisible] = useState(true);

  useHeaderButton(navigation, urlTileOverlays ? 'Edit' : 'Add', () =>
    setDialogVisible(true)
  );

  return (
    <>
      <MapWrapper
        mapType={'none'}
        mapRef={mapRef}
        urlTileOverlays={urlTileOverlays ? urlTileOverlays : []}
      />
      <MapConfigDialog<RNUrlTileOverlay>
        visible={dialogVisible}
        title="Edit KML layer"
        initialData={
          urlTileOverlays ? urlTileOverlays[0]! : makeUrlTileOverlay(1)
        }
        validator={RNUrlTileOverlayValidator}
        onClose={() => setDialogVisible(false)}
        onSave={(c) => setUrlTileOverlays([c])}
      />
    </>
  );
}
