import { StyleSheet, Text } from 'react-native';

import { color, textStyle } from '../theme/tokens';

type Tone = 'dark' | 'darkOwned' | 'paper' | 'live';

const TONE_COLOR: Record<Tone, string> = {
  dark: color.text.tertiary,
  darkOwned: color.mint.base,
  paper: color.paper.inkMuted,
  live: color.mint.inkMuted,
};

// The uppercase 11px section label. Colour follows the surface it sits on —
// see DESIGN.md's Needs-You Rule — never mint for generic emphasis.
export function SectionLabel({ children, tone = 'dark' }: { children: string; tone?: Tone }) {
  return <Text style={[textStyle('label'), styles.label, { color: TONE_COLOR[tone] }]}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 7,
  },
});
