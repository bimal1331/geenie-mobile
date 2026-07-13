import { usePathname, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePlayerStore } from '@/features/player/store/player-store';

export function MiniPlayerDock() {
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const activeBundleSlug = usePlayerStore((state) => state.activeBundleSlug);
  const bundleTitle = usePlayerStore((state) => state.bundleTitle);
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const togglePlayback = usePlayerStore((state) => state.togglePlayback);

  const currentItem = queue[currentIndex] ?? null;
  const isOnPlayerScreen = pathname.startsWith('/player/');

  if (!currentItem || isOnPlayerScreen) {
    return null;
  }

  function handleOpenPlayer() {
    if (!activeBundleSlug) {
      return;
    }

    router.push(`/player/${activeBundleSlug}`);
  }

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, Spacing.three),
        },
      ]}>
      <ThemedView type="backgroundElement" style={styles.dock}>
        <Pressable
          onPress={handleOpenPlayer}
          style={({ pressed }) => [styles.contentPressable, pressed && styles.pressed]}>
          <View style={styles.copyColumn}>
            <ThemedText type="smallBold" numberOfLines={1}>
              {bundleTitle ?? 'Now playing'}
            </ThemedText>
            <ThemedText themeColor="textSecondary" numberOfLines={1}>
              {currentItem.text}
            </ThemedText>
          </View>
        </Pressable>

        <Pressable
          hitSlop={10}
          onPress={togglePlayback}
          style={({ pressed }) => [
            styles.playButtonPressable,
            pressed && styles.pressed,
          ]}>
          <ThemedView type="backgroundSelected" style={styles.playButton}>
            <SymbolView
              name={isPlaying ? 'pause.fill' : 'play.fill'}
              tintColor={theme.text}
              size={18}
            />
          </ThemedView>
        </Pressable>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.three,
  },
  dock: {
    minHeight: 72,
    borderRadius: 22,
    paddingLeft: Spacing.four,
    paddingRight: Spacing.three,
    paddingVertical: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    shadowColor: '#000000',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    elevation: 8,
  },
  contentPressable: {
    flex: 1,
  },
  copyColumn: {
    gap: Spacing.one,
  },
  playButtonPressable: {
    borderRadius: 999,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.82,
  },
});
