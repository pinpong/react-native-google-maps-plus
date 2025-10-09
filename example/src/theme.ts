import { useColorScheme } from 'react-native';

export const lightTheme = {
  bgPrimary: '#FFFFFF',
  bgAccent: '#3B82F6',
  bgHeader: '#E5E7EB',
  textPrimary: '#111827',
  textOnAccent: '#FFFFFF',
  shadow: '#000000',
};

export const darkTheme = {
  bgPrimary: '#1E1E1E',
  bgAccent: '#2D6BE9',
  bgHeader: '#2C2C2E',
  textPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',
  shadow: '#000000',
};

export type AppTheme = typeof lightTheme;

export function useAppTheme(): AppTheme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}
