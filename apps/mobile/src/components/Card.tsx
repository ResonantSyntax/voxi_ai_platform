import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { color, radius } from '../theme/tokens';

type Variant = 'dark' | 'paper' | 'live';

// Flat rooms only — no shadows inside the app frame. Depth is tonal.
// The Needs-You Rule: dark = passive/historical, paper = needs the
// Subscriber (Task or Input Request alike), live = Voxi active right now.
export function Card({ children, variant = 'dark' }: { children: ReactNode; variant?: Variant }) {
  return (
    <View style={[styles.card, variant === 'paper' && styles.paperCard, variant === 'live' && styles.liveCard]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface.surface,
    borderWidth: 1,
    borderColor: color.line.default,
    borderRadius: radius.panel,
    padding: 20,
  },
  paperCard: {
    backgroundColor: color.paper.base,
    borderWidth: 0,
    padding: 22,
  },
  liveCard: {
    backgroundColor: color.mint.base,
    borderWidth: 0,
    padding: 22,
  },
});
