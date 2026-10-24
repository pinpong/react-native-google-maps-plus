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
import type { RootNavigationProp } from '@src/types/navigation';

import { examples } from '../../../docs/examples';

// The examples of the docs website, see docs/examples.
export default function DocsExamplesScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const theme = useAppTheme();
  const layout = useSafeAreaInsets();
  const styles = useMemo(() => getThemedStyles(theme, layout), [theme, layout]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {examples.map(({ id, title }) => (
        <ActionButton
          key={id}
          label={title}
          onPress={() => navigation.navigate('DocsExample', { id })}
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
