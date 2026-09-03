import { useRouter } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackLink } from '../../../src/components/Button';
import { ConversationRow } from '../../../src/components/ConversationRow';
import { useAppStore } from '../../../src/state/useAppStore';
import { color, textStyle } from '../../../src/theme/tokens';

// Not web's exhaustive history — a short list, per the shape brief.
export default function RecentConversationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const conversations = useAppStore((s) => s.conversations);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 18 }]}>
      <BackLink label="Home" onPress={() => router.back()} />
      <Text style={[textStyle('display'), styles.title]}>Recent Conversations</Text>
      <FlatList
        data={conversations}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <ConversationRow conversation={item} onPress={() => router.push(`/conversation/${item.id}`)} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
    marginTop: 11,
    marginBottom: 22,
  },
  list: {
    paddingBottom: 34,
  },
});
