import React from 'react';

import { StatusBar, StyleSheet, View } from 'react-native';

import { type RouteProp, useRoute } from '@react-navigation/native';

import type { RootStackParamList } from '@src/types/navigation';

import { examples } from '../../../docs/examples';

// Width of the screenshot frame in dp. The website shows the examples in small
// tiles, a small frame keeps the markers large in relation to the map.
const CAPTURE_WIDTH = 260;

export default function DocsExampleScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'DocsExample'>>();
  const Example = examples.find(
    (example) => example.id === params.id
  )?.component;

  if (!Example) return null;
  if (!params.capture) return <Example />;

  return (
    <View style={styles.capture}>
      <StatusBar hidden />
      <View style={styles.frame}>
        <Example />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  capture: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f2',
  },
  frame: {
    width: CAPTURE_WIDTH,
    height: (CAPTURE_WIDTH * 4) / 3,
  },
});
