import { Pressable, StyleSheet, View } from 'react-native';

import { color } from '../theme/tokens';

export function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}
      hitSlop={10}
      style={[styles.track, { backgroundColor: value ? color.mint.base : '#2c3733' }]}
    >
      <View style={[styles.knob, { backgroundColor: value ? color.surface.bg : color.text.tertiary, alignSelf: value ? 'flex-end' : 'flex-start' }]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 50,
    height: 30,
    borderRadius: 100,
    padding: 3,
    justifyContent: 'center',
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
