import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TodoProvider } from '@/contexts/TodoProvider';
import { UserProvider } from '@/contexts/UserProvider';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <UserProvider>
          <TodoProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
          </TodoProvider>
        </UserProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
