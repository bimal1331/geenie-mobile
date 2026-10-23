import type { PracticeSlot, PracticeWeekday } from '@/features/practice/types';

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export type ScheduledPractice = {
  slot: PracticeSlot;
  date: Date;
};

type BundlePlay = {
  bundle: {
    id: string;
  };
};

export function parsePracticeTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);

  if (!match) {
    return { hour: 8, minute: 0 };
  }

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

export function formatPracticeTime(value: string) {
  const { hour, minute } = parsePracticeTime(value);
  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function describePracticeDays(weekdays: PracticeWeekday[]) {
  if (weekdays.length === 7) {
    return 'Every day';
  }

  const weekdaySet = new Set(weekdays);
  if ([1, 2, 3, 4, 5].every((weekday) => weekdaySet.has(weekday as PracticeWeekday))) {
    return weekdays.length === 5 ? 'Weekdays' : weekdays.map((weekday) => WEEKDAY_LABELS[weekday]).join(', ');
  }

  if ([0, 6].every((weekday) => weekdaySet.has(weekday as PracticeWeekday))) {
    return weekdays.length === 2 ? 'Weekends' : weekdays.map((weekday) => WEEKDAY_LABELS[weekday]).join(', ');
  }

  return weekdays.map((weekday) => WEEKDAY_LABELS[weekday]).join(', ');
}

export function getNextPracticeDate(slot: PracticeSlot, now = new Date()) {
  const { hour, minute } = parsePracticeTime(slot.scheduledTime);
  const weekdays = new Set(slot.weekdays);

  for (let offset = 0; offset <= 7; offset += 1) {
    const candidate = new Date(now);
    candidate.setDate(now.getDate() + offset);
    candidate.setHours(hour, minute, 0, 0);

    if (weekdays.has(candidate.getDay() as PracticeWeekday) && candidate.getTime() > now.getTime()) {
      return candidate;
    }
  }

  return null;
}

export function getNextPracticeSlot(practiceSlots: PracticeSlot[], now = new Date()) {
  return getUpcomingPracticeSlots(practiceSlots, now)[0] ?? null;
}

export function getUpcomingPracticeSlots(
  practiceSlots: PracticeSlot[],
  now = new Date(),
): ScheduledPractice[] {
  return practiceSlots
    .map((slot) => ({ slot, date: getNextPracticeDate(slot, now) }))
    .filter((entry): entry is ScheduledPractice => Boolean(entry.date))
    .sort((left, right) => left.date.getTime() - right.date.getTime());
}

export function getEarlierTodayPracticeSlots(
  practiceSlots: PracticeSlot[],
  plays: BundlePlay[],
  now = new Date(),
): PracticeSlot[] {
  const scheduledToday = practiceSlots
    .filter((slot) => slot.weekdays.includes(now.getDay() as PracticeWeekday))
    .map((slot) => {
      const { hour, minute } = parsePracticeTime(slot.scheduledTime);
      const scheduledAt = new Date(now);

      scheduledAt.setHours(hour, minute, 0, 0);
      return { slot, scheduledAt };
    })
    .filter(({ scheduledAt }) => scheduledAt.getTime() <= now.getTime())
    .sort((left, right) => left.scheduledAt.getTime() - right.scheduledAt.getTime());
  const availablePlaysByBundle = new Map<string, number>();

  // A play can come from any app surface. When the same bundle is scheduled
  // more than once, allocate its same-day plays to those slots in time order.
  for (const play of plays) {
    const playCount = availablePlaysByBundle.get(play.bundle.id) ?? 0;

    availablePlaysByBundle.set(play.bundle.id, playCount + 1);
  }

  return scheduledToday.flatMap(({ slot }) => {
    const playCount = availablePlaysByBundle.get(slot.bundle.id) ?? 0;

    if (playCount === 0) {
      return [slot];
    }

    availablePlaysByBundle.set(slot.bundle.id, playCount - 1);
    return [];
  });
}

export function formatNextPracticeDate(date: Date, now = new Date()) {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const time = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);

  if (target.getTime() === today.getTime()) {
    return `Today · ${time}`;
  }

  if (target.getTime() === tomorrow.getTime()) {
    return `Tomorrow · ${time}`;
  }

  return `${new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(date)} · ${time}`;
}
