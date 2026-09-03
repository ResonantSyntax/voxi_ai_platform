import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing } from 'react-native';

// The page-turn entrance: a fresh key remounts this wrapper, which slides
// and fades the new card in. Respects prefers-reduced-motion's RN analogue.
export function CardTurn({ children }: { children: ReactNode }) {
  const progress = useRef(new Animated.Value(0)).current;
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((value) => {
      if (!mounted) return;
      setReduced(value);
      if (value) {
        progress.setValue(1);
        return;
      }
      Animated.timing(progress, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={{
        opacity: progress,
        transform: reduced
          ? []
          : [
              {
                translateX: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [24, 0],
                }),
              },
            ],
      }}
    >
      {children}
    </Animated.View>
  );
}
