import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackLink } from '../../../../src/components/Button';
import { Card } from '../../../../src/components/Card';
import { ChannelChip, OutcomeChip } from '../../../../src/components/Chip';
import { FactRow } from '../../../../src/components/FactRow';
import { TurnBubble } from '../../../../src/components/TurnBubble';
import { useAppStore } from '../../../../src/state/useAppStore';
import { color, textStyle } from '../../../../src/theme/tokens';

const CHANNEL_LABEL = { phone_call: 'Phone Call', in_app_voice: 'In-app Voice', text_chat: 'Text Chat' } as const;

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ConversationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const conversation = useAppStore((s) => s.conversations.find((c) => c.id === id));

  if (!conversation) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 18 }]}>
        <BackLink label="Back" onPress={() => router.back()} />
        <Text style={[textStyle('body'), { color: color.text.secondary, marginTop: 22 }]}>
          This Conversation is no longer available.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 18 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <BackLink label="Home" onPress={() => router.back()} />
      <Text style={[textStyle('speech'), styles.title]}>{conversation.participantLabel}</Text>

      <View style={styles.chips}>
        <ChannelChip channel={conversation.channel} />
        {conversation.callOutcome && <OutcomeChip outcome={conversation.callOutcome} />}
      </View>

      {conversation.degraded && (
        <Card>
          <Text style={[textStyle('bodySm'), { color: color.text.danger }]}>{conversation.degraded}</Text>
        </Card>
      )}

      <Text style={[textStyle('bodyLg'), styles.summary]}>{conversation.summary}</Text>

      <View style={styles.factRows}>
        <FactRow label="Channel" value={CHANNEL_LABEL[conversation.channel]} />
        <FactRow label="Started" value={formatWhen(conversation.startedAt)} />
        {conversation.enrichment !== 'completed' && <FactRow label="Status" value="Still processing" />}
      </View>

      <Text style={[textStyle('label'), styles.transcriptLabel]}>Transcript</Text>
      <View style={styles.transcript}>
        {conversation.transcript.map((turn) => (
          <TurnBubble key={turn.id} turn={turn} />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 26,
    backgroundColor: color.surface.bg,
  },
  content: {
    paddingBottom: 60,
  },
  title: {
    color: color.text.primary,
    marginTop: 11,
    marginBottom: 14,
  },
  chips: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 22,
  },
  summary: {
    color: color.text.secondary,
    marginBottom: 22,
  },
  factRows: {
    marginBottom: 26,
  },
  transcriptLabel: {
    color: color.text.tertiary,
    marginBottom: 14,
  },
  transcript: {
    gap: 14,
  },
});
