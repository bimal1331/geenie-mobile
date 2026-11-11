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
  const [viewedMonth, setViewedMonth] = useState(
    () => new Date(now.getFullYear(), now.getMonth(), 1),
  );
  const [days, setDays] = useState<ListeningHistoryDay[]>([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDateKey(now));
  const monthStart = useMemo(
    () => new Date(viewedMonth.getFullYear(), viewedMonth.getMonth(), 1),
    [viewedMonth],
  );
  const monthEnd = useMemo(
    () => new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + 1, 0),
    [viewedMonth],
  );

  const isCurrentMonth =
    viewedMonth.getFullYear() === now.getFullYear() &&
    viewedMonth.getMonth() === now.getMonth();

  const changeMonth = (offset: number) => {
    const nextMonth = new Date(
      viewedMonth.getFullYear(),
      viewedMonth.getMonth() + offset,
      1,
    );
    const selectedDayOfMonth = new Date(`${selectedDate}T12:00:00`).getDate();
    const lastDayOfNextMonth = new Date(
      nextMonth.getFullYear(),
      nextMonth.getMonth() + 1,
      0,
    ).getDate();

    setViewedMonth(nextMonth);
    setSelectedDate(
      getLocalDateKey(
        new Date(
          nextMonth.getFullYear(),
          nextMonth.getMonth(),
          Math.min(selectedDayOfMonth, lastDayOfNextMonth),
        ),
      ),
    );
  };

  useFocusEffect(
    useCallback(() => {
      let isCurrentRequest = true;

      setDays([]);
      void getListeningHistory(
        getLocalDateKey(monthStart),
        getLocalDateKey(monthEnd),
      )
        .then((history) => {
          if (isCurrentRequest) {
            setDays(history);
          }
        })
        .catch(() => {
          if (isCurrentRequest) {
            setDays([]);
          }
        });

      return () => {
        isCurrentRequest = false;
      };
    }, [monthEnd, monthStart]),
  );

  const selectedDay = days.find((day) => day.date === selectedDate);
  const dates = Array.from(
    { length: monthEnd.getDate() },
    (_, index) =>
      new Date(viewedMonth.getFullYear(), viewedMonth.getMonth(), index + 1),
  );
  const leadingEmptyDays = Array.from({ length: monthStart.getDay() });
  const playedDates = new Set(days.map((day) => day.date));
  const playsByBundle = new Map<string, string[]>();
  const monthlyBundleCounts = new Map<
    string,
    { id: string; title: string; listens: number }
  >();
  const totalListens = days.reduce((total, day) => total + day.plays.length, 0);

  days.forEach((day) => {
    day.plays.forEach((play) => {
      const bundle = monthlyBundleCounts.get(play.bundle.id) ?? {
        id: play.bundle.id,
        title: play.bundle.title,
        listens: 0,
      };

      bundle.listens += 1;
      monthlyBundleCounts.set(play.bundle.id, bundle);
    });
  });

  const topBundles = [...monthlyBundleCounts.values()]
    .sort((first, second) => {
      if (second.listens !== first.listens) {
        return second.listens - first.listens;
      }

      return first.title.localeCompare(second.title);
    })
    .slice(0, 5);

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
          styles.monthlySummary,
          {
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.borderSoft,
          },
        ]}>
        <ThemedText type="smallBold">
          {viewedMonth.toLocaleDateString(undefined, { month: 'long' })} at a
          glance
        </ThemedText>

        <View style={styles.statistics}>
          <View style={styles.statistic}>
            <ThemedText style={styles.statisticValue}>{days.length}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              {days.length === 1 ? 'Listening day' : 'Listening days'}
            </ThemedText>
          </View>
          <View style={styles.statistic}>
            <ThemedText style={styles.statisticValue}>{totalListens}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              {totalListens === 1 ? 'Total listen' : 'Total listens'}
            </ThemedText>
          </View>
        </View>

        {topBundles.length > 0 ? (
          <View style={[styles.topBundles, { borderColor: theme.borderSoft }]}>
            <ThemedText type="smallBold">Top bundles</ThemedText>

            {topBundles.map((bundle, index) => (
              <View key={bundle.id} style={styles.topBundleRow}>
                <ThemedText themeColor="textSecondary" type="smallBold">
                  {index + 1}
                </ThemedText>
                <ThemedText
                  numberOfLines={1}
                  style={styles.topBundleTitle}
                  type="smallBold">
                  {bundle.title}
                </ThemedText>
                <ThemedText themeColor="textSecondary" type="small">
                  {bundle.listens}{' '}
                  {bundle.listens === 1 ? 'listen' : 'listens'}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : null}
      </ThemedView>

      <ThemedView
        type="backgroundElement"
        style={[
          styles.calendar,
          {
            backgroundColor: theme.surfaceElevated,
            borderColor: theme.borderSoft,
          },
        ]}>
        <View style={styles.monthHeader}>
          <Pressable
            accessibilityLabel="Previous month"
            hitSlop={8}
            onPress={() => changeMonth(-1)}
            style={styles.monthButton}>
            <SymbolView
              name="chevron.left"
              size={18}
              tintColor={theme.text}
            />
          </Pressable>

          <ThemedText type="subtitle">
            {viewedMonth.toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric',
            })}
          </ThemedText>

          <Pressable
            accessibilityLabel="Next month"
            disabled={isCurrentMonth}
            hitSlop={8}
            onPress={() => changeMonth(1)}
            style={[
              styles.monthButton,
              isCurrentMonth && styles.monthButtonDisabled,
            ]}>
            <SymbolView
              name="chevron.right"
              size={18}
              tintColor={theme.text}
            />
          </Pressable>
        </View>

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
  monthlySummary: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
  },
  statistics: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  statistic: {
    flex: 1,
    gap: Spacing.half,
  },
  statisticValue: {
    fontSize: 28,
    fontWeight: 700,
    lineHeight: 34,
  },
  topBundles: {
    gap: Spacing.two,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
  },
  topBundleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  topBundleTitle: {
    flex: 1,
  },
  calendar: {
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Spacing.four,
    borderWidth: 1,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonDisabled: {
    opacity: 0.3,
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
