import type { PracticeSlot, PracticeWeekday } from '@/features/practice/types';

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

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
  return practiceSlots
    .map((slot) => ({ slot, date: getNextPracticeDate(slot, now) }))
    .filter((entry): entry is { slot: PracticeSlot; date: Date } => Boolean(entry.date))
    .sort((left, right) => left.date.getTime() - right.date.getTime())[0] ?? null;
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
