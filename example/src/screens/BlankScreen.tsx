import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootNavigationProp } from '../types/navigation';
import { useAppTheme } from '../hooks/useAppTheme';
import type { AppTheme } from '../theme';

export default function BlankScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const theme = useAppTheme();
  const styles = useMemo(() => getThemedStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blank Screen</Text>

      <Text style={styles.subtitle}>This is an empty placeholder screen.</Text>

      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.8}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const getThemedStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      backgroundColor: theme.bgPrimary,
    },
    title: {
      color: theme.textPrimary,
      fontSize: 24,
      fontWeight: '700',
      marginBottom: 8,
    },
    subtitle: {
      color: theme.textPrimary,
      fontSize: 16,
      opacity: 0.8,
      marginBottom: 32,
    },
    button: {
      color: theme.buttonBg,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 10,
    },
    buttonText: {
      color: theme.textPrimary,
      fontSize: 16,
      fontWeight: '500',
    },
  });
