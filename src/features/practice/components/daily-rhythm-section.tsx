import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { getBundleDetail } from '@/features/bundles/services/bundle-service';
import { usePlayerStore } from '@/features/player/store/player-store';
import { usePracticeSlots } from '@/features/practice/hooks/use-practice-slots';
import {
  formatNextPracticeDate,
  formatPracticeTime,
  getNextPracticeSlot,
} from '@/features/practice/services/practice-schedule';
import type { PracticeSlot } from '@/features/practice/types';
import { usePlaybackSettings } from '@/features/settings/hooks/use-playback-settings';
import { useTheme } from '@/hooks/use-theme';

function PracticeRow({ slot, onPress }: { slot: PracticeSlot; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type="backgroundElement"
        style={[styles.slotRow, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSoft }]}>
        {slot.bundle.coverImageUrl ? (
          <Image contentFit="cover" source={{ uri: slot.bundle.coverImageUrl }} style={styles.slotCover} />
        ) : (
          <ThemedView type="backgroundSelected" style={styles.placeholderCover}>
            <SymbolView name="sparkles" tintColor={theme.accentSecondary} size={18} />
          </ThemedView>
        )}
        <View style={styles.slotCopy}>
          <ThemedText type="smallBold" numberOfLines={1}>{slot.label}</ThemedText>
          <ThemedText themeColor="textSecondary" numberOfLines={1}>
            {slot.bundle.title} · {formatPracticeTime(slot.scheduledTime)}
          </ThemedText>
        </View>
        <SymbolView name="chevron.right" tintColor={theme.textSecondary} size={16} />
      </ThemedView>
    </Pressable>
  );
}

export function DailyRhythmSection() {
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { practiceSlots, isLoading, error, refresh } = usePracticeSlots();
  const { selectedVoice } = usePlaybackSettings();
  const playBundle = usePlayerStore((state) => state.playBundle);
  const [isStarting, setIsStarting] = useState(false);
  const [playError, setPlayError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => { void refresh(); }, [refresh]));

  const nextPractice = useMemo(() => getNextPracticeSlot(practiceSlots), [practiceSlots]);
  const laterPracticeSlots = useMemo(
    () => practiceSlots.filter((slot) => slot.id !== nextPractice?.slot.id).slice(0, 2),
    [nextPractice?.slot.id, practiceSlots],
  );
  const canAddPractice = practiceSlots.length < 3;

  async function handleStartPractice(slot: PracticeSlot) {
    setIsStarting(true);
    setPlayError(null);

    try {
      const bundle = await getBundleDetail(slot.bundle.slug, {
        languageCode: selectedVoice.languageCode,
        variantKey: selectedVoice.variantKey,
        providerVoiceId: selectedVoice.providerVoiceId,
      });

      if (bundle.isLocked) {
        router.push(`/bundles/${bundle.slug}`);
        return;
      }

      playBundle(bundle);
      router.push(`/player/${bundle.slug}`);
    } catch (caughtError) {
      setPlayError(caughtError instanceof Error ? caughtError.message : 'Unable to start this practice.');
    } finally {
      setIsStarting(false);
    }
  }

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <ThemedView type="backgroundElement" style={[styles.stateCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSoft }]}>
        <ThemedText type="subtitle" style={styles.stateTitle}>Build a practice that stays with you</ThemedText>
        <ThemedText themeColor="textSecondary">Sign in to schedule bundles and receive gentle reminders at the times you choose.</ThemedText>
        <Pressable onPress={() => router.push('/profile')} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundSelected" style={styles.secondaryButton}>
            <ThemedText type="smallBold">Sign in to begin</ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>
    );
  }

  if (isAuthenticated && isLoading) {
    return (
      <ThemedView type="backgroundElement" style={[styles.stateCard, { borderColor: theme.borderSoft }]}>
        <ThemedText themeColor="textSecondary">Loading your daily rhythm...</ThemedText>
      </ThemedView>
    );
  }

  if (isAuthenticated && !isLoading && error) {
    return (
      <ThemedView type="backgroundElement" style={[styles.stateCard, { borderColor: theme.borderSoft }]}>
        <ThemedText themeColor="textSecondary">{error}</ThemedText>
        <Pressable onPress={() => void refresh()} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText type="smallBold" style={{ color: theme.accentSecondary }}>Try again</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (isAuthenticated && !isLoading && !error && practiceSlots.length === 0) {
    return (
      <ThemedView type="backgroundElement" style={[styles.stateCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSoft }]}>
        <ThemedText type="subtitle" style={styles.stateTitle}>Your daily rhythm</ThemedText>
        <ThemedText themeColor="textSecondary">Make a small space for affirmation listening—morning, midday, or whenever you need it.</ThemedText>
        <Pressable onPress={() => router.push('/practice/new')} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundSelected" style={styles.primaryButton}>
            <SymbolView name="plus" tintColor={theme.text} size={16} />
            <ThemedText type="smallBold">Build your practice</ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>
    );
  }

  if (!isAuthenticated || isLoading || error || !nextPractice) return null;

  return (
    <View style={styles.rhythmSection}>
      <View style={styles.sectionHeading}>
        <ThemedText type="subtitle" style={styles.stateTitle}>Your daily rhythm</ThemedText>
        {canAddPractice ? (
          <Pressable onPress={() => router.push('/practice/new')} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText type="smallBold" style={{ color: theme.accentSecondary }}>Add</ThemedText>
          </Pressable>
        ) : null}
      </View>
      <ThemedView
        type="backgroundElement"
        style={[styles.nextPracticeCard, { backgroundColor: theme.surfaceElevated, borderColor: theme.borderSoft }]}>
        <View style={styles.nextPractice}>
          {nextPractice.slot.bundle.coverImageUrl ? (
            <Image contentFit="cover" source={{ uri: nextPractice.slot.bundle.coverImageUrl }} style={styles.nextCover} />
          ) : <ThemedView type="backgroundSelected" style={styles.nextCover} />}
          <View style={styles.nextCopy}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.eyebrow}>NEXT PRACTICE</ThemedText>
            <ThemedText type="subtitle" numberOfLines={2} style={styles.nextTitle}>{nextPractice.slot.label}</ThemedText>
            <ThemedText themeColor="textSecondary" numberOfLines={1}>{formatNextPracticeDate(nextPractice.date)} · {nextPractice.slot.bundle.title}</ThemedText>
          </View>
        </View>
        <Pressable disabled={isStarting} onPress={() => void handleStartPractice(nextPractice.slot)} style={({ pressed }) => [pressed && styles.pressed, isStarting && styles.disabled]}>
          <ThemedView type="backgroundSelected" style={styles.primaryButton}>
            <SymbolView name="play.fill" tintColor={theme.text} size={14} />
            <ThemedText type="smallBold">{isStarting ? 'Starting...' : 'Play now'}</ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>
      {playError ? <ThemedText themeColor="textSecondary">{playError}</ThemedText> : null}
      {laterPracticeSlots.length > 0 ? (
        <View style={styles.laterSection}>
          <ThemedText type="smallBold" style={styles.laterTitle}>Later in your rhythm</ThemedText>
          {laterPracticeSlots.map((slot) => <PracticeRow key={slot.id} slot={slot} onPress={() => router.push(`/practice/${slot.id}`)} />)}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stateCard: { borderRadius: Spacing.four, padding: Spacing.four, borderWidth: 1, gap: Spacing.three },
  rhythmSection: { gap: Spacing.three },
  stateTitle: { fontSize: 28, lineHeight: 34 },
  sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.three },
  nextPractice: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center' },
  nextPracticeCard: { borderRadius: Spacing.four, borderWidth: 1, padding: Spacing.four, gap: Spacing.three },
  nextCover: { width: 96, height: 96, borderRadius: Spacing.three },
  nextCopy: { flex: 1, gap: Spacing.one },
  eyebrow: { fontSize: 11, letterSpacing: 1.2 },
  nextTitle: { fontSize: 25, lineHeight: 30 },
  primaryButton: { minHeight: 50, borderRadius: 999, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.two, paddingHorizontal: Spacing.four },
  secondaryButton: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  laterSection: { gap: Spacing.two },
  laterTitle: { marginTop: Spacing.one, marginBottom: Spacing.one },
  slotRow: { flexDirection: 'row', gap: Spacing.three, alignItems: 'center', padding: Spacing.three, borderWidth: 1, borderRadius: Spacing.three },
  slotCover: { width: 48, height: 48, borderRadius: Spacing.two },
  placeholderCover: { width: 48, height: 48, borderRadius: Spacing.two, alignItems: 'center', justifyContent: 'center' },
  slotCopy: { flex: 1, gap: Spacing.half },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.58 },
});
