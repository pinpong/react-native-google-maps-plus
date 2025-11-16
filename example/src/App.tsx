import React from 'react';

import { StatusBar } from 'react-native';

import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAppTheme } from '@src/hooks/useAppTheme';
import BasicMapScreen from '@src/screens/BasicMapScreen';
import BlankScreen from '@src/screens/BlankScreen';
import CameraTestScreen from '@src/screens/CameraTestScreen';
import CirclesScreen from '@src/screens/CirclesScreen';
import ClusteringScreen from '@src/screens/ClsuteringScreen';
import CustomStyleScreen from '@src/screens/CustomStyleScreen';
import HeatmapScreen from '@src/screens/HeatmapScreen';
import HomeScreen from '@src/screens/HomeScreen';
import IndoorLevelMapScreen from '@src/screens/IndoorLevelMapScreen';
import KmlLayerScreen from '@src/screens/KmlLayerScreen';
import LocationScreen from '@src/screens/LocationScreen';
import MarkersScreen from '@src/screens/MarkersScreen';
import PolygonsScreen from '@src/screens/PolygonsScreen';
import PolylinesScreen from '@src/screens/PolylinesScreen';
import SnapshotTestScreen from '@src/screens/SnaptshotTestScreen';
import StressTestScreen from '@src/screens/StressTestScreen';
import SvgMarkersScreen from '@src/screens/SvgMarkersScreen';
import UrlTileOverlay from '@src/screens/UrlTileOverlay';
import type { RootStackParamList } from '@src/types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const appTheme = useAppTheme();
  const isDark = appTheme.theme === 'dark';

  return (
    <GestureHandlerRootView>
      <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor="transparent"
          translucent
        />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={({ theme }) => ({
            headerShown: true,
            headerTitleAlign: 'center',
            headerStyle: { backgroundColor: theme.colors.card },
            headerTintColor: theme.colors.text,
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
            name="UrlTileOverlay"
            component={UrlTileOverlay}
            options={{ title: 'Url Tile Overlay' }}
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
