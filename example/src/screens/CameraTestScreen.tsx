import React, { useMemo, useRef, useState } from 'react';
import MapWrapper from '../components/MapWrapper';
import ControlPanel from '../components/ControlPanel';
import type {
  GoogleMapsViewRef,
  RNLatLngBounds,
  RNCamera,
  RNLatLng,
} from 'react-native-google-maps-plus';

export default function CameraTestScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const [boundsActive, setBoundsActive] = useState(false);

  const coordinates = useMemo<RNLatLng[]>(
    () => [
      { latitude: 37.7749, longitude: -122.4194 },
      { latitude: 37.7849, longitude: -122.4094 },
      { latitude: 37.7649, longitude: -122.4294 },
    ],
    []
  );

  const bounds = useMemo<RNLatLngBounds>(
    () => ({
      southWest: { latitude: 37.703, longitude: -122.527 },
      northEast: { latitude: 37.833, longitude: -122.356 },
    }),
    []
  );

  const buttons = useMemo(
    () => [
      {
        title: 'Set Camera to SF',
        onPress: () => {
          const camera: RNCamera = {
            center: { latitude: 37.7749, longitude: -122.4194 },
            zoom: 12,
            bearing: 0,
            tilt: 0,
          };
          mapRef.current?.setCamera(camera, true, 1000);
        },
      },
      {
        title: 'Fit Coordinates',
        onPress: () =>
          mapRef.current?.setCameraToCoordinates(
            coordinates,
            { top: 50, bottom: 50, left: 50, right: 50 },
            true,
            1000
          ),
      },
      {
        title: boundsActive ? 'Clear Camera Bounds' : 'Set Camera Bounds',
        onPress: () => {
          if (boundsActive) {
            mapRef.current?.setCameraBounds(undefined);
            setBoundsActive(false);
          } else {
            mapRef.current?.setCameraBounds(bounds);
            setBoundsActive(true);
          }
        },
      },
      {
        title: 'Animate To Bounds',
        onPress: () => mapRef.current?.animateToBounds(bounds, 50, 1200),
      },
    ],
    [bounds, boundsActive, coordinates]
  );

  return (
    <MapWrapper mapRef={mapRef}>
      <ControlPanel mapRef={mapRef} buttons={buttons} />
    </MapWrapper>
  );
}
