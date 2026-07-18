import React, { useCallback, useMemo, useRef, useState } from 'react';

import { Platform, StyleSheet, Text, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import ControlPanel from '@src/components/ControlPanel';
import MapConfigDialog from '@src/components/MapConfigDialog';
import MapWrapper from '@src/components/MapWrapper';
import { useAppTheme } from '@src/hooks/useAppTheme';
import { useHeaderButton } from '@src/hooks/useHeaderButton';
import type { AppTheme } from '@src/theme';
import { makeMarker } from '@src/utils/mapGenerators';
import { RNMarkerValidator } from '@src/utils/validator';

import type {
  GoogleMapsViewRef,
  RNInitialProps,
  RNMarker,
} from 'react-native-google-maps-plus';

const ICON_SIZES = [
  { width: 16, height: 22 },
  { width: 32, height: 44 },
  { width: 64, height: 88 },
] as const;

const getInfoWindowAnchorForRotation = (
  rotation: number
): NonNullable<RNMarker['infoWindowAnchor']> => {
  const radians = (rotation * Math.PI) / 180;
  const horizontalDirection = Math.sin(radians);
  const verticalDirection = Math.cos(radians);
  const epsilon = 1e-6;

  return {
    x:
      Math.abs(horizontalDirection) < epsilon
        ? 0.5
        : horizontalDirection > 0
          ? 0
          : 1,
    y:
      Math.abs(verticalDirection) < epsilon
        ? 0.5
        : verticalDirection > 0
          ? 0
          : 1,
  };
};

const INITIAL_MARKER = makeMarker(1);
const INITIAL_PROPS: RNInitialProps = {
  camera: {
    center: INITIAL_MARKER.coordinate,
    zoom: 17,
  },
};

type LastPress = 'none' | 'map' | 'marker';

export default function MarkerHitboxScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const navigation = useNavigation();
  const theme = useAppTheme();
  const styles = useMemo(() => getThemedStyles(theme), [theme]);
  const [marker, setMarker] = useState<RNMarker>(() => INITIAL_MARKER);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [strictHitboxEnabled, setStrictHitboxEnabled] = useState(false);
  const [lastPress, setLastPress] = useState<LastPress>('none');
  const [markerPresses, setMarkerPresses] = useState(0);
  const [mapPresses, setMapPresses] = useState(0);

  useHeaderButton(navigation, 'Edit', () => setDialogVisible(true));

  const handleMarkerPress = useCallback(() => {
    setLastPress('marker');
    setMarkerPresses((count) => count + 1);
  }, []);

  const handleMapPress = useCallback(() => {
    setLastPress('map');
    setMapPresses((count) => count + 1);
  }, []);

  const buttons = useMemo(
    () => [
      {
        title: strictHitboxEnabled
          ? 'Disable strict hitbox'
          : 'Enable strict hitbox',
        onPress: () => setStrictHitboxEnabled((enabled) => !enabled),
      },
      {
        title: 'Change marker bitmap size',
        onPress: () =>
          setMarker((current) => {
            const currentIcon = current.iconSvg ?? makeMarker(1).iconSvg!;
            const currentSizeIndex = ICON_SIZES.findIndex(
              (size) =>
                size.width === currentIcon.width &&
                size.height === currentIcon.height
            );
            const nextSize =
              ICON_SIZES[(currentSizeIndex + 1) % ICON_SIZES.length]!;

            return {
              ...current,
              iconSvg: {
                ...currentIcon,
                width: nextSize.width,
                height: nextSize.height,
              },
            };
          }),
      },
      {
        title: 'Rotate marker 45°',
        onPress: () =>
          setMarker((current) => {
            const rotation = ((current.rotation ?? 0) + 45) % 360;

            return {
              ...current,
              rotation,
              infoWindowAnchor: getInfoWindowAnchorForRotation(rotation),
            };
          }),
      },
      {
        title: 'Reset press counters',
        onPress: () => {
          setLastPress('none');
          setMarkerPresses(0);
          setMapPresses(0);
        },
      },
    ],
    [strictHitboxEnabled]
  );

  const bitmapSize = marker.iconSvg
    ? `${marker.iconSvg.width} × ${marker.iconSvg.height} dp`
    : 'default Google marker';

  return (
    <>
      <MapWrapper
        mapRef={mapRef}
        initialProps={INITIAL_PROPS}
        markers={[marker]}
        myLocationEnabled={false}
        onMapPress={handleMapPress}
        onMarkerPress={handleMarkerPress}
        {...(strictHitboxEnabled
          ? { enableStrictMarkerPressHitbox: true }
          : {})}
      >
        <View style={styles.status} pointerEvents="none">
          <Text style={styles.statusTitle}>
            Strict hitbox:{' '}
            {Platform.OS === 'android'
              ? strictHitboxEnabled
                ? 'enabled'
                : 'disabled (prop omitted)'
              : 'Android only'}
          </Text>
          <Text style={styles.statusText}>
            Bitmap: {bitmapSize} · rotation: {marker.rotation ?? 0}°
          </Text>
          <Text style={styles.statusText}>
            Last: {lastPress} · marker: {markerPresses} · map: {mapPresses}
          </Text>
        </View>
        <ControlPanel viewRef={mapRef} buttons={buttons} />
      </MapWrapper>

      <MapConfigDialog<RNMarker>
        visible={dialogVisible}
        title="Edit hitbox marker"
        initialData={marker}
        validator={RNMarkerValidator}
        onClose={() => setDialogVisible(false)}
        onSave={(nextMarker) =>
          setMarker({
            ...nextMarker,
            infoWindowAnchor: getInfoWindowAnchorForRotation(
              nextMarker.rotation ?? 0
            ),
          })
        }
      />
    </>
  );
}

const getThemedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    status: {
      position: 'absolute',
      top: 12,
      left: 12,
      right: 12,
      gap: 4,
      padding: 12,
      borderRadius: 10,
      backgroundColor: theme.bgPrimary,
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 2,
    },
    statusTitle: {
      color: theme.textPrimary,
      fontWeight: '700',
      textAlign: 'center',
    },
    statusText: {
      color: theme.textPrimary,
      textAlign: 'center',
    },
  });
