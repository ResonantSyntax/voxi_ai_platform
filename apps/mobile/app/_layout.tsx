import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import FirstRunScreen from './first-run';
import { useAppStore } from '../src/state/useAppStore';
import { color } from '../src/theme/tokens';

export default function RootLayout() {
  const hasCompletedFirstRun = useAppStore((s) => s.hasCompletedFirstRun);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: color.surface.canvas }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        {hasCompletedFirstRun ? (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: color.surface.bg },
            }}
          >
            <Stack.Screen name="(tabs)" />
          </Stack>
        ) : (
          <FirstRunScreen />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
