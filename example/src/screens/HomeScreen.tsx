import React, { useMemo } from 'react';

import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import {
  type EdgeInsets,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import { useAppTheme } from '@src/hooks/useAppTheme';
import type { AppTheme } from '@src/theme';
import type {
  RootNavigationProp,
  RootStackParamList,
} from '@src/types/navigation';

const screens = [
  { name: 'BasicMap', title: 'Basic Map' },
  { name: 'Markers', title: 'Markers' },
  { name: 'SvgMarkers', title: 'SVG Markers' },
  { name: 'Polygons', title: 'Polygons' },
  { name: 'Polylines', title: 'Polylines' },
  { name: 'Circles', title: 'Circles' },
  { name: 'Heatmap', title: 'Heatmap' },
  { name: 'KmlLayer', title: 'KML Layer' },
  { name: 'UrlTileOverlay', title: 'Url Tile Overlay' },
  { name: 'Location', title: 'Location & Permissions' },
  { name: 'CustomStyle', title: 'Custom Map Style' },
  { name: 'IndoorLevelMap', title: 'Indoor Level Map' },
  { name: 'Camera', title: 'Camera Test' },
  { name: 'Snapshot', title: 'Snapshot Test' },
  { name: 'Clustering', title: 'Clustering' },
  { name: 'Stress', title: 'Stress Test' },
];

export default function HomeScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const theme = useAppTheme();
  const layout = useSafeAreaInsets();
  const styles = useMemo(() => getThemedStyles(theme, layout), [theme, layout]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {screens.map((s) => (
        <TouchableOpacity
          key={s.name}
          style={styles.button}
          onPress={() =>
            navigation.navigate(s.name as keyof RootStackParamList)
          }
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>{s.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const getThemedStyles = (theme: AppTheme, layout: EdgeInsets) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 8,
      paddingBottom: layout.bottom + 8,
      backgroundColor: theme.bgPrimary,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 24,
      color: theme.textPrimary,
      textAlign: 'center',
    },
    button: {
      backgroundColor: theme.bgAccent,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 10,
      marginVertical: 6,
      width: '80%',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textOnAccent,
    },
  });
