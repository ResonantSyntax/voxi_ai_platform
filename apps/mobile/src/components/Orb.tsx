import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, StyleSheet, View } from 'react-native';

import { color } from '../theme/tokens';

// Voxi's entire body: four vertical bars, no face, no avatar — DESIGN.md's
// signature component. Sizes: 44 in a header, 62 default, 76 on first-run.

const BAR_COLORS = [color.mint.base, color.mint.base, color.mint.hover, color.mint.deep] as const;
const BAR_HEIGHTS = [14, 24, 18, 9] as const;

export function Orb({ size = 62, active = true }: { size?: number; active?: boolean }) {
  const scales = useRef(BAR_HEIGHTS.map(() => new Animated.Value(0.6))).current;
  const scaleFactor = size / 62;

  useEffect(() => {
    let cancelled = false;
    let loops: Animated.CompositeAnimation[] = [];

    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled || reduced || !active) return;
      loops = scales.map((value, i) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(i * 200),
            Animated.timing(value, {
              toValue: 1,
              duration: 700,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(value, {
              toValue: 0.35,
              duration: 700,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        )
      );
      loops.forEach((l) => l.start());
    });

    return () => {
      cancelled = true;
      loops.forEach((l) => l.stop());
    };
  }, [active, scales]);

  return (
    <View
      style={[
        styles.face,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <View style={styles.bars}>
        {BAR_HEIGHTS.map((h, i) => (
          <Animated.View
            key={i}
            style={{
              width: 3 * scaleFactor,
              height: h * scaleFactor,
              borderRadius: 2,
              backgroundColor: BAR_COLORS[i],
              marginHorizontal: 2 * scaleFactor,
              transform: [{ scaleY: scales[i] }],
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  face: {
    backgroundColor: color.surface.surface,
    borderWidth: 1,
    borderColor: color.mint.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
