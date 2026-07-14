import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useBundlePlayer } from '@/features/player/hooks/use-bundle-player';
import { MusicPickerSheet } from '@/features/player/components/music-picker-sheet';
import { usePlayerStore } from '@/features/player/store/player-store';

type BundlePlayerScreenProps = {
  slug: string | null;
};

export function BundlePlayerScreen({ slug }: BundlePlayerScreenProps) {
  const router = useRouter();
  const theme = useTheme();
  const [isMusicPickerOpen, setIsMusicPickerOpen] = useState(false);
  const selectedMusicTrack = usePlayerStore((state) => state.selectedMusicTrack);
  const {
    isLoading,
    error,
    session,
    canGoNext,
    canGoPrevious,
    togglePlayback,
    goToNext,
    goToPrevious,
    restartBundle,
  } = useBundlePlayer(slug);

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/explore');
  }

  return (
    <AppScreen
      headerLeft={
        <Pressable onPress={handleBack} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundElement" style={styles.backButton}>
            <SymbolView name="chevron.left" tintColor={theme.text} size={18} />
          </ThemedView>
        </Pressable>
      }
      headerRight={
        <Pressable
          onPress={() => setIsMusicPickerOpen(true)}
          style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView
            type={selectedMusicTrack ? 'backgroundSelected' : 'backgroundElement'}
            style={styles.musicButton}>
            <SymbolView name="music.note" tintColor={theme.text} size={18} />
          </ThemedView>
        </Pressable>
      }
      eyebrow="Guided session"
      title={session.bundleTitle}
      description={
        session.bundleDescription ??
        'Move through this bundle one affirmation at a time in a calm, guided sequence.'
      }>
      {isLoading ? (
        <ThemedView type="backgroundElement" style={styles.stateCard}>
          <ThemedText themeColor="textSecondary">Preparing session...</ThemedText>
        </ThemedView>
      ) : null}

      {!isLoading && error ? (
        <ThemedView type="backgroundElement" style={styles.stateCard}>
          <ThemedText themeColor="textSecondary">{error}</ThemedText>
        </ThemedView>
      ) : null}

      {!isLoading && !error ? (
        <>
          <ThemedView type="backgroundElement" style={styles.playerCard}>
            <View style={styles.progressHeader}>
              <ThemedText type="smallBold">{session.progressLabel}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Bundle session
              </ThemedText>
            </View>
            <ThemedView type="backgroundSelected" style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.max(session.progressRatio * 100, 6)}%` },
                ]}
              />
            </ThemedView>
            <ThemedText style={styles.currentAffirmationText}>
              {session.currentText ?? 'No affirmation is available in this bundle yet.'}
            </ThemedText>
          </ThemedView>

          <ThemedView type="backgroundElement" style={styles.controlCard}>
            <View style={styles.controlRow}>
              <Pressable
                disabled={!canGoPrevious}
                onPress={goToPrevious}
                style={({ pressed }) => [
                  styles.controlButtonPressable,
                  !canGoPrevious && styles.controlButtonDisabled,
                  pressed && canGoPrevious && styles.pressed,
                ]}>
                <ThemedView type="backgroundSelected" style={styles.controlButton}>
                  <SymbolView name="backward.fill" tintColor={theme.text} size={18} />
                </ThemedView>
              </Pressable>

              <Pressable
                disabled={session.totalAffirmations === 0}
                onPress={togglePlayback}
                style={({ pressed }) => [
                  styles.controlButtonPressable,
                  session.totalAffirmations === 0 && styles.controlButtonDisabled,
                  pressed && session.totalAffirmations > 0 && styles.pressed,
                ]}>
                <ThemedView type="backgroundSelected" style={styles.playButton}>
                  <SymbolView
                    name={session.isPlaying ? 'pause.fill' : 'play.fill'}
                    tintColor={theme.text}
                    size={20}
                  />
                </ThemedView>
              </Pressable>

              <Pressable
                disabled={!canGoNext}
                onPress={goToNext}
                style={({ pressed }) => [
                  styles.controlButtonPressable,
                  !canGoNext && styles.controlButtonDisabled,
                  pressed && canGoNext && styles.pressed,
                ]}>
                <ThemedView type="backgroundSelected" style={styles.controlButton}>
                  <SymbolView name="forward.fill" tintColor={theme.text} size={18} />
                </ThemedView>
              </Pressable>
            </View>

            <View style={styles.secondaryActions}>
              <Pressable onPress={restartBundle} style={({ pressed }) => pressed && styles.pressed}>
                <ThemedText type="smallBold">Restart bundle</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </>
      ) : null}
      <MusicPickerSheet isOpen={isMusicPickerOpen} onClose={() => setIsMusicPickerOpen(false)} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  musicButton: {
    alignSelf: 'flex-end',
    borderRadius: 999,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  stateCard: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  playerCard: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.three,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.two,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#bf6c32',
  },
  currentAffirmationText: {
    fontSize: 28,
    lineHeight: 40,
  },
  controlCard: {
    borderRadius: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    gap: Spacing.three,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  controlButtonPressable: {
    borderRadius: 999,
  },
  controlButtonDisabled: {
    opacity: 0.4,
  },
  controlButton: {
    width: 52,
    height: 52,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
