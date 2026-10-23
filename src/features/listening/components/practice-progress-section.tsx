import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { getListeningHistory } from '@/features/listening/services/listening-history-service';
import { getLocalDateKey } from '@/features/listening/utils/local-date';
import { useTheme } from '@/hooks/use-theme';

export function PracticeProgressSection() {
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const [listeningDays, setListeningDays] = useState<string[]>([]);
  const week = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = new Date();

        date.setDate(date.getDate() - ((date.getDay() + 6) % 7) + index);
        return date;
      }),
    [],
  );

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setListeningDays([]);
      return;
    }

    const days = await getListeningHistory(
      getLocalDateKey(week[0]),
      getLocalDateKey(week[6]),
    );
    const datesWithPlays = days
      .filter((day) => day.plays.length > 0)
      .map((day) => day.date);

    setListeningDays(datesWithPlays);
  }, [isAuthenticated, week]);

  useFocusEffect(
    useCallback(() => {
      void refresh().catch(() => setListeningDays([]));
    }, [refresh]),
  );

  if (!isAuthenticated) {
    return null;
  }

  const played = new Set(listeningDays);

  return (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.title}>
        Your progress
      </ThemedText>

      <ThemedView
        type="backgroundElement"
        style={[
          styles.card,
          {
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.borderSoft,
          },
        ]}>
        <ThemedText themeColor="textSecondary">
          {played.size} listening {played.size === 1 ? 'day' : 'days'} this week
        </ThemedText>

        <View style={styles.week}>
          {week.map((date) => {
            const key = getLocalDateKey(date);
            const isPlayed = played.has(key);

            return (
              <View key={key} style={styles.day}>
                <View
                  style={[
                    styles.dot,
                    { borderColor: theme.borderSoft },
                    isPlayed && {
                      backgroundColor: theme.accentSecondary,
                      borderColor: theme.accentSecondary,
                    },
                  ]}>
                  <ThemedText
                    type="smallBold"
                    style={{ color: isPlayed ? theme.onAccentText : theme.text }}>
                    {date.toLocaleDateString(undefined, { weekday: 'narrow' })}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </View>

        <Pressable onPress={() => router.push('/practice-history')}>
          <ThemedText type="smallBold" style={{ color: theme.accentSecondary }}>
            View practice history ›
          </ThemedText>
        </Pressable>
      </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  card: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.four,
    borderWidth: 1,
  },
  title: {
    fontSize: 22,
    lineHeight: 27,
  },
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  day: {
    alignItems: 'center',
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
