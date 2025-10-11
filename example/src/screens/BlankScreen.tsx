import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import type { RootNavigationProp } from '../types/navigation';

export default function BlankScreen() {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Blank Screen</Text>

      <Text style={[styles.subtitle, { color: colors.text }]}>
        This is an empty placeholder screen.
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.card }]}
        activeOpacity={0.8}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>
          ← Go Back
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 32,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
