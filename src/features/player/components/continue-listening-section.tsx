import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { getBundleDetail } from '@/features/bundles/services/bundle-service';
import { usePlayerStore } from '@/features/player/store/player-store';
import {
  clearContinueListeningProgress,
  getContinueListeningProgress,
  type ContinueListeningProgress,
} from '@/features/player/services/continue-listening-service';
import { usePlaybackSettings } from '@/features/settings/hooks/use-playback-settings';
import { useTheme } from '@/hooks/use-theme';

export function ContinueListeningSection() {
  const router = useRouter();
  const theme = useTheme();
  const { selectedVoice } = usePlaybackSettings();
  const playBundle = usePlayerStore((state) => state.playBundle);
  const activeBundleSlug = usePlayerStore((state) => state.activeBundleSlug);
  const queue = usePlayerStore((state) => state.queue);
  const currentIndex = usePlayerStore((state) => state.currentIndex);
  const [progress, setProgress] = useState<ContinueListeningProgress | null>(null);
  const [isResuming, setIsResuming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const savedProgress = await getContinueListeningProgress();
    setProgress(savedProgress);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  async function handleResume() {
    if (!progress) {
      return;
    }

    setIsResuming(true);
    setError(null);

    try {
      const bundle = await getBundleDetail(progress.bundleSlug, {
        languageCode: selectedVoice.languageCode,
        variantKey: selectedVoice.variantKey,
        providerVoiceId: selectedVoice.providerVoiceId,
      });

      if (bundle.isLocked) {
        router.push(`/bundles/${bundle.slug}`);
        return;
      }

      const playableItemCount = bundle.items.filter((item) => Boolean(item.audioUrl)).length;

      if (playableItemCount === 0) {
        await clearContinueListeningProgress();
        setProgress(null);
        return;
      }

      playBundle(bundle, Math.min(progress.currentIndex, playableItemCount - 1));
      router.push(`/player/${bundle.slug}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to resume this bundle.');
    } finally {
      setIsResuming(false);
    }
  }

  // The mini-player is the single resume control while this app session still has a bundle loaded.
  const hasActivePlayer = Boolean(activeBundleSlug && queue[currentIndex]);

  if (!progress || hasActivePlayer) {
    return null;
  }

  return (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>Continue listening</ThemedText>
      <ThemedView
        type="backgroundElement"
        style={[
          styles.card,
          { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSoft },
        ]}>
        <View style={styles.bundleRow}>
          {progress.bundleCoverImageUrl ? (
            <Image
              accessibilityLabel={`${progress.bundleTitle} cover image`}
              contentFit="cover"
              source={{ uri: progress.bundleCoverImageUrl }}
              style={styles.cover}
            />
          ) : (
            <ThemedView type="backgroundSelected" style={styles.cover}>
              <SymbolView name="sparkles" tintColor={theme.accentSecondary} size={22} />
            </ThemedView>
          )}
          <View style={styles.copy}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>
              PICK UP WHERE YOU LEFT OFF
            </ThemedText>
            <ThemedText type="subtitle" numberOfLines={2} style={styles.bundleTitle}>
              {progress.bundleTitle}
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              Affirmation {progress.currentIndex + 1} of {progress.totalAffirmations}
            </ThemedText>
          </View>
        </View>
        <Pressable
          disabled={isResuming}
          onPress={() => void handleResume()}
          style={({ pressed }) => [pressed && styles.pressed, isResuming && styles.disabled]}>
          <ThemedView type="backgroundSelected" style={styles.resumeButton}>
            <SymbolView name="play.fill" tintColor={theme.text} size={14} />
            <ThemedText type="smallBold">{isResuming ? 'Opening...' : 'Resume'}</ThemedText>
          </ThemedView>
        </Pressable>
        {error ? <ThemedText themeColor="textSecondary">{error}</ThemedText> : null}
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: Spacing.two },
  sectionTitle: { fontSize: 22, lineHeight: 27 },
  card: { borderRadius: Spacing.four, borderWidth: 1, padding: Spacing.four, gap: Spacing.three },
  bundleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  cover: { width: 82, height: 82, borderRadius: Spacing.three, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: Spacing.one },
  eyebrow: { fontSize: 10, letterSpacing: 1.1 },
  bundleTitle: { fontSize: 23, lineHeight: 28 },
  resumeButton: { minHeight: 50, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.two, paddingHorizontal: Spacing.four },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.58 },
});
