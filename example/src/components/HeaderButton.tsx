import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useAppTheme } from '../theme';

type Props = {
  title: string;
  onPress: () => void;
};

export default function HeaderButton({ title, onPress }: Props) {
  const theme = useAppTheme();
  const styles = useMemo(() => getThemedStyles(theme), [theme]);

  return (
    <Pressable onPress={onPress} style={() => [styles.headerButton]}>
      <Text style={[styles.headerButtonText]}>{title}</Text>
    </Pressable>
  );
}

const getThemedStyles = (theme: any) =>
  StyleSheet.create({
    headerButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      marginRight: 12,
    },
    headerButtonText: {
      color: theme.textPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
  });
