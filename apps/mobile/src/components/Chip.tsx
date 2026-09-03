import { StyleSheet, Text, View } from 'react-native';

import { color, radius, textStyle } from '../theme/tokens';
import type { CallOutcome, Channel } from '../data/types';

export function FactChip({ children }: { children: string }) {
  return (
    <View style={styles.factChip}>
      <Text style={[textStyle('bodySm'), { color: color.text.secondary }]}>{children}</Text>
    </View>
  );
}

const CHANNEL_LABEL: Record<Channel, string> = {
  phone_call: 'Phone Call',
  in_app_voice: 'In-app Voice',
  text_chat: 'Text Chat',
};

export function ChannelChip({ channel }: { channel: Channel }) {
  return <FactChip>{CHANNEL_LABEL[channel]}</FactChip>;
}

const OUTCOME_LABEL: Record<CallOutcome, string> = {
  handled: 'Handled',
  voicemail: 'Voicemail',
  unresolved: 'Unresolved',
  abandoned: 'Abandoned',
};

export function OutcomeChip({ outcome }: { outcome: CallOutcome }) {
  return <FactChip>{OUTCOME_LABEL[outcome]}</FactChip>;
}

const styles = StyleSheet.create({
  factChip: {
    backgroundColor: color.surface.surface,
    borderWidth: 1,
    borderColor: color.line.default,
    borderRadius: radius.sm,
    paddingVertical: 9,
    paddingHorizontal: 13,
    alignSelf: 'flex-start',
  },
});
