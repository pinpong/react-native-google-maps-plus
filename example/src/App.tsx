import React from 'react';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen';
import BasicMapScreen from './screens/BasicMapScreen';
import MarkersScreen from './screens/MarkersScreen';
import PolygonsScreen from './screens/PolygonsScreen';
import PolylinesScreen from './screens/PolylinesScreen';
import CirclesScreen from './screens/CirclesScreen';
import HeatmapScreen from './screens/HeatmapScreen';
import KmlLayerScreen from './screens/KmlLayerScreen';
import LocationScreen from './screens/LocationScreen';
import CustomStyleScreen from './screens/CustomStyleScreen';
import StressTestScreen from './screens/StressTestScreen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'react-native';
import BlankScreen from './screens/BlankScreen';
import IndoorLevelMapScreen from './screens/IndoorLevelMapScreen';
import CameraTestScreen from './screens/CameraTestScreen';
import type { RootStackParamList } from './types/navigation';
import SnapshotTestScreen from './screens/SnaptshotTestScreen';
import ClusteringScreen from './screens/ClsuteringScreen';
import SvgMarkersScreen from './screens/SvgMarkersScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const scheme = useColorScheme();
  return (
    <GestureHandlerRootView>
      <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={({ theme }) => ({
            headerShown: true,
            headerTitleAlign: 'center',
            headerStyle: { backgroundColor: theme.colors.card },
            headerTintColor: theme.colors.text,
            contentStyle: { backgroundColor: theme.colors.background },
          })}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Google Maps Examples' }}
          />
          <Stack.Screen
            name="Blank"
            component={BlankScreen}
            options={{ title: 'Blank Screen' }}
          />
          <Stack.Screen
            name="BasicMap"
            component={BasicMapScreen}
            options={{ title: 'Basic Map' }}
          />
          <Stack.Screen
            name="Markers"
            component={MarkersScreen}
            options={{ title: 'Markers' }}
          />
          <Stack.Screen
            name="SvgMarkers"
            component={SvgMarkersScreen}
            options={{ title: 'SVG Markers' }}
          />
          <Stack.Screen
            name="Polygons"
            component={PolygonsScreen}
            options={{ title: 'Polygons' }}
          />
          <Stack.Screen
            name="Polylines"
            component={PolylinesScreen}
            options={{ title: 'Polylines' }}
          />
          <Stack.Screen
            name="Circles"
            component={CirclesScreen}
            options={{ title: 'Circles' }}
          />
          <Stack.Screen
            name="Heatmap"
            component={HeatmapScreen}
            options={{ title: 'Heatmap' }}
          />
          <Stack.Screen
            name="KmlLayer"
            component={KmlLayerScreen}
            options={{ title: 'KML Layer' }}
          />
          <Stack.Screen
            name="Location"
            component={LocationScreen}
            options={{ title: 'Location & Permissions' }}
          />
          <Stack.Screen
            name="CustomStyle"
            component={CustomStyleScreen}
            options={{ title: 'Custom Map Style' }}
          />
          <Stack.Screen
            name="IndoorLevelMap"
            component={IndoorLevelMapScreen}
            options={{ title: 'Indoor level map' }}
          />
          <Stack.Screen
            name="Camera"
            component={CameraTestScreen}
            options={{ title: 'Camera test' }}
          />
          <Stack.Screen
            name="Snapshot"
            component={SnapshotTestScreen}
            options={{ title: 'Snapshot test' }}
          />
          <Stack.Screen
            name="Clustering"
            component={ClusteringScreen}
            options={{ title: 'Clustering test' }}
          />
          <Stack.Screen
            name="Stress"
            component={StressTestScreen}
            options={{ title: 'Stress test' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
