import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { PlayerController } from '@/features/player/components/player-controller';

SplashScreen.preventAutoHideAsync();
void SplashScreen.hideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PlayerController />
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}
