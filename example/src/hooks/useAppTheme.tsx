import { useColorScheme } from 'react-native';

import { type AppTheme, darkTheme, lightTheme } from '@src/theme';

export function useAppTheme(): AppTheme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}
