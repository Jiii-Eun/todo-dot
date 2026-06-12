import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthNavigation } from '@/components/AuthNavigation';
import { TodoProvider } from '@/contexts/TodoProvider';
import { UserProvider } from '@/contexts/UserProvider';
import {
  focusScreenOptions,
  mainScreenOptions,
  stackScreenOptions,
  welcomeScreenOptions,
} from '@/lib/navigation/transitions';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <UserProvider>
          <TodoProvider>
            <AuthNavigation />
            <StatusBar style="dark" />
            <Stack screenOptions={stackScreenOptions}>
              <Stack.Screen name="index" options={welcomeScreenOptions} />
              <Stack.Screen name="(main)" options={mainScreenOptions} />
              <Stack.Screen name="focus/[todoId]" options={focusScreenOptions} />
            </Stack>
          </TodoProvider>
        </UserProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
