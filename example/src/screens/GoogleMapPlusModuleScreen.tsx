import React, { useMemo } from 'react';

import { Alert, StyleSheet, View } from 'react-native';

import { GoogleMapsModule } from 'react-native-google-maps-plus';
import {
  type EdgeInsets,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import ActionButton from '@src/components/ActionButton';
import { useAppTheme } from '@src/hooks/useAppTheme';
import type { AppTheme } from '@src/theme';

export default function GoogleMapPlusModuleScreen() {
  const theme = useAppTheme();
  const layout = useSafeAreaInsets();
  const styles = useMemo(() => getThemedStyles(theme, layout), [theme, layout]);

  const actions = useMemo(
    () => [
      {
        label: 'Check google play available',
        onPress: () =>
          Alert.alert(
            `Available ${GoogleMapsModule.isGooglePlayServicesAvailable()}`
          ),
      },
      {
        label: 'Open location settings',
        onPress: () => GoogleMapsModule.openLocationSettings(),
      },
      {
        label: 'Request location permission',
        onPress: () => GoogleMapsModule.requestLocationPermission(),
      },
      {
        label: 'Show location enable dialog',
        onPress: () => GoogleMapsModule.showLocationDialog(),
      },
    ],
    []
  );

  return (
    <View style={styles.container}>
      {actions.map(({ label, onPress }) => (
        <ActionButton key={label} label={label} onPress={onPress} />
      ))}
    </View>
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
