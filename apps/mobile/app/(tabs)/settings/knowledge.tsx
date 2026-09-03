import { useRouter } from 'expo-router';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackLink, Button, DestructiveLink } from '../../../src/components/Button';
import { useAppStore } from '../../../src/state/useAppStore';
import { color, textStyle } from '../../../src/theme/tokens';
import type { KnowledgeDocument } from '../../../src/data/types';

// Business-tier only — Knowledge means Subscriber-uploaded documents used
// for retrieval (PRODUCT.md), distinct from Q&A and Rules on the web.
export default function KnowledgeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const documents = useAppStore((s) => s.knowledgeDocuments);
  const addDocument = useAppStore((s) => s.addKnowledgeDocument);
  const removeDocument = useAppStore((s) => s.removeKnowledgeDocument);

  const addFrom = (source: 'camera' | 'files') => {
    // Placeholder: wire expo-image-picker / expo-document-picker for the real capture flow.
    const doc: KnowledgeDocument = {
      id: `k${Date.now()}`,
      name: source === 'camera' ? 'Scanned document.jpg' : 'New document.pdf',
      addedAt: new Date().toISOString().slice(0, 10),
      sizeLabel: '—',
    };
    addDocument(doc);
  };

  const promptAdd = () => {
    Alert.alert('Add a document', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Take a photo', onPress: () => addFrom('camera') },
      { text: 'Choose a file', onPress: () => addFrom('files') },
    ]);
  };

  const promptRemove = (doc: KnowledgeDocument) => {
    Alert.alert(`Remove "${doc.name}"?`, 'Voxi will no longer use it to answer.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeDocument(doc.id) },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 18 }]}>
      <BackLink label="Settings" onPress={() => router.back()} />
      <Text style={[textStyle('display'), styles.title]}>Knowledge</Text>

      {documents.length === 0 ? (
        <Text style={[textStyle('body'), styles.empty]}>
          No documents yet. Add one and Voxi will use it to answer questions.
        </Text>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(d) => d.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={[textStyle('bodyLg'), styles.name]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[textStyle('meta'), styles.meta]}>
                  Added {item.addedAt} · {item.sizeLabel}
                </Text>
              </View>
              <DestructiveLink label="Remove" onPress={() => promptRemove(item)} />
            </View>
          )}
        />
      )}

      <View style={styles.addButton}>
        <Button label="Add a document" onPress={promptAdd} variant="agent" />
      </View>
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
  empty: {
    color: color.text.secondary,
    marginBottom: 22,
  },
  list: {
    paddingBottom: 22,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: color.line.subtle,
    gap: 14,
  },
  rowInfo: {
    flex: 1,
  },
  name: {
    color: color.text.primary,
  },
  meta: {
    color: color.text.faint,
    marginTop: 2,
  },
  addButton: {
    paddingVertical: 18,
  },
});
