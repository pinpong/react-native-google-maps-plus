import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { GoogleMapsViewRef } from 'react-native-google-maps-plus';
import { useAppTheme } from '../hooks/useAppTheme';
import { useNavigation } from '@react-navigation/native';
import type { RootNavigationProp } from '../types/navigation';

export type ButtonItem = { title: string; onPress: () => void };

type Props = {
  mapRef: React.RefObject<GoogleMapsViewRef | null>;
  buttons: ButtonItem[];
};

export default function ControlPanel({ mapRef, buttons }: Props) {
  const theme = useAppTheme();
  const navigation = useNavigation<RootNavigationProp>();
  const progress = useSharedValue(0);
  const styles = useMemo(() => getThemedStyles(theme), [theme]);

  const toggle = () => {
    progress.value = withTiming(progress.value === 1 ? 0 : 1, {
      duration: 280,
    });
  };

  const finalButtons = useMemo(
    () => [
      ...buttons,
      {
        title: `Navigate to blank screen`,
        onPress: () => navigation.navigate('Blank'),
      },
      {
        title: 'Request location permission',
        onPress: async () => {
          const res = await mapRef.current?.requestLocationPermission();
          console.log('Permission result', res);
        },
      },
      {
        title: 'Show location dialog',
        onPress: () => console.log(mapRef.current?.showLocationDialog()),
      },
      {
        title: 'Open location settings',
        onPress: () => console.log(mapRef.current?.openLocationSettings()),
      },
      {
        title: 'Check Google Play Services',
        onPress: () =>
          console.log(
            'Google Play Services result',
            mapRef.current?.isGooglePlayServicesAvailable()
          ),
      },
    ],
    [buttons, mapRef, navigation]
  );

  const buttonHeight = 52;
  const maxHeight = finalButtons.length * buttonHeight;

  const containerStyle = useAnimatedStyle(() => ({
    height: interpolate(
      progress.value,
      [0, 1],
      [0, maxHeight],
      Extrapolation.CLAMP
    ),
    opacity: progress.value,
  }));

  const arrowStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg`,
      },
    ],
  }));

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      <TouchableOpacity
        style={styles.header}
        onPress={toggle}
        activeOpacity={0.8}
      >
        <Text style={styles.headerText}>Controls</Text>
        <Animated.Text style={[styles.arrow, arrowStyle]}>▼</Animated.Text>
      </TouchableOpacity>

      <Animated.View style={[styles.animatedContainer, containerStyle]}>
        <View style={styles.buttonList}>
          {finalButtons.map((btn, i) => (
            <TouchableOpacity
              key={i}
              style={styles.button}
              onPress={btn.onPress}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>{btn.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    scrollView: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 12,
      paddingTop: 12,
      backgroundColor: theme.bgPrimary,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    header: {
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: 'center',
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'center',
      backgroundColor: theme.bgHeader,
    },
    headerText: {
      fontWeight: '600',
      fontSize: 16,
      marginRight: 6,
      color: theme.textPrimary,
    },
    arrow: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    animatedContainer: {
      overflow: 'hidden',
    },
    buttonList: {
      gap: 8,
    },
    button: {
      backgroundColor: theme.bgAccent,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 1,
    },
    buttonText: {
      fontWeight: '600',
      fontSize: 15,
      color: theme.textOnAccent,
    },
  });
