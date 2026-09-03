import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChannelChip, OutcomeChip } from './Chip';
import { color, textStyle } from '../theme/tokens';
import type { Conversation } from '../data/types';

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function ConversationRow({ conversation, onPress }: { conversation: Conversation; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: color.surface.surface2 }]}>
      <View style={styles.top}>
        <Text style={[textStyle('bodyLg'), styles.participant]} numberOfLines={1}>
          {conversation.participantLabel}
        </Text>
        <Text style={[textStyle('meta'), styles.when]}>{formatWhen(conversation.startedAt)}</Text>
      </View>
      <Text style={[textStyle('bodySm'), styles.summary]} numberOfLines={2}>
        {conversation.summary}
      </Text>
      <View style={styles.chips}>
        <ChannelChip channel={conversation.channel} />
        {conversation.callOutcome && <OutcomeChip outcome={conversation.callOutcome} />}
        {conversation.degraded && (
          <Text style={[textStyle('bodySm'), styles.degraded]}>Degraded</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: color.line.subtle,
    gap: 7,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participant: {
    color: color.text.primary,
    flexShrink: 1,
  },
  when: {
    color: color.text.faint,
  },
  summary: {
    color: color.text.secondary,
  },
  chips: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 4,
    alignItems: 'center',
  },
  degraded: {
    color: color.text.danger,
  },
});
