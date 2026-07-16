import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View, useColorScheme } from 'react-native';

import { AuthProvider } from '@/features/auth/components/auth-provider';
import { PlayerController } from '@/features/player/components/player-controller';
import { SettingsSyncProvider } from '@/features/settings/components/settings-sync-provider';

SplashScreen.preventAutoHideAsync();
void SplashScreen.hideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={styles.root}>
        <AuthProvider />
        <SettingsSyncProvider />
        <PlayerController />
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
