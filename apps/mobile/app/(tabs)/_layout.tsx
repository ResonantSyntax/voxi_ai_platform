import { Tabs } from 'expo-router';

import { BottomNav } from '../../src/components/BottomNav';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomNav {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="(home)" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}
