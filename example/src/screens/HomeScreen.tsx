import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../theme';

const screens = [
  { name: 'BasicMap', title: 'Basic Map' },
  { name: 'Markers', title: 'Markers' },
  { name: 'Polygons', title: 'Polygons' },
  { name: 'Polylines', title: 'Polylines' },
  { name: 'Circles', title: 'Circles' },
  { name: 'Heatmap', title: 'Heatmap' },
  { name: 'KmlLayer', title: 'KML Layer' },
  { name: 'Location', title: 'Location & Permissions' },
  { name: 'CustomStyle', title: 'Custom Map Style' },
  { name: 'IndoorLevelMap', title: 'Indoor level map' },
  { name: 'StressTest', title: 'Stress Test' },
];

export default function HomeScreen() {
  const navigation = useNavigation<StackNavigationProp<any>>();
  const theme = useAppTheme();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.bgPrimary },
      ]}
    >
      <Text style={[styles.title, { color: theme.textPrimary }]}>
        React Native Google Maps Plus Examples
      </Text>
      {screens.map((s) => (
        <TouchableOpacity
          key={s.name}
          style={[styles.button, { backgroundColor: theme.bgAccent }]}
          onPress={() => navigation.navigate(s.name)}
          activeOpacity={0.85}
        >
          <Text style={[styles.buttonText, { color: theme.textOnAccent }]}>
            {s.title}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginVertical: 6,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
