import { StyleSheet, Text, View } from 'react-native';

import { color, radius, textStyle } from '../theme/tokens';

// The Dead Circuit Rule: lime marks a closed line and is never tappable.
export function DoneBadge({ label }: { label: string }) {
  return (
    <View style={styles.badge}>
      <Text style={[textStyle('bodySm'), styles.text]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: color.lime.tint,
    borderWidth: 1,
    borderColor: color.lime.line,
    borderRadius: radius.panel,
    paddingVertical: 11,
    paddingHorizontal: 15,
    alignSelf: 'center',
  },
  text: {
    color: '#a3e54d',
  },
});
