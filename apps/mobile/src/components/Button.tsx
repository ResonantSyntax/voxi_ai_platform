import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { color, HIT_TARGET, radius, textStyle } from '../theme/tokens';

type Variant = 'primary' | 'secondary' | 'agent';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  fullWidth?: boolean;
  disabled?: boolean;
  onPaper?: boolean;
}

// The Authorship Rule: flat mint = the Subscriber does it (primary). Outlined
// mint = Voxi does it (agent). Never a third mint. On a paper card, primary
// and secondary invert to paper's own ink instead of reaching for mint —
// paper is calm and neutral, not Voxi's colour.
export function Button({ label, onPress, variant = 'primary', fullWidth = true, disabled, onPaper = false }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && (onPaper ? styles.primaryOnPaper : styles.primary),
        variant === 'secondary' && (onPaper ? styles.secondaryOnPaper : styles.secondary),
        variant === 'agent' && styles.agent,
        fullWidth && { alignSelf: 'stretch' },
        disabled && { opacity: 0.4 },
        pressed && !disabled && { opacity: 0.85 },
      ]}
    >
      <Text
        style={[
          textStyle('button'),
          variant === 'primary' && { color: onPaper ? color.paper.base : color.surface.bg },
          variant === 'secondary' && { color: onPaper ? color.paper.ink : color.text.secondary },
          variant === 'agent' && { color: color.mint.base },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function DestructiveLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} hitSlop={8}>
      <Text style={[textStyle('bodyLg'), { color: color.text.danger }]}>{label}</Text>
    </Pressable>
  );
}

export function BackLink({ label, onPress, owned = false }: { label: string; onPress: () => void; owned?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={8} style={styles.backLink}>
      <Text style={[textStyle('bodyLg'), { color: owned ? color.mint.base : color.text.muted }]}>‹ {label}</Text>
    </Pressable>
  );
}

export function Disclosure({ children }: { children: ReactNode }) {
  return (
    <View style={styles.disclosureRow}>
      {children}
      <Text style={{ color: color.text.faint, fontSize: 17 }}>›</Text>
    </View>
  );
}

// A tappable row ending in the disclosure glyph — "‹ Back" is BackLink;
// this is its forward-pointing opposite, e.g. "Recent Conversations ›".
export function NavLink({ label, onPress, owned = false }: { label: string; onPress: () => void; owned?: boolean }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" hitSlop={8} style={styles.navLink}>
      <Text style={[textStyle('bodyLg'), { color: owned ? color.mint.base : color.text.primary }]}>{label}</Text>
      <Text style={{ color: color.text.faint, fontSize: 17 }}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: HIT_TARGET,
    borderRadius: radius.panel,
    paddingVertical: 17,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: color.mint.base,
  },
  primaryOnPaper: {
    backgroundColor: color.paper.ink,
  },
  secondary: {
    backgroundColor: color.surface.surface,
    borderWidth: 1,
    borderColor: color.line.default,
  },
  secondaryOnPaper: {
    backgroundColor: 'rgba(11,15,13,.08)',
  },
  agent: {
    backgroundColor: color.mint.tint,
    borderWidth: 1,
    borderColor: color.mint.line,
  },
  backLink: {
    minHeight: HIT_TARGET,
    justifyContent: 'center',
  },
  navLink: {
    minHeight: HIT_TARGET,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  disclosureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
