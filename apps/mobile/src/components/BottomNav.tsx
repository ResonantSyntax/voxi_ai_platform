import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Orb } from './Orb';
import { color, textStyle } from '../theme/tokens';

// DESIGN.md's Navigation spec: two 64px text labels flanking the 62px orb.
// No icons, no pills, no underline — the label colour carries active state.
export function BottomNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const [home, settings] = state.routes;
  const homeFocused = state.index === 0;

  const go = (routeName: string, isFocused: boolean) => {
    const route = state.routes.find((r: (typeof state.routes)[number]) => r.name === routeName)!;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(routeName);
  };

  const label = (routeName: string, title: string, isFocused: boolean, owned: boolean) => {
    const route = state.routes.find((r: (typeof state.routes)[number]) => r.name === routeName)!;
    void descriptors[route.key].options;
    return (
      <Pressable
        onPress={() => go(routeName, isFocused)}
        style={styles.labelHit}
        accessibilityRole="button"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={title}
      >
        <Text
          style={[
            textStyle('meta'),
            styles.labelText,
            { color: isFocused ? (owned ? color.mint.base : color.text.primary) : color.text.muted },
          ]}
        >
          {title}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.scrim, { paddingBottom: Math.max(insets.bottom, 14) }]}>
      <View style={styles.row}>
        {label(home.name, 'Home', homeFocused, false)}
        <Pressable
          onPress={() => go(home.name, homeFocused)}
          accessibilityRole="button"
          accessibilityLabel="Home"
          hitSlop={8}
        >
          <Orb size={62} active={homeFocused} />
        </Pressable>
        {label(settings.name, 'Settings', !homeFocused, false)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    paddingTop: 14,
    paddingHorizontal: 34,
    backgroundColor: color.surface.bg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
  labelHit: {
    width: 64,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelText: {
    textAlign: 'center',
  },
});
