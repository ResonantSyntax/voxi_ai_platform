import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { color, radius, textStyle } from '../theme/tokens';

// A grouped list container: one 24px surface, rows divided by a 1px line,
// the first row's divider set to transparent so heights stay identical.
export function ListGroup({ children }: { children: ReactNode }) {
  return <View style={styles.group}>{children}</View>;
}

export function ListRow({
  label,
  first = false,
  onPress,
  trailing,
  chevron = false,
}: {
  label: string;
  first?: boolean;
  onPress?: () => void;
  trailing?: ReactNode;
  chevron?: boolean;
}) {
  const content = (
    <View style={[styles.row, { borderTopColor: first ? 'transparent' : color.line.default }]}>
      <Text style={[textStyle('bodyLg'), styles.label]}>{label}</Text>
      <View style={styles.trailingGroup}>
        {trailing}
        {chevron && <Text style={styles.chevron}>›</Text>}
      </View>
    </View>
  );

  if (!onPress) return content;

  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: {
    backgroundColor: color.surface.surface,
    borderRadius: radius.panel,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  label: {
    color: color.text.primary,
  },
  trailingGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  chevron: {
    color: color.text.faint,
    fontSize: 17,
  },
});
