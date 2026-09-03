import Constants from 'expo-constants';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DestructiveLink } from '../../../src/components/Button';
import { ListGroup, ListRow } from '../../../src/components/ListRow';
import { SectionLabel } from '../../../src/components/Label';
import { Sheet } from '../../../src/components/Sheet';
import { Toggle } from '../../../src/components/Toggle';
import { useAppStore } from '../../../src/state/useAppStore';
import { supabase } from '../../../utils/supabase';
import { color, textStyle } from '../../../src/theme/tokens';

const VOICE_OPTIONS = ['Amara', 'Kai', 'Noma'];

// Configure with the real web dashboard origin before shipping.
const WEB_DASHBOARD_URL = Constants.expoConfig?.extra?.webDashboardUrl ?? 'https://app.voxi.ai';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tier = useAppStore((s) => s.tier);
  const notificationsEnabled = useAppStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useAppStore((s) => s.setNotificationsEnabled);
  const voice = useAppStore((s) => s.voice);
  const setVoice = useAppStore((s) => s.setVoice);

  const [voiceSheetOpen, setVoiceSheetOpen] = useState(false);

  const isBusiness = tier === 'business';

  const openWebLink = (path: string) => {
    Linking.openURL(`${WEB_DASHBOARD_URL}${path}`).catch(() => {
      Alert.alert("Couldn't open the web dashboard", 'Try again from a browser.');
    });
  };

  const signOut = () => {
    Alert.alert('Sign out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          supabase.auth.signOut();
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 28 }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[textStyle('display'), styles.title]}>Settings</Text>

      <SectionLabel>Voxi</SectionLabel>
      <ListGroup>
        <ListRow
          first
          label="Notifications"
          trailing={<Toggle value={notificationsEnabled} onChange={setNotificationsEnabled} label="Notifications" />}
        />
        <ListRow
          label="Voice"
          onPress={() => setVoiceSheetOpen(true)}
          trailing={<Text style={[textStyle('body'), { color: color.text.muted }]}>{voice}</Text>}
          chevron
        />
        {isBusiness && <ListRow label="Knowledge" onPress={() => router.push('/settings/knowledge')} chevron />}
      </ListGroup>

      <SectionLabel>Account</SectionLabel>
      <ListGroup>
        <ListRow first label="Billing" onPress={() => openWebLink('/billing')} chevron />
        <ListRow label="Rules" onPress={() => openWebLink('/rules')} chevron />
        <ListRow label="Q&A" onPress={() => openWebLink('/qa')} chevron />
        <ListRow label="Voxi Number" onPress={() => openWebLink('/number')} chevron />
      </ListGroup>
      <Text style={[textStyle('meta'), styles.webNote]}>These open the web dashboard.</Text>

      <View style={styles.signOut}>
        <DestructiveLink label="Sign out" onPress={signOut} />
      </View>

      <Sheet visible={voiceSheetOpen} onClose={() => setVoiceSheetOpen(false)}>
        <Text style={[textStyle('lead'), { color: color.text.primary, marginBottom: 18 }]}>Voice</Text>
        {VOICE_OPTIONS.map((option) => {
          const selected = option === voice;
          return (
            <Pressable
              key={option}
              onPress={() => {
                setVoice(option);
                setVoiceSheetOpen(false);
              }}
              style={styles.voiceRow}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View style={[styles.radio, selected && styles.radioSelected]} />
              <Text style={[textStyle('bodyLg'), { color: color.text.primary }]}>{option}</Text>
            </Pressable>
          );
        })}
      </Sheet>
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
    gap: 7,
  },
  title: {
    color: color.text.primary,
    marginBottom: 22,
  },
  webNote: {
    color: color.text.faint,
    marginTop: 7,
    marginBottom: 14,
  },
  signOut: {
    marginTop: 22,
    alignItems: 'flex-start',
  },
  voiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: color.line.control,
  },
  radioSelected: {
    borderColor: color.mint.base,
    backgroundColor: color.mint.base,
  },
});
