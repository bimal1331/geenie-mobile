import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { getBundleDetail } from '@/features/bundles/services/bundle-service';
import { useTodayListeningHistory } from '@/features/listening/hooks/use-today-listening-history';
import { usePlayerStore } from '@/features/player/store/player-store';
import { usePracticeSlots } from '@/features/practice/hooks/use-practice-slots';
import {
  formatNextPracticeDate,
  formatPracticeTime,
  getEarlierTodayPracticeSlots,
  getUpcomingPracticeSlots,
} from '@/features/practice/services/practice-schedule';
import type { PracticeSlot } from '@/features/practice/types';
import { usePlaybackSettings } from '@/features/settings/hooks/use-playback-settings';
import { useTheme } from '@/hooks/use-theme';

function PracticeCover({
  imageUrl,
  size,
}: {
  imageUrl: string | null;
  size: 'large' | 'small';
}) {
  const theme = useTheme();
  const style = size === 'large' ? styles.nextCover : styles.slotCover;

  if (imageUrl) {
    return <Image contentFit="cover" source={{ uri: imageUrl }} style={style} />;
  }

  return (
    <ThemedView type="backgroundSelected" style={[style, styles.placeholderCover]}>
      <SymbolView name="sparkles" tintColor={theme.accentSecondary} size={18} />
    </ThemedView>
  );
}

function PracticeRow({ slot, onPress }: { slot: PracticeSlot; onPress: () => void }) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView
        type="backgroundElement"
        style={[
          styles.slotRow,
          {
            backgroundColor: theme.surfacePanel,
            borderColor: theme.dividerSoft,
          },
        ]}>
        <PracticeCover imageUrl={slot.bundle.coverImageUrl} size="small" />
        <View style={styles.slotCopy}>
          <ThemedText type="smallBold" numberOfLines={1}>
            {slot.label}
          </ThemedText>
          <ThemedText themeColor="textSecondary" numberOfLines={1}>
            {slot.bundle.title} · {formatPracticeTime(slot.scheduledTime)}
          </ThemedText>
        </View>
        <SymbolView name="chevron.right" tintColor={theme.textSecondary} size={16} />
      </ThemedView>
    </Pressable>
  );
}

function EarlierPracticeCard({
  slot,
  isStarting,
  onPlay,
}: {
  slot: PracticeSlot;
  isStarting: boolean;
  onPlay: () => void;
}) {
  const theme = useTheme();

  return (
    <ThemedView
      type="backgroundElement"
      style={[
        styles.earlierPracticeCard,
        {
          backgroundColor: theme.backgroundSelected,
          borderColor: theme.dividerSoft,
        },
      ]}>
      <View style={styles.earlierPracticeRow}>
        <PracticeCover imageUrl={slot.bundle.coverImageUrl} size="small" />
        <View style={styles.slotCopy}>
          <ThemedText
            type="smallBold"
            style={[styles.eyebrow, { color: theme.accentSecondary }]}>
            MISSED PRACTICE
          </ThemedText>
          <ThemedText type="smallBold" numberOfLines={1}>
            {slot.label}
          </ThemedText>
          <ThemedText themeColor="textSecondary" numberOfLines={1}>
            {slot.bundle.title} · Scheduled {formatPracticeTime(slot.scheduledTime)}
          </ThemedText>
        </View>
      </View>

      <Pressable
        disabled={isStarting}
        onPress={onPlay}
        style={({ pressed }) => [
          pressed && styles.pressed,
          isStarting && styles.disabled,
        ]}>
        <ThemedView
          style={[
            styles.missedPracticeButton,
            { backgroundColor: theme.accentSecondary },
          ]}>
          <SymbolView name="play.fill" tintColor={theme.onAccentText} size={13} />
          <ThemedText type="smallBold" style={{ color: theme.onAccentText }}>
            {isStarting ? 'Starting...' : 'Listen now'}
          </ThemedText>
        </ThemedView>
      </Pressable>
    </ThemedView>
  );
}

export function DailyRhythmSection() {
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { practiceSlots, isLoading, error, refresh } = usePracticeSlots();
  const {
    plays: todayPlays,
    isAvailable: isTodayListeningHistoryAvailable,
    refresh: refreshTodayListeningHistory,
  } = useTodayListeningHistory();
  const { selectedVoice } = usePlaybackSettings();
  const playBundle = usePlayerStore((state) => state.playBundle);
  const [isStarting, setIsStarting] = useState(false);
  const [playError, setPlayError] = useState<string | null>(null);
  const now = new Date();

  useFocusEffect(
    useCallback(() => {
      void refresh();
      void refreshTodayListeningHistory();
    }, [refresh, refreshTodayListeningHistory]),
  );

  const upcomingPractices = getUpcomingPracticeSlots(practiceSlots, now);
  const nextPractice = upcomingPractices[0] ?? null;
  const laterPracticeSlots = upcomingPractices.slice(1, 3).map(({ slot }) => slot);
  const earlierTodayPracticeSlots = isTodayListeningHistoryAvailable
    ? getEarlierTodayPracticeSlots(practiceSlots, todayPlays, now)
    : [];
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
      setPlayError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Unable to start this practice.',
      );
    } finally {
      setIsStarting(false);
    }
  }

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <ThemedView
        type="backgroundElement"
        style={[
          styles.stateCard,
          {
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.borderSoft,
          },
        ]}>
        <ThemedText type="subtitle" style={styles.stateTitle}>
          Build a practice that stays with you
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Sign in to schedule bundles and receive gentle reminders at the times you choose.
        </ThemedText>
        <Pressable
          onPress={() => router.push('/profile')}
          style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundSelected" style={styles.secondaryButton}>
            <ThemedText type="smallBold">Sign in to begin</ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>
    );
  }

  if (isAuthenticated && isLoading) {
    return (
      <ThemedView
        type="backgroundElement"
        style={[styles.stateCard, { borderColor: theme.borderSoft }]}>
        <ThemedText themeColor="textSecondary">
          Loading your daily rhythm...
        </ThemedText>
      </ThemedView>
    );
  }

  if (isAuthenticated && !isLoading && error) {
    return (
      <ThemedView
        type="backgroundElement"
        style={[styles.stateCard, { borderColor: theme.borderSoft }]}>
        <ThemedText themeColor="textSecondary">{error}</ThemedText>
        <Pressable
          onPress={() => void refresh()}
          style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText type="smallBold" style={{ color: theme.accentSecondary }}>
            Try again
          </ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  if (isAuthenticated && !isLoading && !error && practiceSlots.length === 0) {
    return (
      <ThemedView
        type="backgroundElement"
        style={[
          styles.stateCard,
          {
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.borderSoft,
          },
        ]}>
        <ThemedText type="subtitle" style={styles.stateTitle}>
          Your daily rhythm
        </ThemedText>
        <ThemedText themeColor="textSecondary">
          Make a small space for affirmation listening—morning, midday, or whenever you need it.
        </ThemedText>
        <Pressable
          onPress={() => router.push('/practice/new')}
          style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundSelected" style={styles.primaryButton}>
            <SymbolView name="plus" tintColor={theme.text} size={16} />
            <ThemedText type="smallBold">Build your practice</ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>
    );
  }

  if (!isAuthenticated || isLoading || error || !nextPractice) {
    return null;
  }

  return (
    <View style={styles.rhythmSection}>
      <View style={styles.sectionHeading}>
        <ThemedText type="subtitle" style={styles.stateTitle}>
          Your daily rhythm
        </ThemedText>
        {canAddPractice ? (
          <Pressable
            onPress={() => router.push('/practice/new')}
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText type="smallBold" style={{ color: theme.accentSecondary }}>
              Add
            </ThemedText>
          </Pressable>
        ) : null}
      </View>

      {earlierTodayPracticeSlots.length > 0 ? (
        <View style={styles.earlierSection}>
          <ThemedText type="smallBold" style={styles.sectionLabel}>
            Missed today
          </ThemedText>
          {earlierTodayPracticeSlots.map((slot) => (
            <EarlierPracticeCard
              key={slot.id}
              slot={slot}
              isStarting={isStarting}
              onPlay={() => void handleStartPractice(slot)}
            />
          ))}
        </View>
      ) : null}

      <ThemedView
        type="backgroundElement"
        style={[
          styles.nextPracticeCard,
          {
            backgroundColor: theme.surfaceElevatedStrong,
            borderColor: theme.borderStrong,
          },
        ]}>
        <View style={styles.nextPractice}>
          <PracticeCover imageUrl={nextPractice.slot.bundle.coverImageUrl} size="large" />
          <View style={styles.nextCopy}>
            <ThemedText
              type="smallBold"
              themeColor="textSecondary"
              style={styles.eyebrow}>
              NEXT PRACTICE
            </ThemedText>
            <ThemedText type="subtitle" numberOfLines={2} style={styles.nextTitle}>
              {nextPractice.slot.label}
            </ThemedText>
            <ThemedText themeColor="textSecondary" numberOfLines={1}>
              {formatNextPracticeDate(nextPractice.date, now)} · {nextPractice.slot.bundle.title}
            </ThemedText>
          </View>
        </View>
        <Pressable
          disabled={isStarting}
          onPress={() => void handleStartPractice(nextPractice.slot)}
          style={({ pressed }) => [
            pressed && styles.pressed,
            isStarting && styles.disabled,
          ]}>
          <ThemedView type="backgroundSelected" style={styles.primaryButton}>
            <SymbolView name="play.fill" tintColor={theme.text} size={14} />
            <ThemedText type="smallBold">
              {isStarting ? 'Starting...' : 'Play now'}
            </ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>

      {playError ? (
        <ThemedText themeColor="textSecondary">{playError}</ThemedText>
      ) : null}

      {laterPracticeSlots.length > 0 ? (
        <View style={styles.laterSection}>
          <ThemedText type="smallBold" style={styles.sectionLabel}>
            Later in your rhythm
          </ThemedText>
          {laterPracticeSlots.map((slot) => (
            <PracticeRow
              key={slot.id}
              slot={slot}
              onPress={() => router.push(`/practice/${slot.id}`)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stateCard: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
  },
  rhythmSection: {
    gap: Spacing.three,
  },
  stateTitle: {
    fontSize: 22,
    lineHeight: 27,
  },
  sectionHeading: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  earlierSection: {
    gap: Spacing.two,
  },
  sectionLabel: {
    marginTop: Spacing.one,
    marginBottom: Spacing.one,
  },
  earlierPracticeCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  earlierPracticeRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
  },
  nextPractice: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
  },
  nextPracticeCard: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
  },
  nextCover: {
    width: 96,
    height: 96,
    borderRadius: Spacing.three,
  },
  slotCover: {
    width: 44,
    height: 44,
    borderRadius: Spacing.two,
  },
  placeholderCover: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  slotCopy: {
    flex: 1,
    gap: Spacing.half,
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.2,
  },
  nextTitle: {
    fontSize: 25,
    lineHeight: 30,
  },
  primaryButton: {
    minHeight: 50,
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    borderRadius: 999,
  },
  missedPracticeButton: {
    alignSelf: 'center',
    minWidth: '52%',
    minHeight: 42,
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: 999,
  },
  secondaryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 999,
  },
  laterSection: {
    gap: Spacing.two,
  },
  slotRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.58,
  },
});
