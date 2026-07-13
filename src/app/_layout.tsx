import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View, useColorScheme } from 'react-native';

import { MiniPlayerDock } from '@/features/player/components/mini-player-dock';
import { PlayerController } from '@/features/player/components/player-controller';

SplashScreen.preventAutoHideAsync();
void SplashScreen.hideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.root}>
        <PlayerController />
        <Stack screenOptions={{ headerShown: false }} />
        <MiniPlayerDock />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
