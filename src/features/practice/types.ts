import type { BundleSummary } from '@/features/bundles/types';

export type PracticeWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type PracticeSlot = {
  id: string;
  label: string;
  scheduledTime: string;
  weekdays: PracticeWeekday[];
  reminderEnabled: boolean;
  bundle: BundleSummary;
  createdAt: string;
  updatedAt: string;
};

export type PracticeSlotInput = {
  label: string;
  scheduledTime: string;
  weekdays: PracticeWeekday[];
  reminderEnabled: boolean;
  bundleId: string;
};
