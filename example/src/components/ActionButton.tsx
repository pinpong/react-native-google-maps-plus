import React, { useMemo } from 'react';

import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { useAppTheme } from '@src/hooks/useAppTheme';
import type { AppTheme } from '@src/theme';

type Props = {
  label: string;
  onPress: () => void;
};

export default function ActionButton({ label, onPress }: Props) {
  const theme = useAppTheme();
  const styles = useMemo(() => getThemedStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

const getThemedStyles = (theme: AppTheme) =>
  StyleSheet.create({
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
