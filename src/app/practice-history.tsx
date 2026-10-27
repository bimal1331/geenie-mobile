import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { AppScreen } from '@/components/app-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import {
  getListeningHistory,
  type ListeningHistoryDay,
} from '@/features/listening/services/listening-history-service';
import { getLocalDateKey } from '@/features/listening/utils/local-date';
import { useTheme } from '@/hooks/use-theme';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function PracticeHistoryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const now = useMemo(() => new Date(), []);
  const [days, setDays] = useState<ListeningHistoryDay[]>([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDateKey(now));
  const monthStart = useMemo(
    () => new Date(now.getFullYear(), now.getMonth(), 1),
    [now],
  );
  const monthEnd = useMemo(
    () => new Date(now.getFullYear(), now.getMonth() + 1, 0),
    [now],
  );

  useFocusEffect(
    useCallback(() => {
      void getListeningHistory(
        getLocalDateKey(monthStart),
        getLocalDateKey(monthEnd),
      )
        .then(setDays)
        .catch(() => setDays([]));
    }, [monthEnd, monthStart]),
  );

  const selectedDay = days.find((day) => day.date === selectedDate);
  const dates = Array.from(
    { length: monthEnd.getDate() },
    (_, index) => new Date(now.getFullYear(), now.getMonth(), index + 1),
  );
  const leadingEmptyDays = Array.from({ length: monthStart.getDay() });
  const playedDates = new Set(days.map((day) => day.date));
  const playsByBundle = new Map<string, string[]>();

  selectedDay?.plays.forEach((play) => {
    const times = playsByBundle.get(play.bundle.title) ?? [];

    times.push(
      new Date(play.playedAt).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      }),
    );
    playsByBundle.set(play.bundle.title, times);
  });

  return (
    <AppScreen
      headerLeft={
        <Pressable onPress={() => router.back()}>
          <SymbolView name="chevron.left" tintColor={theme.text} size={22} />
        </Pressable>
      }
      title="Practice history">
      <ThemedView
        type="backgroundElement"
        style={[
          styles.calendar,
          {
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.borderSoft,
          },
        ]}>
        <ThemedText type="subtitle">
          {now.toLocaleDateString(undefined, {
            month: 'long',
            year: 'numeric',
          })}
        </ThemedText>

        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((weekday) => (
            <ThemedText
              key={weekday}
              themeColor="textSecondary"
              type="smallBold"
              style={styles.weekdayLabel}
            >
              {weekday}
            </ThemedText>
          ))}
        </View>

        <View style={styles.grid}>
          {leadingEmptyDays.map((_, index) => (
            <View key={`empty-${index}`} style={styles.calendarCell} />
          ))}
          {dates.map((date) => {
            const key = getLocalDateKey(date);

            return (
              <View key={key} style={styles.calendarCell}>
                <Pressable
                  onPress={() => setSelectedDate(key)}
                  style={[
                    styles.date,
                    selectedDate === key && {
                      backgroundColor: theme.backgroundSelected,
                    },
                  ]}>
                  <ThemedText>{date.getDate()}</ThemedText>
                  {playedDates.has(key) ? (
                    <View
                      style={[
                        styles.marker,
                        { backgroundColor: theme.accentSecondary },
                      ]}
                    />
                  ) : null}
                </Pressable>
              </View>
            );
          })}
        </View>
      </ThemedView>

      <View style={styles.detail}>
        <ThemedText type="subtitle">
          {new Date(`${selectedDate}T12:00:00`).toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </ThemedText>

        {playsByBundle.size === 0 ? (
          <ThemedText themeColor="textSecondary">
            No bundles played on this day.
          </ThemedText>
        ) : (
          [...playsByBundle].map(([title, times]) => (
            <ThemedView
              key={title}
              type="backgroundElement"
              style={[
                styles.play,
                {
                  backgroundColor: theme.surfaceElevated,
                  borderColor: theme.borderSoft,
                },
              ]}>
              <ThemedText type="smallBold">{title}</ThemedText>
              <ThemedText themeColor="textSecondary">
                {times.length === 1
                  ? `Listened at ${times[0]}`
                  : `Listened ${times.length} times · ${times.join(', ')}`}
              </ThemedText>
            </ThemedView>
          ))
        )}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  calendar: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weekdayRow: {
    flexDirection: 'row',
  },
  weekdayLabel: {
    width: '14.2857%',
    textAlign: 'center',
  },
  calendarCell: {
    width: '14.2857%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: {
    width: 44,
    height: 44,
    gap: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  marker: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  detail: {
    gap: Spacing.three,
  },
  play: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.three,
    borderWidth: 1,
  },
});
