import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';

import { AppScreen } from '@/components/app-screen';
import { BottomSheetModal } from '@/components/bottom-sheet-modal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useBundles } from '@/features/bundles/hooks/use-bundles';
import type { BundleSummary } from '@/features/bundles/types';
import { usePracticeSlots } from '@/features/practice/hooks/use-practice-slots';
import {
  parsePracticeTime,
  WEEKDAY_LABELS,
} from '@/features/practice/services/practice-schedule';
import {
  deletePracticeSlot,
  createPracticeSlot,
  updatePracticeSlot,
} from '@/features/practice/services/practice-service';
import {
  requestPracticeReminderPermission,
  syncPracticeReminders,
} from '@/features/practice/services/practice-reminders';
import type { PracticeSlot, PracticeWeekday } from '@/features/practice/types';
import { useTheme } from '@/hooks/use-theme';

const DEFAULT_WEEKDAYS: PracticeWeekday[] = [0, 1, 2, 3, 4, 5, 6];

function timeToDate(value: string) {
  const { hour, minute } = parsePracticeTime(value);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

function dateToTime(value: Date) {
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}

type PracticeSlotScreenProps = {
  slotId: string;
};

export function PracticeSlotScreen({ slotId }: PracticeSlotScreenProps) {
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { practiceSlots, isLoading: isPracticeLoading, refresh } = usePracticeSlots();
  const { bundles, isLoading: isBundlesLoading } = useBundles();
  const existingSlot = slotId === 'new' ? null : practiceSlots.find((slot) => slot.id === slotId) ?? null;
  const [label, setLabel] = useState('Morning reset');
  const [scheduledTime, setScheduledTime] = useState('08:00');
  const [weekdays, setWeekdays] = useState<PracticeWeekday[]>(DEFAULT_WEEKDAYS);
  const [selectedBundle, setSelectedBundle] = useState<BundleSummary | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [isBundlePickerOpen, setIsBundlePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!existingSlot) return;
    setLabel(existingSlot.label);
    setScheduledTime(existingSlot.scheduledTime);
    setWeekdays(existingSlot.weekdays);
    setSelectedBundle(existingSlot.bundle);
    setReminderEnabled(existingSlot.reminderEnabled);
  }, [existingSlot]);

  useEffect(() => {
    if (slotId !== 'new' || selectedBundle || isBundlesLoading) return;
    setSelectedBundle(bundles.find((bundle) => !bundle.isLocked) ?? null);
  }, [bundles, isBundlesLoading, selectedBundle, slotId]);

  function toggleWeekday(weekday: PracticeWeekday) {
    setWeekdays((current) => {
      if (current.includes(weekday)) {
        return current.filter((value) => value !== weekday);
      }

      return [...current, weekday].sort((left, right) => left - right) as PracticeWeekday[];
    });
  }

  async function handleSave() {
    if (!selectedBundle) {
      setError('Choose a bundle for this practice.');
      return;
    }

    if (weekdays.length === 0) {
      setError('Choose at least one day for this practice.');
      return;
    }

    setIsSaving(true);
    setError(null);
    setNotice(null);
    let effectiveReminderEnabled = reminderEnabled;

    try {
      if (reminderEnabled && !(await requestPracticeReminderPermission())) {
        effectiveReminderEnabled = false;
        setReminderEnabled(false);
        setNotice('Practice saved without a reminder. You can enable Geenie notifications in system settings later.');
      }

      const input = {
        label,
        scheduledTime,
        weekdays,
        reminderEnabled: effectiveReminderEnabled,
        bundleId: selectedBundle.id,
      };
      if (existingSlot) {
        await updatePracticeSlot(existingSlot.id, input);
      } else {
        await createPracticeSlot(input);
      }

      const nextSlots = await refresh();
      await syncPracticeReminders(nextSlots);
      router.back();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to save this practice.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleDelete() {
    if (!existingSlot) return;
    Alert.alert('Delete this practice?', 'Its reminder will be removed from this device.', [
      { text: 'Keep practice', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setIsSaving(true);
            setError(null);
            try {
              await deletePracticeSlot(existingSlot.id);
              const nextSlots = await refresh();
              await syncPracticeReminders(nextSlots);
              router.back();
            } catch (caughtError) {
              setError(caughtError instanceof Error ? caughtError.message : 'Unable to delete this practice.');
            } finally {
              setIsSaving(false);
            }
          })();
        },
      },
    ]);
  }

  if (!isAuthLoading && !isAuthenticated) {
    return (
      <AppScreen title="Build your practice" description="Sign in to keep your practice synced across devices.">
        <Pressable onPress={() => router.replace('/profile')} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundSelected" style={styles.saveButton}>
            <ThemedText type="smallBold">Sign in to begin</ThemedText>
          </ThemedView>
        </Pressable>
      </AppScreen>
    );
  }

  if (slotId !== 'new' && isPracticeLoading) {
    return <AppScreen title="Your practice" description="Loading your practice..." />;
  }

  if (slotId !== 'new' && !existingSlot) {
    return <AppScreen title="Practice not found" description="This practice may have been deleted on another device." />;
  }

  return (
    <AppScreen
      headerLeft={
        <Pressable onPress={() => router.back()} style={({ pressed }) => pressed && styles.pressed}>
          <ThemedView type="backgroundElement" style={styles.backButton}>
            <SymbolView name="chevron.left" tintColor={theme.text} size={18} />
          </ThemedView>
        </Pressable>
      }
      title={existingSlot ? 'Edit your practice' : 'Build your practice'}
      description="Create a small moment for yourself.">
      <View style={styles.form}>
        <ThemedView type="backgroundElement" style={[styles.fieldCard, { borderColor: theme.borderSoft }]}>
          <ThemedText type="smallBold">Practice moment</ThemedText>
          <TextInput
            accessibilityLabel="Practice name"
            maxLength={80}
            onChangeText={setLabel}
            placeholder="Morning reset"
            placeholderTextColor={theme.textSecondary}
            style={[styles.textInput, { borderColor: theme.dividerSoft, color: theme.text }]}
            value={label}
          />
        </ThemedView>

        <ThemedView type="backgroundElement" style={[styles.fieldCard, { borderColor: theme.borderSoft }]}>
          <ThemedText type="smallBold">Time</ThemedText>
          <Pressable onPress={() => setIsTimePickerOpen((value) => !value)} style={({ pressed }) => pressed && styles.pressed}>
            <View style={styles.fieldRow}>
              <SymbolView name="clock" tintColor={theme.accentSecondary} size={18} />
              <ThemedText style={styles.fieldValue}>{new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(timeToDate(scheduledTime))}</ThemedText>
              <SymbolView name={isTimePickerOpen ? 'chevron.up' : 'chevron.down'} tintColor={theme.textSecondary} size={16} />
            </View>
          </Pressable>
          {isTimePickerOpen ? (
            <>
              <DateTimePicker
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                mode="time"
                onChange={(_event, value) => {
                  if (Platform.OS === 'android') setIsTimePickerOpen(false);
                  if (value) setScheduledTime(dateToTime(value));
                }}
                value={timeToDate(scheduledTime)}
              />
              {Platform.OS === 'ios' ? (
                <Pressable onPress={() => setIsTimePickerOpen(false)} style={({ pressed }) => pressed && styles.pressed}>
                  <ThemedText type="smallBold" style={{ color: theme.accentSecondary }}>Done</ThemedText>
                </Pressable>
              ) : null}
            </>
          ) : null}
        </ThemedView>

        <ThemedView type="backgroundElement" style={[styles.fieldCard, { borderColor: theme.borderSoft }]}>
          <ThemedText type="smallBold">Repeat</ThemedText>
          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((weekdayLabel, index) => {
              const weekday = index as PracticeWeekday;
              const isSelected = weekdays.includes(weekday);
              return (
                <Pressable key={weekdayLabel} onPress={() => toggleWeekday(weekday)} style={({ pressed }) => pressed && styles.pressed}>
                  <ThemedView type={isSelected ? 'backgroundSelected' : 'background'} style={styles.dayChip}>
                    <ThemedText type="smallBold">{weekdayLabel.slice(0, 1)}</ThemedText>
                  </ThemedView>
                </Pressable>
              );
            })}
          </View>
        </ThemedView>

        <ThemedView type="backgroundElement" style={[styles.fieldCard, { borderColor: theme.borderSoft }]}>
          <ThemedText type="smallBold">Bundle</ThemedText>
          <Pressable onPress={() => setIsBundlePickerOpen(true)} style={({ pressed }) => pressed && styles.pressed}>
            <View style={styles.bundleRow}>
              {selectedBundle?.coverImageUrl ? <Image contentFit="cover" source={{ uri: selectedBundle.coverImageUrl }} style={styles.bundleCover} /> : <ThemedView type="backgroundSelected" style={styles.bundleCover} />}
              <View style={styles.bundleCopy}>
                <ThemedText style={styles.fieldValue} numberOfLines={1}>{selectedBundle?.title ?? (isBundlesLoading ? 'Loading bundles...' : 'Choose a bundle')}</ThemedText>
                {selectedBundle ? <ThemedText themeColor="textSecondary" numberOfLines={1}>{selectedBundle.affirmationCount} affirmations</ThemedText> : null}
              </View>
              <SymbolView name="chevron.right" tintColor={theme.textSecondary} size={16} />
            </View>
          </Pressable>
        </ThemedView>

        <ThemedView type="backgroundElement" style={[styles.fieldCard, styles.reminderRow, { borderColor: theme.borderSoft }]}>
          <View style={styles.reminderCopy}>
            <ThemedText type="smallBold">Remind me</ThemedText>
            <ThemedText themeColor="textSecondary">A gentle reminder at your chosen time.</ThemedText>
          </View>
          <Switch
            onValueChange={setReminderEnabled}
            thumbColor={theme.onAccentText}
            trackColor={{ false: theme.backgroundSelected, true: theme.accentPrimary }}
            value={reminderEnabled}
          />
        </ThemedView>

        {notice ? <ThemedText themeColor="textSecondary">{notice}</ThemedText> : null}
        {error ? <ThemedText themeColor="textSecondary">{error}</ThemedText> : null}

        <Pressable disabled={isSaving} onPress={() => void handleSave()} style={({ pressed }) => [pressed && styles.pressed, isSaving && styles.disabled]}>
          <ThemedView type="backgroundSelected" style={styles.saveButton}>
            <ThemedText type="smallBold">{isSaving ? 'Saving...' : 'Save practice'}</ThemedText>
          </ThemedView>
        </Pressable>

        {existingSlot ? (
          <Pressable disabled={isSaving} onPress={handleDelete} style={({ pressed }) => pressed && styles.pressed}>
            <ThemedText type="smallBold" style={[styles.deleteLabel, { color: theme.accentSecondary }]}>Delete practice</ThemedText>
          </Pressable>
        ) : null}
      </View>

      <BottomSheetModal
        description="Choose an unlocked bundle to return to regularly."
        isOpen={isBundlePickerOpen}
        onClose={() => setIsBundlePickerOpen(false)}
        title="Choose a bundle">
        <ScrollView contentContainerStyle={styles.bundleList} showsVerticalScrollIndicator={false}>
          {bundles.map((bundle) => {
            const isSelected = bundle.id === selectedBundle?.id;
            return (
              <Pressable
                disabled={bundle.isLocked}
                key={bundle.id}
                onPress={() => {
                  setSelectedBundle(bundle);
                  setIsBundlePickerOpen(false);
                }}
                style={({ pressed }) => [pressed && styles.pressed, bundle.isLocked && styles.disabled]}>
                <ThemedView type={isSelected ? 'backgroundSelected' : 'background'} style={styles.bundleOption}>
                  {bundle.coverImageUrl ? <Image contentFit="cover" source={{ uri: bundle.coverImageUrl }} style={styles.bundleCover} /> : <ThemedView type="backgroundSelected" style={styles.bundleCover} />}
                  <View style={styles.bundleCopy}>
                    <ThemedText type="smallBold" numberOfLines={1}>{bundle.title}</ThemedText>
                    <ThemedText themeColor="textSecondary" numberOfLines={1}>{bundle.isLocked ? 'Premium required' : `${bundle.affirmationCount} affirmations`}</ThemedText>
                  </View>
                  {isSelected ? <SymbolView name="checkmark.circle.fill" tintColor={theme.text} size={19} /> : null}
                </ThemedView>
              </Pressable>
            );
          })}
        </ScrollView>
      </BottomSheetModal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.three },
  backButton: { width: 40, height: 40, borderRadius: 999, justifyContent: 'center', alignItems: 'center' },
  fieldCard: { borderRadius: Spacing.four, padding: Spacing.four, borderWidth: 1, gap: Spacing.two },
  textInput: { minHeight: 46, borderBottomWidth: StyleSheet.hairlineWidth, fontSize: 18, paddingVertical: Spacing.one },
  fieldRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  fieldValue: { flex: 1, fontSize: 20, lineHeight: 26 },
  weekdayRow: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.one },
  dayChip: { width: 36, height: 36, borderRadius: 999, justifyContent: 'center', alignItems: 'center' },
  bundleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  bundleCover: { width: 48, height: 48, borderRadius: Spacing.two },
  bundleCopy: { flex: 1, gap: Spacing.half },
  reminderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reminderCopy: { flex: 1, gap: Spacing.one, paddingRight: Spacing.three },
  saveButton: { minHeight: 52, borderRadius: 999, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.four },
  deleteLabel: { textAlign: 'center', paddingVertical: Spacing.two },
  bundleList: { gap: Spacing.two, paddingBottom: Spacing.six },
  bundleOption: { borderRadius: Spacing.three, padding: Spacing.two, flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.55 },
});
