import { StyleSheet, Text, View } from 'react-native';

import { Button } from './Button';
import { Card } from './Card';
import { SectionLabel } from './Label';
import { color, textStyle } from '../theme/tokens';
import type { QueueItem } from '../data/types';

interface QueueCardProps {
  item: QueueItem;
  onResolve: () => void;
  onOpenConversation: () => void;
}

// The Needs-You Rule: a Task and an Input Request are both "needs the
// Subscriber" — the same paper card, told apart only by the label.
export function QueueCard({ item, onResolve, onOpenConversation }: QueueCardProps) {
  const isInputRequest = item.kind === 'input_request';

  return (
    <Card variant="paper">
      <SectionLabel tone="paper">{isInputRequest ? 'Voxi needs an answer' : 'Yours to do'}</SectionLabel>
      <Text style={[textStyle('lead'), styles.subject]}>
        {isInputRequest ? item.question : item.title}
      </Text>
      <Text style={[textStyle('body'), styles.detail]}>{item.detail}</Text>
      <View style={styles.actions}>
        <Button label={isInputRequest ? 'Answer it' : 'Mark done'} onPress={onResolve} onPaper />
        <Button label="View Conversation" onPress={onOpenConversation} variant="secondary" onPaper />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  subject: {
    color: color.paper.ink,
    marginBottom: 7,
  },
  detail: {
    color: color.paper.inkMuted,
    marginBottom: 22,
  },
  actions: {
    gap: 11,
  },
});
