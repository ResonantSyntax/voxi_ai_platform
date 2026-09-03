import { StyleSheet, Text, View } from 'react-native';

import { Orb } from './Orb';
import { color, textStyle } from '../theme/tokens';

// The focal moment per the shape brief: the majority-time state, given equal
// design weight to the queue card — not a leftover screen. This is the proof
// nothing is being hidden, never a dead end.
export function EmptyState() {
  return (
    <View style={styles.container}>
      <Orb size={76} />
      <Text style={[textStyle('hero'), styles.title]}>Nothing needs you</Text>
      <Text style={[textStyle('bodyLg'), styles.body]}>
        Voxi is handling calls and messages on its own. You'll see something here the moment it isn't sure, or has
        something for you.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 26,
    gap: 22,
  },
  title: {
    color: color.text.primary,
    textAlign: 'center',
  },
  body: {
    color: color.text.secondary,
    textAlign: 'center',
  },
});
