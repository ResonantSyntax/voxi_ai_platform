import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NavLink } from '../../../src/components/Button';
import { CardTurn } from '../../../src/components/CardTurn';
import { DoneBadge } from '../../../src/components/DoneBadge';
import { EmptyState } from '../../../src/components/EmptyState';
import { QueueCard } from '../../../src/components/QueueCard';
import { useAppStore } from '../../../src/state/useAppStore';
import { color, textStyle } from '../../../src/theme/tokens';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queue = useAppStore((s) => s.queue);
  const resolveQueueItem = useAppStore((s) => s.resolveQueueItem);

  const current = queue[0];
  const remaining = queue.length - 1;

  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    if (!confirmingId) return;
    const timer = setTimeout(() => {
      resolveQueueItem(confirmingId);
      setConfirmingId(null);
    }, 650);
    return () => clearTimeout(timer);
  }, [confirmingId, resolveQueueItem]);

  const isConfirming = current && confirmingId === current.id;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 28 }]}>
      <Text style={[textStyle('display'), styles.title]}>Home</Text>

      <View style={styles.body}>
        {!current ? (
          <EmptyState />
        ) : (
          <CardTurn key={current.id}>
            {isConfirming ? (
              <View style={styles.confirmingCard}>
                <DoneBadge label={current.kind === 'input_request' ? 'Answered' : 'Done'} />
              </View>
            ) : (
              <QueueCard
                item={current}
                onResolve={() => setConfirmingId(current.id)}
                onOpenConversation={() => router.push(`/conversation/${current.conversationId}`)}
              />
            )}
            {remaining > 0 && (
              <Text style={[textStyle('meta'), styles.remaining]}>
                {remaining} more waiting
              </Text>
            )}
          </CardTurn>
        )}
      </View>

      <NavLink label="Recent Conversations" owned onPress={() => router.push('/recent')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 26,
    backgroundColor: color.surface.bg,
  },
  title: {
    color: color.text.primary,
    marginBottom: 22,
  },
  body: {
    flex: 1,
  },
  confirmingCard: {
    paddingVertical: 48,
  },
  remaining: {
    color: color.text.muted,
    textAlign: 'center',
    marginTop: 18,
  },
});
