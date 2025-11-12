import { useMemo } from 'react';
import { callback } from 'react-native-nitro-modules';
export function useNitroCallback<T extends (...args: any[]) => void>(
  propCallback: T | undefined,
  fallback?: (...args: Parameters<T>) => void
) {
  return useMemo(() => {
    console.log('useNitroCallback');
    const fn = (...args: Parameters<T>) => {
      propCallback?.(...args);
      fallback?.(...args);
    };
    return callback(fn);
  }, [propCallback, fallback]);
}
