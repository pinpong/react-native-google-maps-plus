import React, { useMemo, useRef, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import MapWrapper from '../components/MapWrapper';
import ControlPanel from '../components/ControlPanel';
import { useAppTheme } from '../hooks/useAppTheme';
import type { GoogleMapsViewRef } from 'react-native-google-maps-plus';
import type { AppTheme } from '../theme';

export default function SnapshotTestScreen() {
  const mapRef = useRef<GoogleMapsViewRef | null>(null);
  const theme = useAppTheme();
  const [snapshotUri, setSnapshotUri] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const buttons = useMemo(
    () => [
      {
        title: 'Take Snapshot (Base64)',
        onPress: async () => {
          try {
            const result = await mapRef.current?.snapshot({
              format: 'jpg',
              quality: 0.9,
              resultType: 'base64',
            });
            if (result) {
              setSnapshotUri(result);
              setVisible(true);
            }
          } catch (e) {
            console.warn('Snapshot failed:', e);
          }
        },
      },
      {
        title: 'Take Snapshot (File)',
        onPress: async () => {
          try {
            const result = await mapRef.current?.snapshot({
              format: 'jpg',
              quality: 0.9,
              resultType: 'file',
            });
            if (result) {
              const uri = result.startsWith('file://')
                ? result
                : `file://${result}`;
              setSnapshotUri(uri);
              setVisible(true);
            }
          } catch (e) {
            console.warn('Snapshot failed:', e);
          }
        },
      },
    ],
    []
  );

  const styles = useMemo(() => getThemedStyles(theme), [theme]);

  return (
    <MapWrapper mapRef={mapRef}>
      <ControlPanel mapRef={mapRef} buttons={buttons} />

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <Text style={styles.title}>Map Snapshot</Text>

            {snapshotUri ? (
              <Image
                source={{ uri: snapshotUri }}
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.noImage}>No image</Text>
            )}

            <Pressable
              onPress={() => setVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </MapWrapper>
  );
}

const getThemedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.6)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dialog: {
      backgroundColor: theme.bgPrimary,
      borderColor: theme.border,
      padding: 20,
      borderRadius: 14,
      alignItems: 'center',
      width: '80%',
      shadowColor: theme.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 14,
      color: theme.textPrimary,
    },
    image: {
      width: 260,
      height: 260,
      borderRadius: 10,
      marginBottom: 20,
      backgroundColor: theme.bgHeader,
    },
    noImage: {
      color: theme.textOnAccent,
      marginBottom: 20,
    },
    closeButton: {
      backgroundColor: theme.bgAccent,
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 20,
      shadowColor: theme.shadow,
      shadowOpacity: 0.25,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },
    closeText: {
      color: theme.textOnAccent,
      fontWeight: '600',
      fontSize: 15,
    },
  });
