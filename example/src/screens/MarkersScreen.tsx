import React, { useMemo, useRef, useState } from 'react';
import MapWrapper from '../components/MapWrapper';
import { makeMarker } from '../utils/mapGenerators';
import type {
  GoogleMapsViewRef,
  RNLatLng,
  RNMarker,
} from 'react-native-google-maps-plus';
import MapConfigDialog from '../components/maptConfigDialog/MapConfigDialog';
import { useNavigation } from '@react-navigation/native';
import { RNMarkerValidator } from '../components/maptConfigDialog/validator';
import { useHeaderButton } from '../hooks/useHeaderButton';
import type { RNMapUiSettings } from 'react-native-google-maps-plus';
import ControlPanel from '../components/ControlPanel';

export function animateSpiral(
  center: RNLatLng,
  duration: number,
  onUpdate: (c: RNLatLng) => void,
  onFinish: () => void,
  opts = { rotations: 10, startRadius: 0.0001, endRadius: 0.002 }
) {
  const { rotations, startRadius, endRadius } = opts;
  const start = performance.now();

  const ease = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

  const loop = (now: number) => {
    const t = Math.min((now - start) / duration, 1);
    const e = ease(t);

    const r = startRadius + (endRadius - startRadius) * e;
    const angle = e * rotations * 2 * Math.PI;

    onUpdate({
      latitude: center.latitude + Math.cos(angle) * r,
      longitude: center.longitude + Math.sin(angle) * r,
    });

    t < 1 ? requestAnimationFrame(loop) : onFinish();
  };

  requestAnimationFrame(loop);
}

export default function MarkersScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const navigation = useNavigation();
  const [markers, setMarkers] = useState<RNMarker[] | undefined>(undefined);
  const [dialogVisible, setDialogVisible] = useState(true);
  const animatingRef = useRef(false);
  const uiSettings: RNMapUiSettings = useMemo(
    () => ({
      allGesturesEnabled: true,
      compassEnabled: true,
      indoorLevelPickerEnabled: true,
      mapToolbarEnabled: true,
      myLocationButtonEnabled: true,
      rotateEnabled: true,
      scrollEnabled: true,
      scrollDuringRotateOrZoomEnabled: true,
      tiltEnabled: true,
      zoomControlsEnabled: true,
      zoomGesturesEnabled: true,
      consumeOnMarkerPress: true,
      consumeOnMyLocationButtonPress: false,
    }),
    []
  );

  useHeaderButton(navigation, markers ? 'Edit' : 'Add', () =>
    setDialogVisible(true)
  );

  const buttons = useMemo(
    () => [
      {
        title: 'Animate Marker',
        onPress: () => {
          if (animatingRef.current) return;
          if (!markers || !markers[0]) return;
          const center = markers[0].coordinate;
          const id = markers[0].id;
          animatingRef.current = true;
          animateSpiral(
            center,
            5000,
            (coordinate: RNLatLng) => {
              setMarkers((prev) =>
                prev?.map((m) => (m.id === id ? { ...m, coordinate } : m))
              );
            },
            () => (animatingRef.current = false)
          );
        },
      },
    ],
    [markers]
  );

  return (
    <>
      <MapWrapper
        mapRef={mapRef}
        uiSettings={uiSettings}
        markers={markers ? markers : []}
        onMarkerPress={(id: string) => mapRef.current?.showMarkerInfoWindow(id)}
      >
        <ControlPanel mapRef={mapRef} buttons={buttons} />
      </MapWrapper>
      <MapConfigDialog<RNMarker>
        visible={dialogVisible}
        title="Edit marker"
        initialData={markers ? markers[0]! : makeMarker(1)}
        validator={RNMarkerValidator}
        onClose={() => setDialogVisible(false)}
        onSave={(c) => setMarkers([c])}
      />
    </>
  );
}
