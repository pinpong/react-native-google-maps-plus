import { useCallback, useLayoutEffect } from 'react';
import HeaderButton from '../components/HeaderButton';
import React from 'react';

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
