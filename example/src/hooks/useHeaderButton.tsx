import { useCallback, useLayoutEffect } from 'react';
import React from 'react';

import HeaderButton from '@src/components/HeaderButton';

export function useHeaderButton(
  navigation: any,
  title: string,
  onPress: () => void
) {
  const renderHeaderButton = useCallback(
    () => <HeaderButton title={title} onPress={onPress} />,
    [title, onPress]
  );

  useLayoutEffect(() => {
    navigation.setOptions({ headerRight: renderHeaderButton });
  }, [navigation, renderHeaderButton]);
}
