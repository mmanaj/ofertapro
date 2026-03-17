import 'react-native-get-random-values';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { TamaguiProvider } from 'tamagui';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { tamaguiConfig } from '../tamagui.config';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={tamaguiConfig}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
        </Stack>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
