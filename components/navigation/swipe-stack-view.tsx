import { PropsWithChildren, useMemo } from 'react';
import { Platform, View } from 'react-native';
import { Directions, Gesture, GestureDetector } from 'react-native-gesture-handler';

import { router } from '@/lib/navigation/router';

export function SwipeStackView({ children }: PropsWithChildren) {
  const swipeGesture = useMemo(
    () =>
      Gesture.Fling()
        .runOnJS(true)
        .direction(Directions.RIGHT)
        .onEnd(() => {
          if (router.canGoBack()) {
            router.back();
          }
        }),
    [],
  );

  if (Platform.OS === 'web') {
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  return (
    <GestureDetector gesture={swipeGesture}>
      <View style={{ flex: 1 }} collapsable={false}>
        {children}
      </View>
    </GestureDetector>
  );
}

