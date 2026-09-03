import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '../src/components/Button';
import { Orb } from '../src/components/Orb';
import { useAppStore } from '../src/state/useAppStore';
import { color, textStyle } from '../src/theme/tokens';

// First-run only confirms the Voxi Number is live and asks for notification
// permission — no forwarding or plan setup here, that stays on web.
export default function FirstRunScreen() {
  const insets = useSafeAreaInsets();
  const completeFirstRun = useAppStore((s) => s.completeFirstRun);
  const setNotificationsEnabled = useAppStore((s) => s.setNotificationsEnabled);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 26 }]}>
      <View style={styles.body}>
        <Orb size={76} />
        <Text style={[textStyle('hero'), styles.title]}>Your Voxi Number is live</Text>
        <Text style={[textStyle('bodyLg'), styles.subtitle]}>
          Voxi is already answering on <Text style={styles.number}>071 234 5678</Text>. Turn on notifications so
          you know the moment something needs you.
        </Text>
      </View>

      <View style={styles.actions}>
        <Button
          label="Enable notifications"
          onPress={() => {
            setNotificationsEnabled(true);
            completeFirstRun();
          }}
        />
        <Button label="Not now" variant="secondary" onPress={completeFirstRun} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 26,
    backgroundColor: color.surface.bg,
    justifyContent: 'space-between',
  },
  body: {
    alignItems: 'center',
    gap: 22,
    marginTop: 48,
  },
  title: {
    color: color.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    color: color.text.secondary,
    textAlign: 'center',
  },
  number: {
    color: color.text.primary,
    fontVariant: ['tabular-nums'],
  },
  actions: {
    gap: 11,
  },
});
