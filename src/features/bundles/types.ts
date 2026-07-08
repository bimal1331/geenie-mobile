export type BundleMood = 'calm' | 'confidence' | 'sleep' | 'focus';

export type BundleSummary = {
  id: string;
  title: string;
  description: string;
  mood: BundleMood;
  durationLabel: string;
  affirmationCount: number;
  isPremium: boolean;
};
