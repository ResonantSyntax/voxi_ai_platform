import { StyleSheet, Text, View } from 'react-native';

import { color, textStyle } from '../theme/tokens';
import type { Turn } from '../data/types';

// The Asymmetric Tail Rule: a 6px corner on the speaker's side; a settled
// turn (nothing left to answer) is uniform 18px on all four corners.
export function TurnBubble({ turn }: { turn: Turn }) {
  const isSubscriber = turn.speaker === 'subscriber';
  const isVoxi = turn.speaker === 'voxi';

  const bubbleStyle = [
    styles.bubble,
    isSubscriber && styles.subscriber,
    isVoxi && !turn.settled && styles.voxi,
    turn.settled && styles.settled,
    { alignSelf: isSubscriber ? 'flex-end' : 'flex-start' } as const,
    turn.settled
      ? styles.radiusUniform
      : isSubscriber
        ? styles.radiusSubscriber
        : styles.radiusInbound,
  ];

  const textColor = turn.settled ? '#c6ea8e' : isSubscriber ? color.surface.bg : isVoxi ? color.mint.hover : color.text.primary;

  const label = turn.settled ? 'Sent' : isVoxi ? 'Voxi' : isSubscriber ? 'You' : 'Caller';
  const labelColor = turn.settled ? color.lime.base : isVoxi ? color.mint.base : color.text.tertiary;

  return (
    <View style={{ alignSelf: isSubscriber ? 'flex-end' : 'flex-start', maxWidth: '86%' }}>
      <Text style={[textStyle('label'), { color: labelColor, marginBottom: 4 }]}>{label}</Text>
      <View style={bubbleStyle}>
        <Text style={[textStyle('body'), { color: textColor }]}>{turn.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    paddingVertical: 13,
    paddingHorizontal: 16,
    backgroundColor: color.surface.surface,
    borderWidth: 1,
    borderColor: color.line.default,
  },
  voxi: {
    backgroundColor: 'rgba(10,239,154,.08)',
    borderColor: 'rgba(10,239,154,.22)',
  },
  subscriber: {
    backgroundColor: color.mint.base,
    borderColor: color.mint.base,
  },
  settled: {
    backgroundColor: color.lime.tint,
    borderColor: color.lime.line,
  },
  radiusInbound: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomRightRadius: 18,
    borderBottomLeftRadius: 6,
  },
  radiusSubscriber: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 6,
  },
  radiusUniform: {
    borderRadius: 18,
  },
});
