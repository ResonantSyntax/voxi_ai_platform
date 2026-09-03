import { Stack } from 'expo-router';

import { color } from '../../../src/theme/tokens';

export default function SettingsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color.surface.bg },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="knowledge" />
    </Stack>
  );
}
