import React, { useMemo } from 'react';

import { ScrollView, StyleSheet } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import {
  type EdgeInsets,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import ActionButton from '@src/components/ActionButton';
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
  { name: 'Module', title: 'Module Test' },
];

export default function HomeScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const theme = useAppTheme();
  const layout = useSafeAreaInsets();
  const styles = useMemo(() => getThemedStyles(theme, layout), [theme, layout]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {screens.map((s) => (
        <ActionButton
          key={s.name}
          label={s.title}
          onPress={() =>
            navigation.navigate(s.name as keyof RootStackParamList)
          }
        />
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
  });
