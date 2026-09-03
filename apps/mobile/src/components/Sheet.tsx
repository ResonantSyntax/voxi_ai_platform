import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { color } from '../theme/tokens';

export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" accessibilityRole="button" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <View style={styles.handle} />
        {children}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: color.surface.surface,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderWidth: 1,
    borderColor: color.line.default,
    borderBottomWidth: 0,
    maxHeight: '78%',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: color.line.control,
    alignSelf: 'center',
    marginBottom: 18,
  },
});
