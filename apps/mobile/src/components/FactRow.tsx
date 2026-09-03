import { StyleSheet, Text, View } from 'react-native';

import { color, textStyle } from '../theme/tokens';

export function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={[textStyle('bodySm'), styles.key]}>{label}</Text>
      <Text style={[textStyle('body'), styles.value]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: color.line.subtle,
  },
  key: {
    width: 74,
    color: color.text.faint,
  },
  value: {
    flex: 1,
    marginLeft: 18,
    color: color.text.primary,
  },
});
