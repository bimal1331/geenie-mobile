import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { parsePracticeTime } from '@/features/practice/services/practice-schedule';
import type { PracticeSlot } from '@/features/practice/types';

const REMINDER_IDS_STORAGE_KEY = 'geenie-practice-reminder-ids';
const ANDROID_CHANNEL_ID = 'practice-reminders';

type ReminderIdentifiers = Record<string, string[]>;

async function getReminderIdentifiers(): Promise<ReminderIdentifiers> {
  const value = await AsyncStorage.getItem(REMINDER_IDS_STORAGE_KEY);

  if (!value) {
    return {};
  }

  try {
    return JSON.parse(value) as ReminderIdentifiers;
  } catch {
    return {};
  }
}

async function setReminderIdentifiers(value: ReminderIdentifiers) {
  await AsyncStorage.setItem(REMINDER_IDS_STORAGE_KEY, JSON.stringify(value));
}

async function configureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Practice reminders',
    description: 'Gentle reminders for your scheduled Geenie practice.',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 180],
  });
}

function hasNotificationPermission(status: Notifications.NotificationPermissionsStatus) {
  if (Platform.OS !== 'ios') {
    return status.granted;
  }

  return (
    status.granted ||
    status.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL ||
    status.ios?.status === Notifications.IosAuthorizationStatus.EPHEMERAL
  );
}

export async function requestPracticeReminderPermission() {
  await configureAndroidChannel();
  const existing = await Notifications.getPermissionsAsync();

  if (hasNotificationPermission(existing)) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();

  return hasNotificationPermission(requested);
}

async function hasExistingPracticeReminderPermission() {
  await configureAndroidChannel();
  const status = await Notifications.getPermissionsAsync();

  return hasNotificationPermission(status);
}

async function cancelAllPracticeReminders() {
  const identifiers = await getReminderIdentifiers();

  await Promise.all(
    Object.values(identifiers)
      .flat()
      .map((identifier) => Notifications.cancelScheduledNotificationAsync(identifier)),
  );

  await setReminderIdentifiers({});
}

async function schedulePracticeSlot(slot: PracticeSlot) {
  const { hour, minute } = parsePracticeTime(slot.scheduledTime);
  const identifiers = await Promise.all(
    slot.weekdays.map((weekday) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: slot.label,
          body: `Your ${slot.bundle.title} practice is ready when you are.`,
          data: {
            url: `/bundles/${slot.bundle.slug}`,
            practiceSlotId: slot.id,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: weekday + 1,
          hour,
          minute,
          ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
        },
      }),
    ),
  );

  return identifiers;
}

/**
 * Local notifications are device-specific. Rebuild this small schedule from
 * the server-owned practice plan whenever the app receives a fresh plan.
 */
export async function syncPracticeReminders(practiceSlots: PracticeSlot[]) {
  await cancelAllPracticeReminders();

  if (!(await hasExistingPracticeReminderPermission())) {
    return;
  }

  const identifiers: ReminderIdentifiers = {};

  for (const slot of practiceSlots) {
    if (!slot.reminderEnabled) {
      continue;
    }

    identifiers[slot.id] = await schedulePracticeSlot(slot);
  }

  await setReminderIdentifiers(identifiers);
}

export async function clearPracticeReminders() {
  await cancelAllPracticeReminders();
}
